package com.example.app.controller;

import com.example.app.mapper.TodoMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final TodoMapper todoMapper;

    public StatsController(TodoMapper todoMapper) {
        this.todoMapper = todoMapper;
    }

    @GetMapping("/tasks/user/{userId}")
    public ResponseEntity<Map<String, Object>> getTaskStats(@PathVariable Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        Integer totalTasks = todoMapper.countByUserId(userId);
        Integer completedTasks = todoMapper.countCompletedByUserId(userId);
        
        stats.put("total", totalTasks != null ? totalTasks : 0);
        stats.put("completed", completedTasks != null ? completedTasks : 0);
        stats.put("completionRate", totalTasks != null && totalTasks > 0 
            ? Math.round((completedTasks * 100.0) / totalTasks) : 0);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/tasks/trend/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getTaskTrend(@PathVariable Long userId) {
        List<Map<String, Object>> trend = todoMapper.getTaskCompletionTrend(userId);
        return ResponseEntity.ok(trend);
    }
}
