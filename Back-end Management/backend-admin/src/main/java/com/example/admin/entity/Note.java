package com.example.admin.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Note {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
