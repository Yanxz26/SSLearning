package com.example.admin.dto.request;

import lombok.Data;

@Data
public class TermConfigRequest {
    private Long id;
    private Long userId;
    private String termName;
    private String startDate;
    private String endDate;
    private Integer totalWeeks;
}
