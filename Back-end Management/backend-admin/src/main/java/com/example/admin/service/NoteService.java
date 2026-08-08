package com.example.admin.service;

import com.example.admin.dto.ApiResponse;
import com.example.admin.entity.Note;

public interface NoteService {
    ApiResponse<?> list(Long userId, String title, Integer pageNum, Integer pageSize);
    ApiResponse<?> detail(Long id);
    ApiResponse<?> add(Note note);
    ApiResponse<?> update(Note note);
    ApiResponse<?> delete(Long id);
}
