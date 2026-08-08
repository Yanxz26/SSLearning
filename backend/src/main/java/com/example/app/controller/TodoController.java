package com.example.app.controller;

import com.example.app.entity.Todo;
import com.example.app.mapper.TodoMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TodoController {

    private final TodoMapper todoMapper;

    public TodoController(TodoMapper todoMapper) {
        this.todoMapper = todoMapper;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Todo>> getByUserId(@PathVariable Long userId) {
        List<Todo> todos = todoMapper.selectByUserId(userId);
        return ResponseEntity.ok(todos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Todo> getById(@PathVariable Long id) {
        Todo todo = todoMapper.selectById(id);
        if (todo == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(todo);
    }

    @GetMapping("/user/{userId}/cleanup")
    public ResponseEntity<String> cleanupDuplicates(@PathVariable Long userId) {
        List<Todo> todos = todoMapper.selectByUserId(userId);
        
        // 按title分组，保留每组中id最小的（最早创建的）
        java.util.Map<String, List<Todo>> grouped = todos.stream()
            .collect(Collectors.groupingBy(t -> t.getTitle() + "_" + t.getCategory()));
        
        int deletedCount = 0;
        for (List<Todo> group : grouped.values()) {
            if (group.size() > 1) {
                // 保留第一个（id最小的）
                Todo keep = group.stream().min((a, b) -> a.getId().compareTo(b.getId())).orElse(null);
                for (Todo t : group) {
                    if (t.getId() != keep.getId()) {
                        todoMapper.deleteById(t.getId());
                        deletedCount++;
                    }
                }
            }
        }
        
        return ResponseEntity.ok("清理完成，删除了 " + deletedCount + " 条重复数据");
    }

    @PostMapping
    public ResponseEntity<Todo> create(@RequestBody Todo todo) {
        todo.setCompleted(false);
        todo.setCreatedAt(LocalDateTime.now());
        todo.setUpdatedAt(LocalDateTime.now());
        todoMapper.insert(todo);
        
        // 插入后重新查询，确保返回正确的ID
        Todo saved = todoMapper.selectById(todo.getId());
        if (saved != null) {
            return ResponseEntity.ok(saved);
        }
        
        return ResponseEntity.ok(todo);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<Todo>> batchCreate(@RequestBody java.util.Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        List<java.util.Map<String, Object>> taskList = (List<java.util.Map<String, Object>>) request.get("tasks");
        
        // 检查是否已有任务，避免重复插入
        List<Todo> existingTodos = todoMapper.selectByUserId(userId);
        if (existingTodos.size() > 0) {
            return ResponseEntity.ok(existingTodos);
        }
        
        List<Todo> todos = taskList.stream().map(taskMap -> {
            Todo todo = new Todo();
            todo.setUserId(userId);
            todo.setTitle((String) taskMap.get("title"));
            todo.setCategory((String) taskMap.get("category"));
            todo.setDeadline((String) taskMap.get("deadline"));
            todo.setDescription((String) taskMap.get("description"));
            todo.setRemindEnabled((Boolean) taskMap.getOrDefault("remind", false));
            todo.setPriority(taskMap.get("priority") != null ? ((Number) taskMap.get("priority")).intValue() : 3);
            todo.setCompleted(false);
            todo.setCreatedAt(LocalDateTime.now());
            todo.setUpdatedAt(LocalDateTime.now());
            todoMapper.insert(todo);
            return todo;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(todos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Todo> update(@PathVariable Long id, @RequestBody Todo todo) {
        todo.setId(id);
        todo.setUpdatedAt(LocalDateTime.now());
        todoMapper.update(todo);
        Todo updated = todoMapper.selectById(id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        todoMapper.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/user/{userId}/all")
    public ResponseEntity<String> deleteAllByUserId(@PathVariable Long userId) {
        todoMapper.deleteByUserId(userId);
        return ResponseEntity.ok("已删除用户 " + userId + " 的所有任务");
    }
}
