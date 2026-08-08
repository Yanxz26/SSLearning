package com.example.admin.service.impl;

import com.example.admin.converter.EntityConverter;
import com.example.admin.dto.ApiResponse;
import com.example.admin.dto.response.UserResponse;
import com.example.admin.entity.User;
import com.example.admin.exception.BusinessException;
import com.example.admin.mapper.UserMapper;
import com.example.admin.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Resource
    private UserMapper userMapper;

    @Override
    public ApiResponse<?> list(String nickName, String openId, Integer pageNum, Integer pageSize) {
        if (pageNum == null || pageNum < 1) pageNum = 1;
        if (pageSize == null || pageSize < 1) pageSize = 10;
        int offset = (pageNum - 1) * pageSize;

        List<User> users = userMapper.selectList(nickName, openId, offset, pageSize);
        long total = userMapper.count(nickName, openId);
        List<UserResponse> dtoList = EntityConverter.convertList(users, UserResponse.class);
        return ApiResponse.success(dtoList, total);
    }

    @Override
    public ApiResponse<?> detail(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(400, "用户不存在");
        }
        UserResponse dto = EntityConverter.convert(user, UserResponse.class);
        return ApiResponse.success(dto);
    }

    @Override
    public ApiResponse<?> update(User user) {
        if (user.getId() == null) {
            throw new BusinessException(400, "用户ID不能为空");
        }
        User existing = userMapper.selectById(user.getId());
        if (existing == null) {
            throw new BusinessException(400, "用户不存在");
        }
        userMapper.update(user);
        return ApiResponse.successMsg("修改成功");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<?> delete(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(400, "用户不存在");
        }
        // 级联删除关联数据
        userMapper.deleteCoursesByUserId(id);
        userMapper.deleteFocusRecordsByUserId(id);
        userMapper.deleteNotesByUserId(id);
        userMapper.deleteTodosByUserId(id);
        userMapper.deleteWrongQuestionsByUserId(id);
        userMapper.deleteById(id);
        return ApiResponse.successMsg("删除成功（已级联清空该用户全部关联数据）");
    }
}
