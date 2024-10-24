package com.example.quizsystem.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "quizzes")
public class Quiz {
    @Id
    private String id;
    private String title;
    private String description;
    private String category;
    private String creatorId;  // This will store the User's ID
    private List<Question> questions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer timeLimit;

    @Data
    public static class Question {
        private String id;
        private String text;
        private List<String> options;
        private int correctOptionIndex;

        public String getId() {
            return id != null ? id : String.valueOf(text.hashCode());
        }
    }
}