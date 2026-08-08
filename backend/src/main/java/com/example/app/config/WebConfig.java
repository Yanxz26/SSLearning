package com.example.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.url-prefix:/uploads}")
    private String urlPrefix;

    /**
     * 把上传目录映射为静态资源，使 /uploads/** 可以直接被浏览器/小程序访问。
     * 例如磁盘上的 uploads/notes/202608/a.jpg → http://localhost:8080/uploads/notes/202608/a.jpg
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().normalize().toString();
        registry.addResourceHandler(urlPrefix + "/**")
                .addResourceLocations("file:" + absolutePath + "/");
    }

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        StringHttpMessageConverter stringConverter = new StringHttpMessageConverter();
        stringConverter.setDefaultCharset(StandardCharsets.UTF_8);
        converters.add(stringConverter);
        
        MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter();
        jsonConverter.setDefaultCharset(StandardCharsets.UTF_8);
        converters.add(jsonConverter);
    }
}