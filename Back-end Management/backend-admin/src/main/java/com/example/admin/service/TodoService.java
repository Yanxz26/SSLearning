package com.example.admin.service;

import com.example.admin.dto.ApiResponse;
import com.example.admin.entity.Todo;

public interface TodoService {
    ApiResponse<?> list(Long userId, String title, Boolean completed, Integer pageNum, Integer pageSize);
    ApiResponse<?> detail(Long id);
    ApiResponse<?> add(Todo todo);
    ApiResponse<?> update(Todo todo);
    ApiResponse<?> delete(Long id);
}
