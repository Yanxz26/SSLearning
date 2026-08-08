package com.example.app.mapper;

import com.example.app.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User selectById(@Param("id") Long id);
    User selectByOpenId(@Param("openId") String openId);
    int insert(User user);
    int update(User user);
    int deleteById(@Param("id") Long id);
}
