package com.example.admin.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TermConfigResponse {
    private Long id;
    private Long userId;
    private String termName;
    private String startDate;
    private String endDate;
    private Integer totalWeeks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
