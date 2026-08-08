package com.example.admin.service.impl;

import com.example.admin.converter.EntityConverter;
import com.example.admin.dto.ApiResponse;
import com.example.admin.dto.response.TermConfigResponse;
import com.example.admin.entity.TermConfig;
import com.example.admin.exception.BusinessException;
import com.example.admin.mapper.TermConfigMapper;
import com.example.admin.service.TermConfigService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class TermConfigServiceImpl implements TermConfigService {

    @Resource
    private TermConfigMapper termConfigMapper;

    @Override
    public ApiResponse<?> list(Integer pageNum, Integer pageSize) {
        if (pageNum == null || pageNum < 1) pageNum = 1;
        if (pageSize == null || pageSize < 1) pageSize = 10;
        int offset = (pageNum - 1) * pageSize;

        List<TermConfig> configs = termConfigMapper.selectList(offset, pageSize);
        long total = termConfigMapper.count();
        List<TermConfigResponse> dtoList = EntityConverter.convertList(configs, TermConfigResponse.class);
        return ApiResponse.success(dtoList, total);
    }

    @Override
    public ApiResponse<?> detail(Long id) {
        TermConfig config = termConfigMapper.selectById(id);
        if (config == null) {
            throw new BusinessException(400, "学期配置不存在");
        }
        TermConfigResponse dto = EntityConverter.convert(config, TermConfigResponse.class);
        return ApiResponse.success(dto);
    }

    @Override
    public ApiResponse<?> add(TermConfig termConfig) {
        if (termConfig.getUserId() == null) {
            throw new BusinessException(400, "用户ID不能为空");
        }
        if (termConfig.getTermName() == null || termConfig.getTermName().trim().isEmpty()) {
            throw new BusinessException(400, "学期名称不能为空");
        }
        if (termConfig.getStartDate() == null || termConfig.getStartDate().trim().isEmpty()) {
            throw new BusinessException(400, "开学日期不能为空");
        }
        termConfigMapper.insert(termConfig);
        return ApiResponse.successMsg("新增成功");
    }

    @Override
    public ApiResponse<?> update(TermConfig termConfig) {
        if (termConfig.getId() == null) {
            throw new BusinessException(400, "学期配置ID不能为空");
        }
        TermConfig existing = termConfigMapper.selectById(termConfig.getId());
        if (existing == null) {
            throw new BusinessException(400, "学期配置不存在");
        }
        termConfigMapper.update(termConfig);
        return ApiResponse.successMsg("修改成功");
    }

    @Override
    public ApiResponse<?> delete(Long id) {
        TermConfig config = termConfigMapper.selectById(id);
        if (config == null) {
            throw new BusinessException(400, "学期配置不存在");
        }
        termConfigMapper.deleteById(id);
        return ApiResponse.successMsg("删除成功");
    }
}
