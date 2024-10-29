package com.example.quizsystem.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.quizsystem.model.User;
import com.example.quizsystem.payload.LoginRequest;
import com.example.quizsystem.payload.SignUpRequest;
import com.example.quizsystem.repository.UserRepository;
import com.example.quizsystem.security.JwtTokenProvider;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtTokenProvider tokenProvider;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Login attempt with username: {}", loginRequest.getUsername());

            // First check if user exists
            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            logger.info("User found in database: {}", user.getUsername());

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            logger.info("Authentication successful for user: {}", loginRequest.getUsername());

            // Generate JWT token
            String jwt = tokenProvider.generateToken(authentication);
            logger.info("JWT token generated successfully");

            // Return token and user info
            return ResponseEntity.ok(Map.of(
                    "token", jwt,
                    "userId", user.getId(),
                    "username", user.getUsername()
            ));

        } catch (Exception e) {
            logger.error("Authentication failed for user: {}", loginRequest.getUsername(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid Username or Password"
            ));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignUpRequest signUpRequest) {
        logger.info("Registration attempt for username: {}", signUpRequest.getUsername());

        // Check username availability
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            logger.warn("Username already taken: {}", signUpRequest.getUsername());
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Username is already taken!"
            ));
        }

        // Check email availability
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            logger.warn("Email already in use: {}", signUpRequest.getEmail());
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Email Address already in use!"
            ));
        }

        try {
            // Create new user
            User user = new User(
                    signUpRequest.getUsername(),
                    signUpRequest.getEmail(),
                    passwordEncoder.encode(signUpRequest.getPassword()) // Encrypt password
            );

            // Save user
            userRepository.save(user);
            logger.info("User registered successfully: {}", signUpRequest.getUsername());

            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully"
            ));
        } catch (Exception e) {
            logger.error("Registration failed for user: {}", signUpRequest.getUsername(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Registration failed"
            ));
        }
    }
}