package com.example.admin.service;

import com.example.admin.dto.ApiResponse;
import com.example.admin.entity.WrongQuestion;

public interface WrongQuestionService {
    ApiResponse<?> list(Long userId, String subject, String keyword, Integer pageNum, Integer pageSize);
    ApiResponse<?> detail(Long id);
    ApiResponse<?> add(WrongQuestion wrongQuestion);
    ApiResponse<?> update(WrongQuestion wrongQuestion);
    ApiResponse<?> delete(Long id);
}
