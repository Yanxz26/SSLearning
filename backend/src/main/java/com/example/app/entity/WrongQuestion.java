package com.example.app.entity;

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
    /** 图片 URL 列表，多张以英文逗号分隔 */
    private String images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
