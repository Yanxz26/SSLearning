package com.example.admin.service;

import com.example.admin.dto.ApiResponse;
import com.example.admin.entity.User;

public interface UserService {
    ApiResponse<?> list(String nickName, String openId, Integer pageNum, Integer pageSize);
    ApiResponse<?> detail(Long id);
    ApiResponse<?> update(User user);
    ApiResponse<?> delete(Long id);
}
