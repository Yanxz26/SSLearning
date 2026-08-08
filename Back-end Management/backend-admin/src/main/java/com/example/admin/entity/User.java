package com.example.admin.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private Long id;
    private String openId;
    private String nickName;
    private String avatarUrl;
    private String phone;
    private String email;
    private Integer weekStartDay;
    private Long termConfigId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
