package com.example.admin.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WrongQuestion {
    private Long id;
    private Long userId;
    private String subject;
    private String question;
    private String answer;
    private String analysis;
    private String tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
