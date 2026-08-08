package com.example.app.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * 图片上传接口。
 *
 * 落盘规则：{app.upload.dir}/notes/yyyyMM/{uuid}.{ext}
 * 返回给前端的是相对访问路径，例如 /uploads/notes/202608/xxxx.jpg，
 * 由 WebConfig 里的静态资源映射对外提供访问。
 */
@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    /** 允许的图片扩展名（小写） */
    private static final List<String> ALLOWED_EXT = Arrays.asList("jpg", "jpeg", "png", "gif", "bmp", "webp");

    /** 单文件大小上限 10MB，与 application.yml 的 multipart 配置保持一致 */
    private static final long MAX_SIZE = 10L * 1024 * 1024;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.url-prefix:/uploads}")
    private String urlPrefix;

    /**
     * 上传单张图片。
     *
     * @param file     表单字段名固定为 file（小程序 wx.uploadFile 的 name 参数要对应）
     * @param business 业务目录，默认 notes，可传 wrong 等
     * @return { "url": "/uploads/notes/202608/xxx.jpg", "name": "原文件名" }
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "business", required = false, defaultValue = "notes") String business) {

        Map<String, Object> result = new HashMap<>();

        if (file == null || file.isEmpty()) {
            result.put("error", "文件为空");
            return ResponseEntity.badRequest().body(result);
        }
        if (file.getSize() > MAX_SIZE) {
            result.put("error", "文件超过 10MB 限制");
            return ResponseEntity.badRequest().body(result);
        }

        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String ext = extensionOf(originalName);
        if (!ALLOWED_EXT.contains(ext)) {
            result.put("error", "仅支持图片格式: " + ALLOWED_EXT);
            return ResponseEntity.badRequest().body(result);
        }

        // 只允许字母数字的业务目录，防止路径穿越
        String safeBusiness = business.replaceAll("[^a-zA-Z0-9_-]", "");
        if (safeBusiness.isEmpty()) {
            safeBusiness = "notes";
        }

        String monthDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        String fileName = UUID.randomUUID().toString().replace("-", "") + "." + ext;

        try {
            Path targetDir = Paths.get(uploadDir, safeBusiness, monthDir).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);

            Path target = targetDir.resolve(fileName);
            try (java.io.InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            String url = urlPrefix + "/" + safeBusiness + "/" + monthDir + "/" + fileName;
            result.put("url", url);
            result.put("name", originalName);
            result.put("size", file.getSize());
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            result.put("error", "保存文件失败: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    /**
     * 删除已上传的图片（传相对 URL，如 /uploads/notes/202608/xxx.jpg）。
     * 找不到文件也返回成功，保证前端删除操作幂等。
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> delete(@RequestParam("url") String url) {
        Map<String, Object> result = new HashMap<>();

        if (url == null || !url.startsWith(urlPrefix + "/")) {
            result.put("error", "非法的文件路径");
            return ResponseEntity.badRequest().body(result);
        }
        // 拒绝任何路径穿越
        if (url.contains("..")) {
            result.put("error", "非法的文件路径");
            return ResponseEntity.badRequest().body(result);
        }

        String relative = url.substring(urlPrefix.length() + 1);
        try {
            Path base = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path target = base.resolve(relative).normalize();
            // 二次校验：解析后的路径必须仍在上传根目录内
            if (!target.startsWith(base)) {
                result.put("error", "非法的文件路径");
                return ResponseEntity.badRequest().body(result);
            }
            Files.deleteIfExists(target);
            result.put("success", true);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            result.put("error", "删除失败: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    private String extensionOf(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot < 0 || dot == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
