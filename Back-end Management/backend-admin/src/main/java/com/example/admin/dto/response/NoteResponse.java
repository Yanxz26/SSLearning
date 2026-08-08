package com.example.admin.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NoteResponse {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
