package com.example.admin.service;

import com.example.admin.dto.ApiResponse;
import com.example.admin.entity.TermConfig;

public interface TermConfigService {
    ApiResponse<?> list(Integer pageNum, Integer pageSize);
    ApiResponse<?> detail(Long id);
    ApiResponse<?> add(TermConfig termConfig);
    ApiResponse<?> update(TermConfig termConfig);
    ApiResponse<?> delete(Long id);
}
