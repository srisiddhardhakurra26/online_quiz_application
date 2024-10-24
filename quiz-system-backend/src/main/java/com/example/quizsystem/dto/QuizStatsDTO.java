package com.example.quizsystem.dto;

import java.util.List;

public class QuizStatsDTO {
    private String quizId;
    private String quizTitle;
    private int totalAttempts;
    private double averageScore;
    private List<AttemptSummary> attempts;

    public static class AttemptSummary {
        private String username;
        private int score;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public int getScore() {
            return score;
        }

        public void setScore(int score) {
            this.score = score;
        }
    }

    public String getQuizId() {
        return quizId;
    }

    public void setQuizId(String quizId) {
        this.quizId = quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public int getTotalAttempts() {
        return totalAttempts;
    }

    public void setTotalAttempts(int totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(double averageScore) {
        this.averageScore = averageScore;
    }

    public List<AttemptSummary> getAttempts() {
        return attempts;
    }

    public void setAttempts(List<AttemptSummary> attempts) {
        this.attempts = attempts;
    }
}