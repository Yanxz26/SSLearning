package com.example.app.controller;

import com.example.app.entity.WrongQuestion;
import com.example.app.mapper.WrongQuestionMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/wrong-questions")
public class WrongQuestionController {

    private final WrongQuestionMapper wrongQuestionMapper;

    public WrongQuestionController(WrongQuestionMapper wrongQuestionMapper) {
        this.wrongQuestionMapper = wrongQuestionMapper;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WrongQuestion>> getByUserId(@PathVariable Long userId) {
        List<WrongQuestion> questions = wrongQuestionMapper.selectByUserId(userId);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/user/{userId}/subject/{subject}")
    public ResponseEntity<List<WrongQuestion>> getByUserIdAndSubject(@PathVariable Long userId, @PathVariable String subject) {
        List<WrongQuestion> questions = wrongQuestionMapper.selectByUserIdAndSubject(userId, subject);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WrongQuestion> getById(@PathVariable Long id) {
        WrongQuestion question = wrongQuestionMapper.selectById(id);
        return ResponseEntity.ok(question);
    }

    @PostMapping
    public ResponseEntity<WrongQuestion> create(@RequestBody WrongQuestion question) {
        question.setCreatedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        wrongQuestionMapper.insert(question);
        return ResponseEntity.ok(question);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WrongQuestion> update(@PathVariable Long id, @RequestBody WrongQuestion question) {
        question.setId(id);
        question.setUpdatedAt(LocalDateTime.now());
        wrongQuestionMapper.update(question);
        return ResponseEntity.ok(question);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        wrongQuestionMapper.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
