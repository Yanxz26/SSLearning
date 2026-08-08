package com.example.app.controller;

import com.example.app.dto.BatchCreateRequest;
import com.example.app.entity.Course;
import com.example.app.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getById(@PathVariable Long id) {
        Course course = courseService.getById(id);
        return ResponseEntity.ok(course);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Course>> getByUserId(@PathVariable Long userId) {
        List<Course> courses = courseService.getByUserId(userId);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/user/{userId}/day/{dayOfWeek}")
    public ResponseEntity<List<Course>> getByDayOfWeek(@PathVariable Long userId, @PathVariable Integer dayOfWeek) {
        List<Course> courses = courseService.getByDayOfWeek(userId, dayOfWeek);
        return ResponseEntity.ok(courses);
    }

    @PostMapping
    public ResponseEntity<Course> create(@RequestBody Course course) {
        Course created = courseService.create(course);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> update(@PathVariable Long id, @RequestBody Course course) {
        course.setId(id);
        Course updated = courseService.update(course);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        courseService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/batch")
    public ResponseEntity<List<Course>> batchCreate(@RequestBody BatchCreateRequest request) {
        List<Course> courses = request.getCourses();
        Long userId = request.getUserId();
        List<Course> created = courseService.batchCreate(courses, userId);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteByUserId(@PathVariable Long userId) {
        courseService.deleteByUserId(userId);
        return ResponseEntity.noContent().build();
    }
}
