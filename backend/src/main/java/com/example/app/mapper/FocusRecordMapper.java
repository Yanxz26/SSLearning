package com.example.app.mapper;

import com.example.app.entity.FocusRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FocusRecordMapper {
    FocusRecord selectById(@Param("id") Long id);
    List<FocusRecord> selectByUserId(@Param("userId") Long userId);
    List<FocusRecord> selectByUserIdAndDate(@Param("userId") Long userId, @Param("date") String date);
    int insert(FocusRecord record);
    int update(FocusRecord record);
    int deleteById(@Param("id") Long id);
    int deleteByUserId(@Param("userId") Long userId);
    Integer sumFocusDurationByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") String startDate, @Param("endDate") String endDate);
}
