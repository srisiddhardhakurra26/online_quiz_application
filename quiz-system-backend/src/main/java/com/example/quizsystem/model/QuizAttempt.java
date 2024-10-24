package com.example.quizsystem.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Document(collection = "quiz_attempts")
public class QuizAttempt {
    @Id
    private String id;
    private String userId;
    private String quizId;
    private Map<String, Integer> answers; // Question ID to selected option index
    private int score;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}