package com.example.app.dto;

/**
 * 单条同步操作的结果。
 */
public class SyncResult {

    private String clientOpId;
    private boolean success;
    private String message;
    private Long serverId;   // CREATE 成功后返回服务端ID
    private String tempId;   // 回传客户端临时ID，用于映射

    public SyncResult() {}

    public SyncResult(String clientOpId, boolean success, String message) {
        this.clientOpId = clientOpId;
        this.success = success;
        this.message = message;
    }

    public String getClientOpId() { return clientOpId; }
    public void setClientOpId(String clientOpId) { this.clientOpId = clientOpId; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getServerId() { return serverId; }
    public void setServerId(Long serverId) { this.serverId = serverId; }
    public String getTempId() { return tempId; }
    public void setTempId(String tempId) { this.tempId = tempId; }
}
