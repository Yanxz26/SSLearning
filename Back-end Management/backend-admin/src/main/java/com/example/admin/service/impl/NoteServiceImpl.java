package com.example.admin.service.impl;

import com.example.admin.converter.EntityConverter;
import com.example.admin.dto.ApiResponse;
import com.example.admin.dto.response.NoteResponse;
import com.example.admin.entity.Note;
import com.example.admin.exception.BusinessException;
import com.example.admin.mapper.NoteMapper;
import com.example.admin.service.NoteService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class NoteServiceImpl implements NoteService {

    @Resource
    private NoteMapper noteMapper;

    @Override
    public ApiResponse<?> list(Long userId, String title, Integer pageNum, Integer pageSize) {
        if (pageNum == null || pageNum < 1) pageNum = 1;
        if (pageSize == null || pageSize < 1) pageSize = 10;
        int offset = (pageNum - 1) * pageSize;

        List<Note> notes = noteMapper.selectList(userId, title, offset, pageSize);
        long total = noteMapper.count(userId, title);
        List<NoteResponse> dtoList = EntityConverter.convertList(notes, NoteResponse.class);
        return ApiResponse.success(dtoList, total);
    }

    @Override
    public ApiResponse<?> detail(Long id) {
        Note note = noteMapper.selectById(id);
        if (note == null) {
            throw new BusinessException(400, "笔记不存在");
        }
        NoteResponse dto = EntityConverter.convert(note, NoteResponse.class);
        return ApiResponse.success(dto);
    }

    @Override
    public ApiResponse<?> add(Note note) {
        if (note.getUserId() == null) {
            throw new BusinessException(400, "用户ID不能为空");
        }
        if (note.getTitle() == null || note.getTitle().trim().isEmpty()) {
            throw new BusinessException(400, "笔记标题不能为空");
        }
        noteMapper.insert(note);
        return ApiResponse.successMsg("新增成功");
    }

    @Override
    public ApiResponse<?> update(Note note) {
        if (note.getId() == null) {
            throw new BusinessException(400, "笔记ID不能为空");
        }
        Note existing = noteMapper.selectById(note.getId());
        if (existing == null) {
            throw new BusinessException(400, "笔记不存在");
        }
        noteMapper.update(note);
        return ApiResponse.successMsg("修改成功");
    }

    @Override
    public ApiResponse<?> delete(Long id) {
        Note note = noteMapper.selectById(id);
        if (note == null) {
            throw new BusinessException(400, "笔记不存在");
        }
        noteMapper.deleteById(id);
        return ApiResponse.successMsg("删除成功");
    }
}
