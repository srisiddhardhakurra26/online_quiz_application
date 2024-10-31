package com.example.quizsystem.dto;

import lombok.Data;

@Data
public class TimerUpdateDTO {
    private String quizAttemptId;
    private Integer timeRemaining;
}