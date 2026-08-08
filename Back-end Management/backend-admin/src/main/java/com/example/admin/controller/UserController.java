package com.example.admin.controller;

import com.example.admin.dto.ApiResponse;
import com.example.admin.dto.request.UserRequest;
import com.example.admin.entity.User;
import com.example.admin.converter.EntityConverter;
import com.example.admin.service.UserService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/user")
public class UserController {

    @Resource
    private UserService userService;

    @GetMapping("/list")
    public ApiResponse<?> list(@RequestParam(required = false) String nickName,
                               @RequestParam(required = false) String openId,
                               @RequestParam(defaultValue = "1") Integer pageNum,
                               @RequestParam(defaultValue = "10") Integer pageSize) {
        return userService.list(nickName, openId, pageNum, pageSize);
    }

    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) {
        return userService.detail(id);
    }

    @PutMapping("/update")
    public ApiResponse<?> update(@RequestBody UserRequest request) {
        User user = EntityConverter.toEntity(request, User.class);
        return userService.update(user);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        return userService.delete(id);
    }
}
