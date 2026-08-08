package com.example.app.controller;

import com.example.app.entity.User;
import com.example.app.mapper.UserMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserMapper userMapper;

    public UserController(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * 按 openId 查找用户，不存在则自动创建
     */
    @GetMapping("/openid/{openId}")
    public ResponseEntity<User> getOrCreateByOpenId(@PathVariable String openId) {
        User user = userMapper.selectByOpenId(openId);
        if (user == null) {
            user = new User();
            user.setOpenId(openId);
            user.setNickName("新用户");
            LocalDateTime now = LocalDateTime.now();
            user.setCreatedAt(now);
            user.setUpdatedAt(now);
            userMapper.insert(user);
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<User> create(@RequestBody User user) {
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        userMapper.insert(user);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.update(user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userMapper.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}