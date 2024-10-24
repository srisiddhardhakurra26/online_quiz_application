package com.example.quizsystem.dto;

import java.util.Map;

public class QuizSubmissionDTO {
    private String quizId;
    private Map<String, Integer> answers;

    // Getters and setters
    public String getQuizId() {
        return quizId;
    }

    public void setQuizId(String quizId) {
        this.quizId = quizId;
    }

    public Map<String, Integer> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, Integer> answers) {
        this.answers = answers;
    }
}