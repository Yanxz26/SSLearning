package com.example.admin.dto;

import lombok.Data;

@Data
public class ApiResponse<T> {
    private int code;
    private String msg;
    private T data;
    private Long total;

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(200);
        response.setMsg("操作成功");
        response.setData(data);
        return response;
    }

    public static <T> ApiResponse<T> success(T data, Long total) {
        ApiResponse<T> response = success(data);
        response.setTotal(total);
        return response;
    }

    public static <T> ApiResponse<T> successMsg(String msg) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(200);
        response.setMsg(msg);
        return response;
    }

    public static <T> ApiResponse<T> error(int code, String msg) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(code);
        response.setMsg(msg);
        return response;
    }

    public static <T> ApiResponse<T> error(String msg) {
        return error(500, msg);
    }
}
