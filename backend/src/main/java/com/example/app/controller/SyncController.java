package com.example.app.controller;

import com.example.app.dto.SyncRequest;
import com.example.app.dto.SyncResult;
import com.example.app.entity.FocusRecord;
import com.example.app.entity.Note;
import com.example.app.entity.Todo;
import com.example.app.entity.WrongQuestion;
import com.example.app.mapper.FocusRecordMapper;
import com.example.app.mapper.NoteMapper;
import com.example.app.mapper.TodoMapper;
import com.example.app.mapper.WrongQuestionMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 弱网补偿同步接口。
 * 客户端在离线/弱网期间积攒的操作打包发送，服务端逐条执行。
 * 通过 clientOpId 实现幂等：已处理的操作直接返回成功。
 */
@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private static final Logger log = LoggerFactory.getLogger(SyncController.class);

    private final TodoMapper todoMapper;
    private final NoteMapper noteMapper;
    private final WrongQuestionMapper wrongQuestionMapper;
    private final FocusRecordMapper focusRecordMapper;
    private final ObjectMapper objectMapper;

    // 简易幂等去重：记录已处理的 clientOpId（生产环境可换 Redis）
    private static final Set<String> processedOpIds = new HashSet<>();

    public SyncController(TodoMapper todoMapper,
                          NoteMapper noteMapper,
                          WrongQuestionMapper wrongQuestionMapper,
                          FocusRecordMapper focusRecordMapper,
                          ObjectMapper objectMapper) {
        this.todoMapper = todoMapper;
        this.noteMapper = noteMapper;
        this.wrongQuestionMapper = wrongQuestionMapper;
        this.focusRecordMapper = focusRecordMapper;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/batch")
    public ResponseEntity<List<SyncResult>> batchSync(@RequestBody SyncRequest request) {
        log.info("收到同步请求: userId={}, operations={}", request.getUserId(), 
                request.getOperations() != null ? request.getOperations().size() : 0);

        List<SyncResult> results = new ArrayList<>();

        if (request.getOperations() == null || request.getOperations().isEmpty()) {
            return ResponseEntity.ok(results);
        }

        for (SyncRequest.SyncOperation op : request.getOperations()) {
            SyncResult result = processOperation(request.getUserId(), op);
            results.add(result);
        }

        log.info("同步完成: {}/{} 成功", results.stream().filter(SyncResult::isSuccess).count(), results.size());
        return ResponseEntity.ok(results);
    }

    private SyncResult processOperation(Long userId, SyncRequest.SyncOperation op) {
        SyncResult result = new SyncResult();
        result.setClientOpId(op.getClientOpId());
        result.setTempId(op.getTempId());

        // 幂等检查：已处理的操作直接返回成功
        if (op.getClientOpId() != null && processedOpIds.contains(op.getClientOpId())) {
            result.setSuccess(true);
            result.setMessage("操作已处理（幂等跳过）");
            return result;
        }

        try {
            switch (op.getEntityType()) {
                case "TODO":
                    processTodo(userId, op, result);
                    break;
                case "NOTE":
                    processNote(userId, op, result);
                    break;
                case "WRONG_QUESTION":
                    processWrongQuestion(userId, op, result);
                    break;
                case "FOCUS_RECORD":
                    processFocusRecord(userId, op, result);
                    break;
                default:
                    result.setSuccess(false);
                    result.setMessage("未知实体类型: " + op.getEntityType());
            }

            // 标记为已处理
            if (op.getClientOpId() != null) {
                processedOpIds.add(op.getClientOpId());
            }
        } catch (Exception e) {
            log.error("同步操作失败: opId={}, type={}, action={}", 
                    op.getClientOpId(), op.getEntityType(), op.getAction(), e);
            result.setSuccess(false);
            result.setMessage("同步失败: " + e.getMessage());
        }

        return result;
    }

    private void processTodo(Long userId, SyncRequest.SyncOperation op, SyncResult result) {
        switch (op.getAction()) {
            case "CREATE": {
                Todo todo = objectMapper.convertValue(op.getData(), Todo.class);
                todo.setUserId(userId);
                todo.setCompleted(todo.getCompleted() != null ? todo.getCompleted() : false);
                todo.setCreatedAt(LocalDateTime.now());
                todo.setUpdatedAt(LocalDateTime.now());
                todoMapper.insert(todo);
                result.setSuccess(true);
                result.setServerId(todo.getId());
                result.setMessage("创建成功");
                break;
            }
            case "UPDATE": {
                Todo todo = objectMapper.convertValue(op.getData(), Todo.class);
                todo.setId(op.getEntityId());
                todo.setUserId(userId);
                todo.setUpdatedAt(LocalDateTime.now());
                todoMapper.update(todo);
                result.setSuccess(true);
                result.setServerId(op.getEntityId());
                result.setMessage("更新成功");
                break;
            }
            case "DELETE": {
                todoMapper.deleteById(op.getEntityId());
                result.setSuccess(true);
                result.setMessage("删除成功");
                break;
            }
            default:
                result.setSuccess(false);
                result.setMessage("未知操作: " + op.getAction());
        }
    }

    private void processNote(Long userId, SyncRequest.SyncOperation op, SyncResult result) {
        switch (op.getAction()) {
            case "CREATE": {
                Note note = objectMapper.convertValue(op.getData(), Note.class);
                note.setUserId(userId);
                note.setCreatedAt(LocalDateTime.now());
                note.setUpdatedAt(LocalDateTime.now());
                noteMapper.insert(note);
                result.setSuccess(true);
                result.setServerId(note.getId());
                result.setMessage("创建成功");
                break;
            }
            case "UPDATE": {
                Note note = objectMapper.convertValue(op.getData(), Note.class);
                note.setId(op.getEntityId());
                note.setUserId(userId);
                note.setUpdatedAt(LocalDateTime.now());
                noteMapper.update(note);
                result.setSuccess(true);
                result.setServerId(op.getEntityId());
                result.setMessage("更新成功");
                break;
            }
            case "DELETE": {
                noteMapper.deleteById(op.getEntityId());
                result.setSuccess(true);
                result.setMessage("删除成功");
                break;
            }
            default:
                result.setSuccess(false);
                result.setMessage("未知操作: " + op.getAction());
        }
    }

    private void processWrongQuestion(Long userId, SyncRequest.SyncOperation op, SyncResult result) {
        switch (op.getAction()) {
            case "CREATE": {
                WrongQuestion wq = objectMapper.convertValue(op.getData(), WrongQuestion.class);
                wq.setUserId(userId);
                wq.setCreatedAt(LocalDateTime.now());
                wq.setUpdatedAt(LocalDateTime.now());
                wrongQuestionMapper.insert(wq);
                result.setSuccess(true);
                result.setServerId(wq.getId());
                result.setMessage("创建成功");
                break;
            }
            case "UPDATE": {
                WrongQuestion wq = objectMapper.convertValue(op.getData(), WrongQuestion.class);
                wq.setId(op.getEntityId());
                wq.setUserId(userId);
                wq.setUpdatedAt(LocalDateTime.now());
                wrongQuestionMapper.update(wq);
                result.setSuccess(true);
                result.setServerId(op.getEntityId());
                result.setMessage("更新成功");
                break;
            }
            case "DELETE": {
                wrongQuestionMapper.deleteById(op.getEntityId());
                result.setSuccess(true);
                result.setMessage("删除成功");
                break;
            }
            default:
                result.setSuccess(false);
                result.setMessage("未知操作: " + op.getAction());
        }
    }

    private void processFocusRecord(Long userId, SyncRequest.SyncOperation op, SyncResult result) {
        switch (op.getAction()) {
            case "CREATE": {
                FocusRecord record = objectMapper.convertValue(op.getData(), FocusRecord.class);
                record.setUserId(userId);
                record.setCreatedAt(LocalDateTime.now());
                focusRecordMapper.insert(record);
                result.setSuccess(true);
                result.setServerId(record.getId());
                result.setMessage("创建成功");
                break;
            }
            case "DELETE": {
                focusRecordMapper.deleteById(op.getEntityId());
                result.setSuccess(true);
                result.setMessage("删除成功");
                break;
            }
            default:
                result.setSuccess(false);
                result.setMessage("未知操作: " + op.getAction());
        }
    }
}
