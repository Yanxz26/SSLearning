package com.example.admin.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Todo {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String category;
    private String deadline;
    private Boolean completed;
    private Boolean remindEnabled;
    private String remindTime;
    private Integer priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
