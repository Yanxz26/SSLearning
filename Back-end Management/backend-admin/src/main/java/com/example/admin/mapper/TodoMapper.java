package com.example.admin.mapper;

import com.example.admin.entity.Todo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TodoMapper {
    List<Todo> selectList(@Param("userId") Long userId,
                          @Param("title") String title,
                          @Param("completed") Boolean completed,
                          @Param("offset") int offset,
                          @Param("pageSize") int pageSize);

    long count(@Param("userId") Long userId,
               @Param("title") String title,
               @Param("completed") Boolean completed);

    Todo selectById(@Param("id") Long id);

    int insert(Todo todo);

    int update(Todo todo);

    int deleteById(@Param("id") Long id);
}
