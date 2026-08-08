package com.example.admin.dto;

import lombok.Data;

@Data
public class PageRequest {
    private Integer pageNum = 1;
    private Integer pageSize = 10;

    public int getOffset() {
        return (pageNum - 1) * pageSize;
    }
}
