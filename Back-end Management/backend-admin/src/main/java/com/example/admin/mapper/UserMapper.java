package com.example.admin.mapper;

import com.example.admin.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {
    List<User> selectList(@Param("nickName") String nickName,
                          @Param("openId") String openId,
                          @Param("offset") int offset,
                          @Param("pageSize") int pageSize);

    long count(@Param("nickName") String nickName,
               @Param("openId") String openId);

    User selectById(@Param("id") Long id);

    int update(User user);

    int deleteById(@Param("id") Long id);

    int deleteCoursesByUserId(@Param("userId") Long userId);

    int deleteFocusRecordsByUserId(@Param("userId") Long userId);

    int deleteNotesByUserId(@Param("userId") Long userId);

    int deleteTodosByUserId(@Param("userId") Long userId);

    int deleteWrongQuestionsByUserId(@Param("userId") Long userId);
}
