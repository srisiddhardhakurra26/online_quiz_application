package com.example.quizsystem.service;

import com.example.quizsystem.model.Quiz;
import com.example.quizsystem.model.QuizAttempt;
import com.example.quizsystem.model.User;
import com.example.quizsystem.repository.QuizAttemptRepository;
import com.example.quizsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.example.quizsystem.model.LeaderboardEntry;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuizAttemptService {

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizService quizService;

    public QuizAttempt startQuizAttempt(String userId, String quizId, Integer timeLimit) {
        // First check if user has any completed attempts
        Optional<QuizAttempt> lastAttempt = quizAttemptRepository
                .findFirstByUserIdAndQuizIdOrderByStartedAtDesc(userId, quizId);

        if (lastAttempt.isPresent()) {
            QuizAttempt attempt = lastAttempt.get();
            // If the last attempt is completed, prevent new attempts
            if (!attempt.isActive() && attempt.getCompletedAt() != null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Quiz already attempted. Multiple attempts are not allowed."
                );
            }
        }

        // Check for any existing active attempt for this specific user
        Optional<QuizAttempt> existingActiveAttempt = quizAttemptRepository
                .findByUserIdAndQuizIdAndIsActive(userId, quizId, true);

        if (existingActiveAttempt.isPresent()) {
            QuizAttempt attempt = existingActiveAttempt.get();
            // Calculate remaining time for this specific attempt
            long elapsedSeconds = ChronoUnit.SECONDS.between(
                    attempt.getStartedAt(),
                    LocalDateTime.now()
            );
            int remainingTime = attempt.getTimeLimit() - (int) elapsedSeconds;

            if (remainingTime > 0) {
                attempt.setTimeRemaining(remainingTime);
                return quizAttemptRepository.save(attempt);
            } else {
                // Mark this attempt as completed if time is up
                markAttemptAsCompleted(attempt);
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Previous attempt has expired. Multiple attempts are not allowed."
                );
            }
        }

        // Create new attempt
        QuizAttempt newAttempt = new QuizAttempt();
        newAttempt.setUserId(userId);
        newAttempt.setQuizId(quizId);
        newAttempt.setStartedAt(LocalDateTime.now());
        newAttempt.setTimeLimit(timeLimit);
        newAttempt.setTimeRemaining(timeLimit);
        newAttempt.setActive(true);
        return quizAttemptRepository.save(newAttempt);
    }

    public Integer getRemainingTime(String attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Attempt not found"
                ));

        if (!attempt.isActive()) {
            return 0;
        }

        long elapsedSeconds = ChronoUnit.SECONDS.between(
                attempt.getStartedAt(),
                LocalDateTime.now()
        );
        int remainingTime = attempt.getTimeLimit() - (int) elapsedSeconds;

        if (remainingTime <= 0) {
            markAttemptAsCompleted(attempt);
            return 0;
        }

        attempt.setTimeRemaining(remainingTime);
        quizAttemptRepository.save(attempt);
        return remainingTime;
    }

    private void markAttemptAsCompleted(QuizAttempt attempt) {
        attempt.setActive(false);
        attempt.setTimeRemaining(0);
        attempt.setCompletedAt(LocalDateTime.now());
        if (attempt.getAnswers() == null) {
            attempt.setAnswers(new HashMap<>());
        }
        attempt.setScore(0); // Set score to 0 for expired attempts
        quizAttemptRepository.save(attempt);
    }

    public QuizAttempt submitQuizAttempt(String attemptId, Map<String, Integer> answers) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Attempt not found"
                ));

        if (!attempt.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quiz attempt is no longer active. The time has expired or it was already submitted."
            );
        }

        int remainingTime = getRemainingTime(attemptId);
        if (remainingTime <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quiz time has expired"
            );
        }

        attempt.setAnswers(answers);
        attempt.setScore(calculateScore(attempt));
        attempt.setActive(false);
        attempt.setCompletedAt(LocalDateTime.now());
        return quizAttemptRepository.save(attempt);
    }

    public boolean hasAttemptedQuiz(String userId, String quizId) {
        Optional<QuizAttempt> lastAttempt = quizAttemptRepository
                .findFirstByUserIdAndQuizIdOrderByStartedAtDesc(userId, quizId);

        return lastAttempt.isPresent() && !lastAttempt.get().isActive();
    }

    private int calculateScore(QuizAttempt attempt) {
        Quiz quiz = quizService.getQuizById(attempt.getQuizId());
        if (quiz == null) return 0;

        int score = 0;
        for (Quiz.Question question : quiz.getQuestions()) {
            Integer selectedOption = attempt.getAnswers().get(question.getId());
            if (selectedOption != null && selectedOption == question.getCorrectOptionIndex()) {
                score++;
            }
        }
        return score;
    }

    public List<QuizAttempt> getAttemptsByUser(String userId) {
        return quizAttemptRepository.findByUserId(userId);
    }

    public List<QuizAttempt> getAttemptsByQuiz(String quizId) {
        return quizAttemptRepository.findByQuizId(quizId);
    }

    public boolean canStartNewAttempt(String userId, String quizId) {
        QuizAttempt lastAttempt = quizAttemptRepository
                .findFirstByUserIdAndQuizIdOrderByStartedAtDesc(userId, quizId)
                .orElse(null);

        if (lastAttempt == null) {
            return true;
        }

        // If there's an active attempt, check if it's expired
        if (lastAttempt.isActive()) {
            int remainingTime = getRemainingTime(lastAttempt.getId());
            return remainingTime <= 0;
        }

        // If the last attempt is completed, user can start a new one
        return true;
    }

    public List<LeaderboardEntry> getGlobalLeaderboard() {
        List<QuizAttempt> allAttempts = quizAttemptRepository.findAll();
        Map<String, List<QuizAttempt>> attemptsByUser = allAttempts.stream()
                .collect(Collectors.groupingBy(QuizAttempt::getUserId));

        return attemptsByUser.entrySet().stream()
                .map(entry -> {
                    String userId = entry.getKey();
                    List<QuizAttempt> userAttempts = entry.getValue();
                    User user = userRepository.findById(userId).orElse(null);

                    LeaderboardEntry leaderboardEntry = new LeaderboardEntry();
                    leaderboardEntry.setUserId(userId);
                    leaderboardEntry.setUsername(user != null ? user.getUsername() : "Unknown");
                    leaderboardEntry.setTotalScore(userAttempts.stream().mapToInt(QuizAttempt::getScore).sum());
                    leaderboardEntry.setQuizzesTaken(userAttempts.size());

                    return leaderboardEntry;
                })
                .sorted((e1, e2) -> Integer.compare(e2.getTotalScore(), e1.getTotalScore()))
                .collect(Collectors.toList());
    }

    public List<LeaderboardEntry> getQuizLeaderboard(String quizId) {
        List<QuizAttempt> quizAttempts = quizAttemptRepository.findByQuizId(quizId);
        Map<String, List<QuizAttempt>> attemptsByUser = quizAttempts.stream()
                .collect(Collectors.groupingBy(QuizAttempt::getUserId));

        return attemptsByUser.entrySet().stream()
                .map(entry -> {
                    String userId = entry.getKey();
                    List<QuizAttempt> userAttempts = entry.getValue();
                    User user = userRepository.findById(userId).orElse(null);

                    LeaderboardEntry leaderboardEntry = new LeaderboardEntry();
                    leaderboardEntry.setUserId(userId);
                    leaderboardEntry.setUsername(user != null ? user.getUsername() : "Unknown");
                    leaderboardEntry.setTotalScore(userAttempts.stream().mapToInt(QuizAttempt::getScore).sum());
                    leaderboardEntry.setQuizzesTaken(userAttempts.size());

                    return leaderboardEntry;
                })
                .sorted((e1, e2) -> Integer.compare(e2.getTotalScore(), e1.getTotalScore()))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getUserAttemptDetails(String userId) {
        List<QuizAttempt> attempts = getAttemptsByUser(userId);
        List<Quiz> createdQuizzes = quizService.getQuizzesByCreator(userId);

        Map<String, Object> details = new HashMap<>();
        details.put("totalQuizzesTaken", attempts.size());
        details.put("recentAttempts", attempts.stream().limit(5).collect(Collectors.toList()));
        details.put("createdQuizzes", createdQuizzes);

        return details;
    }
}