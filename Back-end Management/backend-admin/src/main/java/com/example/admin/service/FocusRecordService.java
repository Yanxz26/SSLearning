package com.example.admin.service;

import com.example.admin.dto.ApiResponse;

public interface FocusRecordService {
    ApiResponse<?> list(Long userId, String startDate, String endDate, Integer pageNum, Integer pageSize);
    ApiResponse<?> detail(Long id);
    ApiResponse<?> delete(Long id);
}
