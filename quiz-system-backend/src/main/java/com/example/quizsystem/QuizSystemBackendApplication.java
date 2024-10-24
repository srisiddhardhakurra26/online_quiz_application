package com.example.quizsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication
public class QuizSystemBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuizSystemBackendApplication.class, args);
    }

}
