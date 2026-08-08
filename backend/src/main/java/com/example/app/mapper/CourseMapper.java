package com.example.app.mapper;

import com.example.app.entity.Course;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CourseMapper {
    Course selectById(@Param("id") Long id);
    List<Course> selectByUserId(@Param("userId") Long userId);
    List<Course> selectByDayOfWeek(@Param("userId") Long userId, @Param("dayOfWeek") Integer dayOfWeek);
    int insert(Course course);
    int update(Course course);
    int deleteById(@Param("id") Long id);
    int deleteByUserId(@Param("userId") Long userId);
}
