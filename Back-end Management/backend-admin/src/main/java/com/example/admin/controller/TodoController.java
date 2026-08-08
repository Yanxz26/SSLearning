package com.example.admin.controller;

import com.example.admin.dto.ApiResponse;
import com.example.admin.dto.request.TodoRequest;
import com.example.admin.entity.Todo;
import com.example.admin.converter.EntityConverter;
import com.example.admin.service.TodoService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/todo")
public class TodoController {

    @Resource
    private TodoService todoService;

    @GetMapping("/list")
    public ApiResponse<?> list(@RequestParam(required = false) Long userId,
                               @RequestParam(required = false) String title,
                               @RequestParam(required = false) Boolean completed,
                               @RequestParam(defaultValue = "1") Integer pageNum,
                               @RequestParam(defaultValue = "10") Integer pageSize) {
        return todoService.list(userId, title, completed, pageNum, pageSize);
    }

    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) {
        return todoService.detail(id);
    }

    @PostMapping("/add")
    public ApiResponse<?> add(@RequestBody TodoRequest request) {
        Todo todo = EntityConverter.toEntity(request, Todo.class);
        return todoService.add(todo);
    }

    @PutMapping("/update")
    public ApiResponse<?> update(@RequestBody TodoRequest request) {
        Todo todo = EntityConverter.toEntity(request, Todo.class);
        return todoService.update(todo);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        return todoService.delete(id);
    }
}
