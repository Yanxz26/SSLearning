package com.example.app.mapper;

import com.example.app.entity.TermConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TermConfigMapper {
    TermConfig selectById(Long id);
    
    List<TermConfig> selectByUserId(Long userId);
    
    TermConfig selectLatestByUserId(Long userId);
    
    int insert(TermConfig termConfig);
    
    int update(TermConfig termConfig);
    
    int deleteById(Long id);
}
