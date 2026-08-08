package com.example.admin.dto.request;

import lombok.Data;

@Data
public class TodoRequest {
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
}
