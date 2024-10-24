package com.example.quizsystem.repository;

import com.example.quizsystem.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuizRepository extends MongoRepository<Quiz, String> {
    List<Quiz> findByCreatorId(String creatorId);
    List<Quiz> findByCategory(String category);
}