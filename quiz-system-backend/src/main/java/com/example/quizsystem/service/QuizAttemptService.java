package com.example.quizsystem.service;

import com.example.quizsystem.model.Quiz;
import com.example.quizsystem.model.QuizAttempt;
import com.example.quizsystem.model.User;
import com.example.quizsystem.repository.QuizAttemptRepository;
import com.example.quizsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.quizsystem.model.LeaderboardEntry;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuizAttemptService {

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizService quizService;

    public QuizAttempt startQuizAttempt(String userId, String quizId) {
        QuizAttempt attempt = new QuizAttempt();
        attempt.setUserId(userId);
        attempt.setQuizId(quizId);
        attempt.setStartedAt(LocalDateTime.now());
        return quizAttemptRepository.save(attempt);
    }

    public QuizAttempt submitQuizAttempt(String attemptId, Map<String, Integer> answers) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId).orElse(null);
        if (attempt != null) {
            attempt.setAnswers(answers);
            attempt.setScore(calculateScore(attempt));
            attempt.setCompletedAt(LocalDateTime.now());
            return quizAttemptRepository.save(attempt);
        }
        return null;
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