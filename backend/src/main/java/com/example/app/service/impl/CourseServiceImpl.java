package com.example.app.service.impl;

import com.example.app.entity.Course;
import com.example.app.mapper.CourseMapper;
import com.example.app.service.CourseService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl implements CourseService {

    private static final int MAX_NAME_LENGTH = 100;
    private static final int MAX_TEACHER_LENGTH = 100;
    private static final int MAX_ROOM_LENGTH = 100;

    private final CourseMapper courseMapper;

    public CourseServiceImpl(CourseMapper courseMapper) {
        this.courseMapper = courseMapper;
    }

    @Override
    public Course getById(Long id) {
        return courseMapper.selectById(id);
    }

    @Override
    public List<Course> getByUserId(Long userId) {
        return courseMapper.selectByUserId(userId);
    }

    @Override
    public List<Course> getByDayOfWeek(Long userId, Integer dayOfWeek) {
        return courseMapper.selectByDayOfWeek(userId, dayOfWeek);
    }

    @Override
    public Course create(Course course) {
        validateCourse(course);
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());
        courseMapper.insert(course);
        return course;
    }

    @Override
    public Course update(Course course) {
        validateCourse(course);
        course.setUpdatedAt(LocalDateTime.now());
        courseMapper.update(course);
        return course;
    }

    @Override
    public void deleteById(Long id) {
        courseMapper.deleteById(id);
    }

    @Override
    public List<Course> batchCreate(List<Course> courses, Long userId) {
        LocalDateTime now = LocalDateTime.now();
        
        List<Course> validCourses = courses.stream()
            .filter(course -> {
                try {
                    validateCourse(course);
                    return true;
                } catch (IllegalArgumentException e) {
                    return false;
                }
            })
            .collect(Collectors.toList());

        validCourses.forEach(course -> {
            course.setUserId(userId);
            course.setCreatedAt(now);
            course.setUpdatedAt(now);
            courseMapper.insert(course);
        });
        return validCourses;
    }

    @Override
    public void deleteByUserId(Long userId) {
        courseMapper.deleteByUserId(userId);
    }

    private void validateCourse(Course course) {
        if (course.getName() == null || course.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("课程名称不能为空");
        }
        
        String name = course.getName();
        if (name.length() > MAX_NAME_LENGTH) {
            throw new IllegalArgumentException("课程名称长度不能超过" + MAX_NAME_LENGTH + "个字符");
        }
        
        if (!isValidText(name)) {
            throw new IllegalArgumentException("课程名称包含非法字符");
        }
        
        if (course.getTeacher() != null) {
            if (course.getTeacher().length() > MAX_TEACHER_LENGTH) {
                throw new IllegalArgumentException("教师名称长度不能超过" + MAX_TEACHER_LENGTH + "个字符");
            }
            if (!isValidText(course.getTeacher())) {
                throw new IllegalArgumentException("教师名称包含非法字符");
            }
        }
        
        if (course.getRoom() != null) {
            if (course.getRoom().length() > MAX_ROOM_LENGTH) {
                throw new IllegalArgumentException("教室名称长度不能超过" + MAX_ROOM_LENGTH + "个字符");
            }
            if (!isValidText(course.getRoom())) {
                throw new IllegalArgumentException("教室名称包含非法字符");
            }
        }
        
        if (course.getDayOfWeek() == null || course.getDayOfWeek() < 0 || course.getDayOfWeek() > 6) {
            throw new IllegalArgumentException("星期必须在0-6之间");
        }
        if (course.getTimeSlot() == null || course.getTimeSlot() < 0 || course.getTimeSlot() > 7) {
            throw new IllegalArgumentException("节次必须在0-7之间");
        }
    }

    private boolean isValidText(String text) {
        if (text == null || text.isEmpty()) {
            return true;
        }
        
        int invalidCount = 0;
        int totalChars = text.length();
        
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (isInvalidCharacter(c)) {
                invalidCount++;
            }
        }
        
        double invalidRatio = (double) invalidCount / totalChars;
        if (invalidRatio > 0.3) {
            return false;
        }
        
        return true;
    }

    private boolean isInvalidCharacter(char c) {
        if (c == 0x00 || c == 0xFFFD) {
            return true;
        }
        
        if (c >= 0x00 && c <= 0x08) {
            return true;
        }
        if (c >= 0x0B && c <= 0x0C) {
            return true;
        }
        if (c >= 0x0E && c <= 0x1F) {
            return true;
        }
        if (c >= 0x7F && c <= 0x9F) {
            return true;
        }
        
        return false;
    }
}
