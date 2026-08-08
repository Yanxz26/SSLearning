package com.example.admin.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FocusRecordResponse {
    private Long id;
    private Long userId;
    private Integer focusDuration;
    private Integer breakDuration;
    private String date;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
}
