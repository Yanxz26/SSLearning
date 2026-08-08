package com.example.admin.service.impl;

import com.example.admin.converter.EntityConverter;
import com.example.admin.dto.ApiResponse;
import com.example.admin.dto.response.CourseResponse;
import com.example.admin.entity.Course;
import com.example.admin.exception.BusinessException;
import com.example.admin.mapper.CourseMapper;
import com.example.admin.service.CourseService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class CourseServiceImpl implements CourseService {

    @Resource
    private CourseMapper courseMapper;

    @Override
    public ApiResponse<?> list(Long userId, String name, Integer pageNum, Integer pageSize) {
        if (pageNum == null || pageNum < 1) pageNum = 1;
        if (pageSize == null || pageSize < 1) pageSize = 10;
        int offset = (pageNum - 1) * pageSize;

        List<Course> courses = courseMapper.selectList(userId, name, offset, pageSize);
        long total = courseMapper.count(userId, name);
        List<CourseResponse> dtoList = EntityConverter.convertList(courses, CourseResponse.class);
        return ApiResponse.success(dtoList, total);
    }

    @Override
    public ApiResponse<?> detail(Long id) {
        Course course = courseMapper.selectById(id);
        if (course == null) {
            throw new BusinessException(400, "课程不存在");
        }
        CourseResponse dto = EntityConverter.convert(course, CourseResponse.class);
        return ApiResponse.success(dto);
    }

    @Override
    public ApiResponse<?> add(Course course) {
        if (course.getUserId() == null) {
            throw new BusinessException(400, "用户ID不能为空");
        }
        if (course.getName() == null || course.getName().trim().isEmpty()) {
            throw new BusinessException(400, "课程名称不能为空");
        }
        if (course.getDayOfWeek() == null) {
            throw new BusinessException(400, "星期不能为空");
        }
        courseMapper.insert(course);
        return ApiResponse.successMsg("新增成功");
    }

    @Override
    public ApiResponse<?> update(Course course) {
        if (course.getId() == null) {
            throw new BusinessException(400, "课程ID不能为空");
        }
        Course existing = courseMapper.selectById(course.getId());
        if (existing == null) {
            throw new BusinessException(400, "课程不存在");
        }
        courseMapper.update(course);
        return ApiResponse.successMsg("修改成功");
    }

    @Override
    public ApiResponse<?> delete(Long id) {
        Course course = courseMapper.selectById(id);
        if (course == null) {
            throw new BusinessException(400, "课程不存在");
        }
        courseMapper.deleteById(id);
        return ApiResponse.successMsg("删除成功");
    }
}
