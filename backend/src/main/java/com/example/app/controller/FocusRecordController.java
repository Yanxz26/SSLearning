package com.example.app.controller;

import com.example.app.entity.FocusRecord;
import com.example.app.mapper.FocusRecordMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/focus-records")
public class FocusRecordController {

    private final FocusRecordMapper focusRecordMapper;

    public FocusRecordController(FocusRecordMapper focusRecordMapper) {
        this.focusRecordMapper = focusRecordMapper;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FocusRecord>> getByUserId(@PathVariable Long userId) {
        List<FocusRecord> records = focusRecordMapper.selectByUserId(userId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/user/{userId}/date/{date}")
    public ResponseEntity<List<FocusRecord>> getByUserIdAndDate(@PathVariable Long userId, @PathVariable String date) {
        List<FocusRecord> records = focusRecordMapper.selectByUserIdAndDate(userId, date);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@PathVariable Long userId, 
                                                          @RequestParam String startDate, 
                                                          @RequestParam String endDate) {
        Integer totalMinutes = focusRecordMapper.sumFocusDurationByUserIdAndDateRange(userId, startDate, endDate);
        Map<String, Object> result = new HashMap<>();
        result.put("totalMinutes", totalMinutes != null ? totalMinutes : 0);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<FocusRecord> create(@RequestBody FocusRecord record) {
        record.setCreatedAt(LocalDateTime.now());
        focusRecordMapper.insert(record);
        return ResponseEntity.ok(record);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        focusRecordMapper.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
