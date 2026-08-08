package com.example.app.mapper;

import com.example.app.entity.WrongQuestion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WrongQuestionMapper {
    WrongQuestion selectById(@Param("id") Long id);
    List<WrongQuestion> selectByUserId(@Param("userId") Long userId);
    List<WrongQuestion> selectByUserIdAndSubject(@Param("userId") Long userId, @Param("subject") String subject);
    int insert(WrongQuestion wrongQuestion);
    int update(WrongQuestion wrongQuestion);
    int deleteById(@Param("id") Long id);
    int deleteByUserId(@Param("userId") Long userId);
}
