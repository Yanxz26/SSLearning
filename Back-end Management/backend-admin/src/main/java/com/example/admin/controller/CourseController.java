package com.example.admin.controller;

import com.example.admin.dto.ApiResponse;
import com.example.admin.dto.request.CourseRequest;
import com.example.admin.dto.response.CourseResponse;
import com.example.admin.entity.Course;
import com.example.admin.service.CourseService;
import com.example.admin.converter.EntityConverter;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/course")
public class CourseController {

    @Resource
    private CourseService courseService;

    @GetMapping("/list")
    public ApiResponse<?> list(@RequestParam(required = false) Long userId,
                               @RequestParam(required = false) String name,
                               @RequestParam(defaultValue = "1") Integer pageNum,
                               @RequestParam(defaultValue = "10") Integer pageSize) {
        return courseService.list(userId, name, pageNum, pageSize);
    }

    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) {
        return courseService.detail(id);
    }

    @PostMapping("/add")
    public ApiResponse<?> add(@RequestBody CourseRequest request) {
        Course course = EntityConverter.toEntity(request, Course.class);
        return courseService.add(course);
    }

    @PutMapping("/update")
    public ApiResponse<?> update(@RequestBody CourseRequest request) {
        Course course = EntityConverter.toEntity(request, Course.class);
        return courseService.update(course);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        return courseService.delete(id);
    }
}
