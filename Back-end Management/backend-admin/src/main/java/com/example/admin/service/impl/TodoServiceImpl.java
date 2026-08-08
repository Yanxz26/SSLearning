package com.example.admin.service.impl;

import com.example.admin.converter.EntityConverter;
import com.example.admin.dto.ApiResponse;
import com.example.admin.dto.response.TodoResponse;
import com.example.admin.entity.Todo;
import com.example.admin.exception.BusinessException;
import com.example.admin.mapper.TodoMapper;
import com.example.admin.service.TodoService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class TodoServiceImpl implements TodoService {

    @Resource
    private TodoMapper todoMapper;

    @Override
    public ApiResponse<?> list(Long userId, String title, Boolean completed, Integer pageNum, Integer pageSize) {
        if (pageNum == null || pageNum < 1) pageNum = 1;
        if (pageSize == null || pageSize < 1) pageSize = 10;
        int offset = (pageNum - 1) * pageSize;

        List<Todo> todos = todoMapper.selectList(userId, title, completed, offset, pageSize);
        long total = todoMapper.count(userId, title, completed);
        List<TodoResponse> dtoList = EntityConverter.convertList(todos, TodoResponse.class);
        return ApiResponse.success(dtoList, total);
    }

    @Override
    public ApiResponse<?> detail(Long id) {
        Todo todo = todoMapper.selectById(id);
        if (todo == null) {
            throw new BusinessException(400, "任务不存在");
        }
        TodoResponse dto = EntityConverter.convert(todo, TodoResponse.class);
        return ApiResponse.success(dto);
    }

    @Override
    public ApiResponse<?> add(Todo todo) {
        if (todo.getUserId() == null) {
            throw new BusinessException(400, "用户ID不能为空");
        }
        if (todo.getTitle() == null || todo.getTitle().trim().isEmpty()) {
            throw new BusinessException(400, "任务标题不能为空");
        }
        todoMapper.insert(todo);
        return ApiResponse.successMsg("新增成功");
    }

    @Override
    public ApiResponse<?> update(Todo todo) {
        if (todo.getId() == null) {
            throw new BusinessException(400, "任务ID不能为空");
        }
        Todo existing = todoMapper.selectById(todo.getId());
        if (existing == null) {
            throw new BusinessException(400, "任务不存在");
        }
        todoMapper.update(todo);
        return ApiResponse.successMsg("修改成功");
    }

    @Override
    public ApiResponse<?> delete(Long id) {
        Todo todo = todoMapper.selectById(id);
        if (todo == null) {
            throw new BusinessException(400, "任务不存在");
        }
        todoMapper.deleteById(id);
        return ApiResponse.successMsg("删除成功");
    }
}
