package com.example.quizsystem.service;

import com.example.quizsystem.model.Quiz;
import com.example.quizsystem.dto.QuizSubmissionDTO;
import com.example.quizsystem.dto.QuizStatsDTO;
import com.example.quizsystem.model.QuizAttempt;
import com.example.quizsystem.model.QuizStats;
import com.example.quizsystem.model.User;
import com.example.quizsystem.repository.QuizAttemptRepository;
import com.example.quizsystem.repository.QuizRepository;
import com.example.quizsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class QuizService {

    private final QuizRepository quizRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    public QuizService(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public Quiz getQuizById(String id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        return quiz;
    }

    public Quiz createQuiz(Quiz quiz, String creatorId) {
        LocalDateTime now = LocalDateTime.now();
        quiz.setCreatedAt(now);
        quiz.setUpdatedAt(now);
        quiz.setCreatorId(creatorId);
        return quizRepository.save(quiz);
    }

    public Quiz updateQuiz(String id, Quiz updatedQuiz) {
        return quizRepository.findById(id)
                .map(existingQuiz -> {
                    existingQuiz.setTitle(updatedQuiz.getTitle());
                    existingQuiz.setDescription(updatedQuiz.getDescription());
                    existingQuiz.setQuestions(updatedQuiz.getQuestions());
                    existingQuiz.setTimeLimit(updatedQuiz.getTimeLimit());
                    existingQuiz.setUpdatedAt(LocalDateTime.now());
                    return quizRepository.save(existingQuiz);
                })
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    public boolean deleteQuiz(String id) {
        if (quizRepository.existsById(id)) {
            quizRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Quiz> getQuizzesByCreator(String creatorId) {
        return quizRepository.findByCreatorId(creatorId);
    }

    public List<Quiz> getQuizzesByCategory(String category) {
        return quizRepository.findByCategory(category);
    }

    public QuizStatsDTO getQuizStats(String quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizId(quizId);

        QuizStatsDTO stats = new QuizStatsDTO();
        stats.setQuizId(quizId);
        stats.setQuizTitle(quiz.getTitle());
        stats.setTotalAttempts(attempts.size());

        if (!attempts.isEmpty()) {
            double totalScore = attempts.stream().mapToInt(QuizAttempt::getScore).sum();
            stats.setAverageScore(totalScore / attempts.size());

            List<QuizStatsDTO.AttemptSummary> attemptSummaries = attempts.stream()
                    .map(attempt -> {
                        QuizStatsDTO.AttemptSummary summary = new QuizStatsDTO.AttemptSummary();
                        User user = userRepository.findById(attempt.getUserId())
                                .orElse(null);
                        summary.setUsername(user != null ? user.getUsername() : "Anonymous");
                        summary.setScore(attempt.getScore());
                        return summary;
                    })
                    .collect(Collectors.toList());
            stats.setAttempts(attemptSummaries);
        }

        return stats;
    }

    public int submitQuiz(QuizSubmissionDTO submission, String userId) {
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found with ID: " + submission.getQuizId()));

        int score = 0;
        List<Quiz.Question> questions = quiz.getQuestions();
        for (Quiz.Question question : questions) {
            String questionId = question.getId();
            Integer userAnswer = submission.getAnswers().get(questionId);
            System.out.println("Question " + questionId + ": User answer = " + userAnswer + ", Correct answer = " + question.getCorrectOptionIndex());
            if (userAnswer != null && userAnswer == question.getCorrectOptionIndex()) {
                score++;
            }
        }
        System.out.println("Final score: " + score);

        // Create and save a new QuizAttempt
        QuizAttempt attempt = new QuizAttempt();
        attempt.setUserId(userId);
        attempt.setQuizId(submission.getQuizId());
        attempt.setAnswers(submission.getAnswers());
        attempt.setScore(score);
        attempt.setStartedAt(LocalDateTime.now()); // Assuming the quiz starts when submitted
        attempt.setCompletedAt(LocalDateTime.now());

        quizAttemptRepository.save(attempt);

        return score;
    }
}