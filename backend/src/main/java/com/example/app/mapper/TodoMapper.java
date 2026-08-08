package com.example.app.mapper;

import com.example.app.entity.Todo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface TodoMapper {
    Todo selectById(@Param("id") Long id);
    List<Todo> selectByUserId(@Param("userId") Long userId);
    List<Todo> selectByUserIdAndStatus(@Param("userId") Long userId, @Param("completed") Boolean completed);
    int insert(Todo todo);
    int update(Todo todo);
    int deleteById(@Param("id") Long id);
    int deleteByUserId(@Param("userId") Long userId);
    int updateStatus(@Param("id") Long id, @Param("completed") Boolean completed);
    
    Integer countByUserId(@Param("userId") Long userId);
    Integer countCompletedByUserId(@Param("userId") Long userId);
    List<Map<String, Object>> getTaskCompletionTrend(@Param("userId") Long userId);
}
