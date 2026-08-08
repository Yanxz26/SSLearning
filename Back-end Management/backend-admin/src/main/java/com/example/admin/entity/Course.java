package com.example.admin.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Course {
    private Long id;
    private Long userId;
    private String name;
    private String teacher;
    private String room;
    private Integer dayOfWeek;
    private Integer timeSlot;
    private String color;
    private Boolean remindEnabled;
    private Integer remindMinutes;
    private Integer startWeek;
    private Integer endWeek;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
