package com.example.quizsystem.controller;

import com.example.quizsystem.dto.QuizStatsDTO;
import com.example.quizsystem.model.Quiz;
import com.example.quizsystem.dto.QuizSubmissionDTO;
import com.example.quizsystem.model.QuizStats;
import com.example.quizsystem.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*")  // This allows requests from any origin
public class QuizController {

    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping
    public List<Quiz> getAllQuizzes() {
        return quizService.getAllQuizzes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable String id) {
        try {
            Quiz quiz = quizService.getQuizById(id);
            return ResponseEntity.ok(quiz);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz, @RequestParam String creatorId) {
        Quiz createdQuiz = quizService.createQuiz(quiz, creatorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdQuiz);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable String id, @RequestBody Quiz quiz) {
        try {
            Quiz updatedQuiz = quizService.updateQuiz(id, quiz);
            return ResponseEntity.ok(updatedQuiz);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable String id) {
        if (quizService.deleteQuiz(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Quiz>> getQuizzesByCategory(@PathVariable String category) {
        List<Quiz> quizzes = quizService.getQuizzesByCategory(category);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/{quizId}/stats")
    public ResponseEntity<QuizStatsDTO> getQuizStats(@PathVariable String quizId) {
        try {
            QuizStatsDTO stats = quizService.getQuizStats(quizId);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Integer> submitQuiz(@PathVariable String id, @RequestBody QuizSubmissionDTO submission, @RequestParam String userId) {
        System.out.println("Received submission for quiz ID: " + id);
        System.out.println("Submission DTO: " + submission);
        System.out.println("User ID: " + userId);
        submission.setQuizId(id);
        try {
            int score = quizService.submitQuiz(submission, userId);
            System.out.println("Calculated score: " + score);
            return ResponseEntity.ok(score);
        } catch (RuntimeException e) {
            System.err.println("Error submitting quiz: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(-1);
        }
    }

    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<Quiz>> getQuizzesByCreator(@PathVariable String creatorId) {
        List<Quiz> quizzes = quizService.getQuizzesByCreator(creatorId);
        return ResponseEntity.ok(quizzes);
    }
}