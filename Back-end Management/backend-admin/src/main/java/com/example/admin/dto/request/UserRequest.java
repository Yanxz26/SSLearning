package com.example.admin.dto.request;

import lombok.Data;

@Data
public class UserRequest {
    private Long id;
    private String nickName;
    private String avatarUrl;
    private String phone;
    private String email;
    private Integer weekStartDay;
    private Long termConfigId;
}
