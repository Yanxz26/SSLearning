package com.example.admin.dto.request;

import lombok.Data;

@Data
public class WrongQuestionRequest {
    private Long id;
    private Long userId;
    private String subject;
    private String question;
    private String answer;
    private String analysis;
    private String tags;
}
