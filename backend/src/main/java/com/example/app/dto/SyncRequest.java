package com.example.app.dto;

import java.util.List;

/**
 * 弱网补偿同步请求 DTO。
 * 客户端将离线期间积攒的增删改操作打包发送，服务端逐条执行并返回结果。
 */
public class SyncRequest {

    private Long userId;
    private List<SyncOperation> operations;

    public static class SyncOperation {
        private String clientOpId;   // 客户端生成的唯一操作ID，用于幂等去重
        private String entityType;   // TODO / NOTE / WRONG_QUESTION / FOCUS_RECORD
        private String action;       // CREATE / UPDATE / DELETE
        private Long entityId;       // UPDATE/DELETE 时为服务端ID，CREATE 时为 null
        private String tempId;       // CREATE 时客户端临时ID，用于客户端映射服务端ID
        private Object data;         // 操作数据（Entity JSON）

        public String getClientOpId() { return clientOpId; }
        public void setClientOpId(String clientOpId) { this.clientOpId = clientOpId; }
        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public Long getEntityId() { return entityId; }
        public void setEntityId(Long entityId) { this.entityId = entityId; }
        public String getTempId() { return tempId; }
        public void setTempId(String tempId) { this.tempId = tempId; }
        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public List<SyncOperation> getOperations() { return operations; }
    public void setOperations(List<SyncOperation> operations) { this.operations = operations; }
}
