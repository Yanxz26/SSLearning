package com.example.app.controller;

import com.example.app.entity.Note;
import com.example.app.mapper.NoteMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteMapper noteMapper;
    private final DataSource dataSource;

    public NoteController(NoteMapper noteMapper, DataSource dataSource) {
        this.noteMapper = noteMapper;
        this.dataSource = dataSource;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Note>> getByUserId(@PathVariable Long userId) {
        List<Note> notes = noteMapper.selectByUserId(userId);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getById(@PathVariable Long id) {
        Note note = noteMapper.selectById(id);
        return ResponseEntity.ok(note);
    }

    @PostMapping
    public ResponseEntity<Note> create(@RequestBody Note note) {
        note.setCreatedAt(LocalDateTime.now());
        note.setUpdatedAt(LocalDateTime.now());
        noteMapper.insert(note);
        return ResponseEntity.ok(note);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> update(@PathVariable Long id, @RequestBody Note note) {
        note.setId(id);
        note.setUpdatedAt(LocalDateTime.now());
        noteMapper.update(note);
        return ResponseEntity.ok(note);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        noteMapper.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/fix-charset")
    public ResponseEntity<String> fixCharset() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            
            stmt.execute("ALTER TABLE notes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            stmt.execute("ALTER DATABASE learning_assistant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            return ResponseEntity.ok("字符集修复成功");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("修复失败: " + e.getMessage());
        }
    }
}
