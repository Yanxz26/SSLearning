package com.example.admin.converter;

import org.springframework.beans.BeanUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Entity ↔ DTO 转换工具类。
 * 基于 BeanUtils.copyProperties 实现字段同名拷贝。
 */
public class EntityConverter {

    /**
     * 将 Entity 列表转换为 Response DTO 列表
     */
    public static <S, T> List<T> convertList(List<S> sourceList, Class<T> targetClass) {
        if (sourceList == null) {
            return null;
        }
        return sourceList.stream()
                .map(source -> convert(source, targetClass))
                .collect(Collectors.toList());
    }

    /**
     * 将单个 Entity 转换为 Response DTO
     */
    public static <S, T> T convert(S source, Class<T> targetClass) {
        if (source == null) {
            return null;
        }
        try {
            T target = targetClass.getDeclaredConstructor().newInstance();
            BeanUtils.copyProperties(source, target);
            return target;
        } catch (Exception e) {
            throw new RuntimeException("DTO转换失败: " + targetClass.getSimpleName(), e);
        }
    }

    /**
     * 将 Request DTO 转换为 Entity
     */
    public static <S, T> T toEntity(S source, Class<T> entityClass) {
        return convert(source, entityClass);
    }
}
