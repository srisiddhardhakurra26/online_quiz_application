package com.example.quizsystem.controller;

import com.example.quizsystem.model.QuizAttempt;
import com.example.quizsystem.service.QuizAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz-attempts")
public class QuizAttemptController {

    @Autowired
    private QuizAttemptService quizAttemptService;

    @PostMapping("/start")
    public ResponseEntity<QuizAttempt> startQuizAttempt(@RequestParam String userId, @RequestParam String quizId) {
        QuizAttempt attempt = quizAttemptService.startQuizAttempt(userId, quizId);
        return ResponseEntity.ok(attempt);
    }

    @PostMapping("/submit/{attemptId}")
    public ResponseEntity<QuizAttempt> submitQuizAttempt(@PathVariable String attemptId, @RequestBody Map<String, Integer> answers) {
        QuizAttempt attempt = quizAttemptService.submitQuizAttempt(attemptId, answers);
        if (attempt != null) {
            return ResponseEntity.ok(attempt);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizAttempt>> getAttemptsByUser(@PathVariable String userId) {
        List<QuizAttempt> attempts = quizAttemptService.getAttemptsByUser(userId);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuizAttempt>> getAttemptsByQuiz(@PathVariable String quizId) {
        List<QuizAttempt> attempts = quizAttemptService.getAttemptsByQuiz(quizId);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/user/{userId}/details")
    public ResponseEntity<Map<String, Object>> getUserAttemptDetails(@PathVariable String userId) {
        Map<String, Object> details = quizAttemptService.getUserAttemptDetails(userId);
        return ResponseEntity.ok(details);
    }
}