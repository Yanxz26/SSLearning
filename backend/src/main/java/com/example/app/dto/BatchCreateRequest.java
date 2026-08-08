package com.example.app.dto;

import com.example.app.entity.Course;

import java.util.List;

public class BatchCreateRequest {
    
    private List<Course> courses;
    private Long userId;

    public List<Course> getCourses() {
        return courses;
    }

    public void setCourses(List<Course> courses) {
        this.courses = courses;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}