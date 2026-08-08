package com.example.admin.mapper;

import com.example.admin.entity.Course;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CourseMapper {
    List<Course> selectList(@Param("userId") Long userId,
                            @Param("name") String name,
                            @Param("offset") int offset,
                            @Param("pageSize") int pageSize);

    long count(@Param("userId") Long userId,
               @Param("name") String name);

    Course selectById(@Param("id") Long id);

    int insert(Course course);

    int update(Course course);

    int deleteById(@Param("id") Long id);
}
