package com.example.quizsystem.service;

import com.example.quizsystem.dto.RegistrationDto;
import com.example.quizsystem.model.User;
import com.example.quizsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(RegistrationDto registrationDto) {
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        User user = new User(
                registrationDto.getUsername(),
                registrationDto.getEmail(),
                registrationDto.getPassword()  // Password is stored as plain text
        );

        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        return userRepository.save(user);
    }
}