package com.example.admin.controller;

import com.example.admin.dto.ApiResponse;
import com.example.admin.service.FocusRecordService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/focus")
public class FocusRecordController {

    @Resource
    private FocusRecordService focusRecordService;

    @GetMapping("/list")
    public ApiResponse<?> list(@RequestParam(required = false) Long userId,
                               @RequestParam(required = false) String startDate,
                               @RequestParam(required = false) String endDate,
                               @RequestParam(defaultValue = "1") Integer pageNum,
                               @RequestParam(defaultValue = "10") Integer pageSize) {
        return focusRecordService.list(userId, startDate, endDate, pageNum, pageSize);
    }

    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) {
        return focusRecordService.detail(id);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        return focusRecordService.delete(id);
    }
}
