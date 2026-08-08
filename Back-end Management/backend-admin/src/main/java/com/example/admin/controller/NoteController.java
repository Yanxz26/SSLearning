package com.example.admin.controller;

import com.example.admin.dto.ApiResponse;
import com.example.admin.dto.request.NoteRequest;
import com.example.admin.entity.Note;
import com.example.admin.converter.EntityConverter;
import com.example.admin.service.NoteService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/note")
public class NoteController {

    @Resource
    private NoteService noteService;

    @GetMapping("/list")
    public ApiResponse<?> list(@RequestParam(required = false) Long userId,
                               @RequestParam(required = false) String title,
                               @RequestParam(defaultValue = "1") Integer pageNum,
                               @RequestParam(defaultValue = "10") Integer pageSize) {
        return noteService.list(userId, title, pageNum, pageSize);
    }

    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) {
        return noteService.detail(id);
    }

    @PostMapping("/add")
    public ApiResponse<?> add(@RequestBody NoteRequest request) {
        Note note = EntityConverter.toEntity(request, Note.class);
        return noteService.add(note);
    }

    @PutMapping("/update")
    public ApiResponse<?> update(@RequestBody NoteRequest request) {
        Note note = EntityConverter.toEntity(request, Note.class);
        return noteService.update(note);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        return noteService.delete(id);
    }
}
