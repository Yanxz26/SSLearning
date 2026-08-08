package com.example.admin.service.impl;

import com.example.admin.converter.EntityConverter;
import com.example.admin.dto.ApiResponse;
import com.example.admin.dto.response.FocusRecordResponse;
import com.example.admin.entity.FocusRecord;
import com.example.admin.exception.BusinessException;
import com.example.admin.mapper.FocusRecordMapper;
import com.example.admin.service.FocusRecordService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class FocusRecordServiceImpl implements FocusRecordService {

    @Resource
    private FocusRecordMapper focusRecordMapper;

    @Override
    public ApiResponse<?> list(Long userId, String startDate, String endDate, Integer pageNum, Integer pageSize) {
        if (pageNum == null || pageNum < 1) pageNum = 1;
        if (pageSize == null || pageSize < 1) pageSize = 10;
        int offset = (pageNum - 1) * pageSize;

        List<FocusRecord> records = focusRecordMapper.selectList(userId, startDate, endDate, offset, pageSize);
        long total = focusRecordMapper.count(userId, startDate, endDate);
        List<FocusRecordResponse> dtoList = EntityConverter.convertList(records, FocusRecordResponse.class);
        return ApiResponse.success(dtoList, total);
    }

    @Override
    public ApiResponse<?> detail(Long id) {
        FocusRecord record = focusRecordMapper.selectById(id);
        if (record == null) {
            throw new BusinessException(400, "记录不存在");
        }
        FocusRecordResponse dto = EntityConverter.convert(record, FocusRecordResponse.class);
        return ApiResponse.success(dto);
    }

    @Override
    public ApiResponse<?> delete(Long id) {
        FocusRecord record = focusRecordMapper.selectById(id);
        if (record == null) {
            throw new BusinessException(400, "记录不存在");
        }
        focusRecordMapper.deleteById(id);
        return ApiResponse.successMsg("删除成功");
    }
}
