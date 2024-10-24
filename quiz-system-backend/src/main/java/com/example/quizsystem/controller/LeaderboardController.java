package com.example.quizsystem.controller;

import com.example.quizsystem.model.LeaderboardEntry;
import com.example.quizsystem.service.QuizAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private QuizAttemptService quizAttemptService;

    @GetMapping("/global")
    public ResponseEntity<List<LeaderboardEntry>> getGlobalLeaderboard() {
        List<LeaderboardEntry> leaderboard = quizAttemptService.getGlobalLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<LeaderboardEntry>> getQuizLeaderboard(@PathVariable String quizId) {
        List<LeaderboardEntry> leaderboard = quizAttemptService.getQuizLeaderboard(quizId);
        return ResponseEntity.ok(leaderboard);
    }
}