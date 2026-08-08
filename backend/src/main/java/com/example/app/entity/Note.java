package com.example.app.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Note {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String tags;
    /** 图片 URL 列表，多张以英文逗号分隔，例如 /uploads/notes/xxx.jpg,/uploads/notes/yyy.png */
    private String images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
