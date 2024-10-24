package com.example.quizsystem.model;

import lombok.Data;

@Data
public class QuizStats {
    private String quizId;
    private String quizTitle;
    private int totalAttempts;
    private double averageScore;
    private int highestScore;
    private int lowestScore;
}