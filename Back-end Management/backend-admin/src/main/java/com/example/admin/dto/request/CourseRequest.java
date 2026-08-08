package com.example.admin.dto.request;

import lombok.Data;

/**
 * 课程创建/更新请求 DTO，与 Entity 分离。
 * 不包含 id、createdAt、updatedAt 等系统字段。
 */
@Data
public class CourseRequest {
    private Long id;
    private Long userId;
    private String name;
    private String teacher;
    private String room;
    private Integer dayOfWeek;
    private Integer timeSlot;
    private String color;
    private Boolean remindEnabled;
    private Integer remindMinutes;
    private Integer startWeek;
    private Integer endWeek;
}
