package com.example.app.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

/**
 * 让 Jackson 在反序列化 LocalDateTime 时兼容小程序提交的多种时间格式。
 *
 * <p>问题定位：前端（小程序）各页面用 formatDate() 生成 "2026/08/08 13:39:55" 这种斜杠格式的时间，
 * 并通过同步接口 /api/sync/batch 的 op.data 一并提交。服务端在 SyncController 中用
 * {@code objectMapper.convertValue(op.getData(), XxxEntity.class)} 反序列化时，
 * Jackson 默认的 LocalDateTime 反序列化器只认 ISO-8601（"2026-08-08T13:39:55"），
 * 遇到斜杠格式会抛 IllegalArgumentException，导致整条 CREATE/UPDATE 操作在落库前就失败、
 * 数据无法写入数据库。表现就是「真机新建任务过一会消失、开发者工具也看不到」。
 *
 * <p>这里注册一个「多格式容忍」反序列化器，依次尝试多种常见格式，全部失败才报错。
 * 这样服务端对时间格式不再敏感，也不需要改动前端即可正常同步。序列化（返回给客户端）仍走默认 ISO 格式，不受影响。
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer localDateTimeDeserializerCustomizer() {
        return builder -> builder.deserializerByType(
                LocalDateTime.class,
                new TolerantLocalDateTimeDeserializer());
    }

    static class TolerantLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

        private static final List<DateTimeFormatter> FORMATTERS = Arrays.asList(
                DateTimeFormatter.ISO_LOCAL_DATE_TIME,
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
                DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("yyyy/MM/dd")
        );

        @Override
        public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            String text = p.getValueAsString();
            if (text == null || text.trim().isEmpty()) {
                return null;
            }
            String trimmed = text.trim();
            for (DateTimeFormatter fmt : FORMATTERS) {
                try {
                    return LocalDateTime.parse(trimmed, fmt);
                } catch (Exception ignore) {
                    // 尝试下一种格式
                }
            }
            // 无法识别的格式，抛出与原生行为一致的异常，避免静默吞错
            throw new IllegalArgumentException("无法解析 LocalDateTime: " + trimmed);
        }
    }
}
