package com.example.admin.dto.request;

import lombok.Data;

@Data
public class NoteRequest {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String tags;
}
