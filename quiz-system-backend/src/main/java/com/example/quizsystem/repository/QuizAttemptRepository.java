package com.example.quizsystem.repository;

import com.example.quizsystem.model.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
    List<QuizAttempt> findByUserId(String userId);
    List<QuizAttempt> findByQuizId(String quizId);
    Optional<QuizAttempt> findByUserIdAndQuizIdAndIsActive(String userId, String quizId, boolean isActive);
    Optional<QuizAttempt> findFirstByUserIdAndQuizIdOrderByStartedAtDesc(String userId, String quizId);
}