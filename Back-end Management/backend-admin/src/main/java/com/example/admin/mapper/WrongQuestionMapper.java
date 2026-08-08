package com.example.admin.mapper;

import com.example.admin.entity.WrongQuestion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WrongQuestionMapper {
    List<WrongQuestion> selectList(@Param("userId") Long userId,
                                   @Param("subject") String subject,
                                   @Param("keyword") String keyword,
                                   @Param("offset") int offset,
                                   @Param("pageSize") int pageSize);

    long count(@Param("userId") Long userId,
               @Param("subject") String subject,
               @Param("keyword") String keyword);

    WrongQuestion selectById(@Param("id") Long id);

    int insert(WrongQuestion wrongQuestion);

    int update(WrongQuestion wrongQuestion);

    int deleteById(@Param("id") Long id);
}
