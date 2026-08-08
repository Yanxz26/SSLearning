package com.example.admin.controller;

import com.example.admin.dto.ApiResponse;
import com.example.admin.dto.request.WrongQuestionRequest;
import com.example.admin.entity.WrongQuestion;
import com.example.admin.converter.EntityConverter;
import com.example.admin.service.WrongQuestionService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/wrong")
public class WrongQuestionController {

    @Resource
    private WrongQuestionService wrongQuestionService;

    @GetMapping("/list")
    public ApiResponse<?> list(@RequestParam(required = false) Long userId,
                               @RequestParam(required = false) String subject,
                               @RequestParam(required = false) String keyword,
                               @RequestParam(defaultValue = "1") Integer pageNum,
                               @RequestParam(defaultValue = "10") Integer pageSize) {
        return wrongQuestionService.list(userId, subject, keyword, pageNum, pageSize);
    }

    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) {
        return wrongQuestionService.detail(id);
    }

    @PostMapping("/add")
    public ApiResponse<?> add(@RequestBody WrongQuestionRequest request) {
        WrongQuestion wrongQuestion = EntityConverter.toEntity(request, WrongQuestion.class);
        return wrongQuestionService.add(wrongQuestion);
    }

    @PutMapping("/update")
    public ApiResponse<?> update(@RequestBody WrongQuestionRequest request) {
        WrongQuestion wrongQuestion = EntityConverter.toEntity(request, WrongQuestion.class);
        return wrongQuestionService.update(wrongQuestion);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        return wrongQuestionService.delete(id);
    }
}
