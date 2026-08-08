package com.example.admin.controller;

import com.example.admin.dto.ApiResponse;
import com.example.admin.dto.request.TermConfigRequest;
import com.example.admin.entity.TermConfig;
import com.example.admin.converter.EntityConverter;
import com.example.admin.service.TermConfigService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/term")
public class TermConfigController {

    @Resource
    private TermConfigService termConfigService;

    @GetMapping("/list")
    public ApiResponse<?> list(@RequestParam(defaultValue = "1") Integer pageNum,
                               @RequestParam(defaultValue = "10") Integer pageSize) {
        return termConfigService.list(pageNum, pageSize);
    }

    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) {
        return termConfigService.detail(id);
    }

    @PostMapping("/add")
    public ApiResponse<?> add(@RequestBody TermConfigRequest request) {
        TermConfig termConfig = EntityConverter.toEntity(request, TermConfig.class);
        return termConfigService.add(termConfig);
    }

    @PutMapping("/update")
    public ApiResponse<?> update(@RequestBody TermConfigRequest request) {
        TermConfig termConfig = EntityConverter.toEntity(request, TermConfig.class);
        return termConfigService.update(termConfig);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        return termConfigService.delete(id);
    }
}
