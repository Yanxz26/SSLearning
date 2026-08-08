package com.example.admin.service.impl;

import com.example.admin.converter.EntityConverter;
import com.example.admin.dto.ApiResponse;
import com.example.admin.dto.response.WrongQuestionResponse;
import com.example.admin.entity.WrongQuestion;
import com.example.admin.exception.BusinessException;
import com.example.admin.mapper.WrongQuestionMapper;
import com.example.admin.service.WrongQuestionService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class WrongQuestionServiceImpl implements WrongQuestionService {

    @Resource
    private WrongQuestionMapper wrongQuestionMapper;

    @Override
    public ApiResponse<?> list(Long userId, String subject, String keyword, Integer pageNum, Integer pageSize) {
        if (pageNum == null || pageNum < 1) pageNum = 1;
        if (pageSize == null || pageSize < 1) pageSize = 10;
        int offset = (pageNum - 1) * pageSize;

        List<WrongQuestion> questions = wrongQuestionMapper.selectList(userId, subject, keyword, offset, pageSize);
        long total = wrongQuestionMapper.count(userId, subject, keyword);
        List<WrongQuestionResponse> dtoList = EntityConverter.convertList(questions, WrongQuestionResponse.class);
        return ApiResponse.success(dtoList, total);
    }

    @Override
    public ApiResponse<?> detail(Long id) {
        WrongQuestion question = wrongQuestionMapper.selectById(id);
        if (question == null) {
            throw new BusinessException(400, "错题不存在");
        }
        WrongQuestionResponse dto = EntityConverter.convert(question, WrongQuestionResponse.class);
        return ApiResponse.success(dto);
    }

    @Override
    public ApiResponse<?> add(WrongQuestion wrongQuestion) {
        if (wrongQuestion.getUserId() == null) {
            throw new BusinessException(400, "用户ID不能为空");
        }
        if (wrongQuestion.getSubject() == null || wrongQuestion.getSubject().trim().isEmpty()) {
            throw new BusinessException(400, "科目不能为空");
        }
        if (wrongQuestion.getQuestion() == null || wrongQuestion.getQuestion().trim().isEmpty()) {
            throw new BusinessException(400, "题目内容不能为空");
        }
        wrongQuestionMapper.insert(wrongQuestion);
        return ApiResponse.successMsg("新增成功");
    }

    @Override
    public ApiResponse<?> update(WrongQuestion wrongQuestion) {
        if (wrongQuestion.getId() == null) {
            throw new BusinessException(400, "错题ID不能为空");
        }
        WrongQuestion existing = wrongQuestionMapper.selectById(wrongQuestion.getId());
        if (existing == null) {
            throw new BusinessException(400, "错题不存在");
        }
        wrongQuestionMapper.update(wrongQuestion);
        return ApiResponse.successMsg("修改成功");
    }

    @Override
    public ApiResponse<?> delete(Long id) {
        WrongQuestion question = wrongQuestionMapper.selectById(id);
        if (question == null) {
            throw new BusinessException(400, "错题不存在");
        }
        wrongQuestionMapper.deleteById(id);
        return ApiResponse.successMsg("删除成功");
    }
}
