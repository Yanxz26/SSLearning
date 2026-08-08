package com.example.app.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FocusRecord {
    private Long id;
    private Long userId;
    private Integer focusDuration;
    private Integer breakDuration;
    private String date;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
}
