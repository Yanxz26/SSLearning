package com.example.app.controller;

import com.example.app.entity.TermConfig;
import com.example.app.mapper.TermConfigMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/term-configs")
public class TermConfigController {

    private final TermConfigMapper termConfigMapper;

    public TermConfigController(TermConfigMapper termConfigMapper) {
        this.termConfigMapper = termConfigMapper;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TermConfig>> getByUserId(@PathVariable Long userId) {
        List<TermConfig> configs = termConfigMapper.selectByUserId(userId);
        return ResponseEntity.ok(configs);
    }

    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<TermConfig> getLatestByUserId(@PathVariable Long userId) {
        TermConfig config = termConfigMapper.selectLatestByUserId(userId);
        return ResponseEntity.ok(config);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TermConfig> getById(@PathVariable Long id) {
        TermConfig config = termConfigMapper.selectById(id);
        return ResponseEntity.ok(config);
    }

    @PostMapping
    public ResponseEntity<TermConfig> create(@RequestBody TermConfig config) {
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());
        termConfigMapper.insert(config);
        return ResponseEntity.ok(config);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TermConfig> update(@PathVariable Long id, @RequestBody TermConfig config) {
        config.setId(id);
        config.setUpdatedAt(LocalDateTime.now());
        termConfigMapper.update(config);
        return ResponseEntity.ok(config);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        termConfigMapper.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
