package com.example.admin.mapper;

import com.example.admin.entity.Note;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NoteMapper {
    List<Note> selectList(@Param("userId") Long userId,
                          @Param("title") String title,
                          @Param("offset") int offset,
                          @Param("pageSize") int pageSize);

    long count(@Param("userId") Long userId,
               @Param("title") String title);

    Note selectById(@Param("id") Long id);

    int insert(Note note);

    int update(Note note);

    int deleteById(@Param("id") Long id);
}
