package com.example.app.service;

import com.example.app.entity.Course;

import java.util.List;

public interface CourseService {
    Course getById(Long id);
    List<Course> getByUserId(Long userId);
    List<Course> getByDayOfWeek(Long userId, Integer dayOfWeek);
    Course create(Course course);
    Course update(Course course);
    void deleteById(Long id);
    List<Course> batchCreate(List<Course> courses, Long userId);
    void deleteByUserId(Long userId);
}
