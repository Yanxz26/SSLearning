package com.example.admin.mapper;

import com.example.admin.entity.TermConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TermConfigMapper {
    List<TermConfig> selectList(@Param("offset") int offset,
                                @Param("pageSize") int pageSize);

    long count();

    TermConfig selectById(@Param("id") Long id);

    int insert(TermConfig termConfig);

    int update(TermConfig termConfig);

    int deleteById(@Param("id") Long id);
}
