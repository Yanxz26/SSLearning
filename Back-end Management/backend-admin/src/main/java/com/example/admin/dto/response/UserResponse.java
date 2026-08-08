package com.example.admin.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户响应 DTO，不包含 openId 等敏感字段。
 */
@Data
public class UserResponse {
    private Long id;
    private String nickName;
    private String avatarUrl;
    private String phone;
    private String email;
    private Integer weekStartDay;
    private Long termConfigId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
