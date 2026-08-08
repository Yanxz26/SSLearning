package com.example.app.mapper;

import com.example.app.entity.Note;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NoteMapper {
    Note selectById(@Param("id") Long id);
    List<Note> selectByUserId(@Param("userId") Long userId);
    int insert(Note note);
    int update(Note note);
    int deleteById(@Param("id") Long id);
    int deleteByUserId(@Param("userId") Long userId);
}
