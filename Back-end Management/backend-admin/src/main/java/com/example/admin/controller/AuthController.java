package com.example.admin.controller;

import com.example.admin.dto.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AuthController {

    @GetMapping("/current-user")
    public ApiResponse<?> currentUser(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, String> info = new HashMap<>();
        info.put("username", userDetails.getUsername());
        info.put("role", userDetails.getAuthorities().iterator().next().getAuthority());
        return ApiResponse.success(info);
    }
}
