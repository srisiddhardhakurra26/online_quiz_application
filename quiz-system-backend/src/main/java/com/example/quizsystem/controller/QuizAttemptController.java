package com.example.quizsystem.controller;

import com.example.quizsystem.model.QuizAttempt;
import com.example.quizsystem.service.QuizAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quiz-attempts")
public class QuizAttemptController {

    @Autowired
    private QuizAttemptService quizAttemptService;

//    @PostMapping("/start")
//    public ResponseEntity<QuizAttempt> startQuizAttempt(@RequestParam String userId, @RequestParam String quizId) {
//        QuizAttempt attempt = quizAttemptService.startQuizAttempt(userId, quizId);
//        return ResponseEntity.ok(attempt);
//    }

    @PostMapping("/start")
    public ResponseEntity<QuizAttempt> startQuizAttempt(@RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            String quizId = (String) request.get("quizId");
            Integer timeLimit = ((Number) request.get("timeLimit")).intValue();

            System.out.println("Received start quiz request:");
            System.out.println("userId: " + userId);
            System.out.println("quizId: " + quizId);
            System.out.println("timeLimit: " + timeLimit);

            QuizAttempt attempt = quizAttemptService.startQuizAttempt(userId, quizId, timeLimit);
            return ResponseEntity.ok(attempt);
        } catch (Exception e) {
            System.err.println("Error starting quiz: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{quizId}/user/{userId}/attempt")
    public ResponseEntity<Map<String, Object>> getUserQuizAttempt(
            @PathVariable String quizId,
            @PathVariable String userId) {

        List<QuizAttempt> attempts = quizAttemptService.getAttemptsByUser(userId)
                .stream()
                .filter(a -> a.getQuizId().equals(quizId) && !a.isActive())
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        if (!attempts.isEmpty()) {
            response.put("hasAttempted", true);
            response.put("score", attempts.get(0).getScore());
        } else {
            response.put("hasAttempted", false);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{userId}/{quizId}")
    public ResponseEntity<?> checkAttemptStatus(@PathVariable String userId, @PathVariable String quizId) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("hasAttempted", quizAttemptService.hasAttemptedQuiz(userId, quizId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{attemptId}/time")
    public ResponseEntity<Integer> getRemainingTime(@PathVariable String attemptId) {
        try {
            Integer timeRemaining = quizAttemptService.getRemainingTime(attemptId);
            return ResponseEntity.ok(timeRemaining);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

//    @PostMapping("/submit/{attemptId}")
//    public ResponseEntity<QuizAttempt> submitQuizAttempt(@PathVariable String attemptId, @RequestBody Map<String, Integer> answers) {
//        QuizAttempt attempt = quizAttemptService.submitQuizAttempt(attemptId, answers);
//        if (attempt != null) {
//            return ResponseEntity.ok(attempt);
//        }
//        return ResponseEntity.notFound().build();
//    }

    @PostMapping("/submit/{attemptId}")
    public ResponseEntity<?> submitQuizAttempt(
            @PathVariable String attemptId,
            @RequestBody Map<String, Integer> answers) {
        try {
            QuizAttempt attempt = quizAttemptService.submitQuizAttempt(attemptId, answers);
            return ResponseEntity.ok(attempt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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