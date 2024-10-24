package com.example.quizsystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.quizsystem.model.User;
import com.example.quizsystem.payload.JwtAuthenticationResponse;
import com.example.quizsystem.payload.LoginRequest;
import com.example.quizsystem.payload.SignUpRequest;
import com.example.quizsystem.repository.UserRepository;
import com.example.quizsystem.security.JwtTokenProvider;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    UserRepository userRepository;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        System.out.println("Received login request for: " + loginRequest.getUsername());
        return userRepository.findByUsername(loginRequest.getUsername())
                .map(user -> {
                    System.out.println("Found user: " + user.getUsername());
                    System.out.println("Stored password: " + user.getPassword());
                    System.out.println("Received password: " + loginRequest.getPassword());
                    if (user.getPassword().equals(loginRequest.getPassword())) {
                        System.out.println("Password match successful");
                        return ResponseEntity.ok(Map.of(
                                "message", "User signed in successfully",
                                "userId", user.getId()  // Include the user ID in the response
                        ));
                    } else {
                        System.out.println("Password mismatch");
                        return ResponseEntity.badRequest().body(Map.of("message", "Invalid Username or Password"));
                    }
                })
                .orElseGet(() -> {
                    System.out.println("User not found");
                    return ResponseEntity.badRequest().body(Map.of("message", "Invalid Username or Password"));
                });
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignUpRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email Address already in use!"));
        }

        User user = new User(signUpRequest.getUsername(), signUpRequest.getEmail(), signUpRequest.getPassword());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }
}