package com.example.admin.mapper;

import com.example.admin.entity.FocusRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FocusRecordMapper {
    List<FocusRecord> selectList(@Param("userId") Long userId,
                                 @Param("startDate") String startDate,
                                 @Param("endDate") String endDate,
                                 @Param("offset") int offset,
                                 @Param("pageSize") int pageSize);

    long count(@Param("userId") Long userId,
               @Param("startDate") String startDate,
               @Param("endDate") String endDate);

    FocusRecord selectById(@Param("id") Long id);

    int deleteById(@Param("id") Long id);
}
