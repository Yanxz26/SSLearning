package com.example.admin.service;

import com.example.admin.dto.ApiResponse;
import com.example.admin.entity.Course;

public interface CourseService {
    ApiResponse<?> list(Long userId, String name, Integer pageNum, Integer pageSize);
    ApiResponse<?> detail(Long id);
    ApiResponse<?> add(Course course);
    ApiResponse<?> update(Course course);
    ApiResponse<?> delete(Long id);
}
