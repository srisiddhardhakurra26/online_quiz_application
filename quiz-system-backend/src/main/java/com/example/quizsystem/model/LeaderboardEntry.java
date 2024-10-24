package com.example.quizsystem.model;

import lombok.Data;

@Data
public class LeaderboardEntry {
    private String userId;
    private String username;
    private int totalScore;
    private int quizzesTaken;
}