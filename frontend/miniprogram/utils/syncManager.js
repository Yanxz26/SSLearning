/**
 * 弱网补偿同步管理器
 * 
 * 核心机制：
 * 1. 所有写操作（POST/PUT/DELETE）先写入本地操作队列，再尝试发送
 * 2. 网络失败时操作保留在队列中，不阻塞用户操作
 * 3. 网络恢复或 App 重新启动时，自动 flush 队列
 * 4. 使用指数退避重试（1s → 2s → 4s → 8s → max 30s）
 * 5. 通过 clientOpId 实现幂等，防止重复提交
 */

const STORAGE_KEY = 'sync_operation_queue'
const MAX_RETRY = 5
const BASE_DELAY = 1000   // 1秒
const MAX_DELAY = 30000   // 30秒
const DEFAULT_USER_ID = 3 // 数据库已有数据归属 user_id=3

let isSyncing = false
let retryCount = 0
let listeners = []
// 只保留一个待重试定时器。历史实现每次失败都 setTimeout，多次失败会叠加出多条
// 并行定时器链，到点后集中 flush，制造请求风暴并加剧 timeout。
let retryTimer = null

// ==================== 队列持久化 ====================

function loadQueue() {
  try {
    const data = wx.getStorageSync(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('[SyncManager] loadQueue error:', e)
    return []
  }
}

function saveQueue(queue) {
  try {
    wx.setStorageSync(STORAGE_KEY, JSON.stringify(queue))
  } catch (e) {
    console.error('[SyncManager] saveQueue error:', e)
  }
}

/**
 * 回写队列
 *
 * 为什么需要它：flush() 发请求前对队列做了快照，请求往返期间用户很可能又
 * 新增/删除了内容并入队。如果成功回调里直接 saveQueue(failedOps)，那些
 * 「飞行中新入队」的操作就会被整体覆盖掉 —— 表现为「删了一条任务，整个
 * 同步队列也跟着没了」。
 *
 * @param {Array} processedOps 本次 flush 的快照
 * @param {Array} keepOps      快照中需要保留（继续重试）的操作
 */
function reconcileQueue(processedOps, keepOps) {
  const processedIds = {}
  ;(processedOps || []).forEach(function (o) { if (o) processedIds[o.clientOpId] = true })

  const keepMap = {}
  ;(keepOps || []).forEach(function (o) { if (o) keepMap[o.clientOpId] = o })

  const merged = []
  loadQueue().forEach(function (op) {
    if (!op) return
    if (processedIds[op.clientOpId]) {
      // 属于本次快照：只有仍需重试的才保留（并带上更新后的 retryCount）
      if (keepMap[op.clientOpId]) merged.push(keepMap[op.clientOpId])
    } else {
      // flush 期间新入队的操作：原样保留，绝不能丢
      merged.push(op)
    }
  })
  saveQueue(merged)
}

// ==================== 操作入队 ====================

/**
 * 生成唯一操作ID（用于幂等去重）
 */
function generateOpId() {
  return 'op_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * 将写操作加入同步队列
 * @param {string} entityType - TODO / NOTE / WRONG_QUESTION / FOCUS_RECORD
 * @param {string} action - CREATE / UPDATE / DELETE
 * @param {object} data - 操作数据
 * @param {number} entityId - 服务端ID（UPDATE/DELETE 时需要）
 * @param {string} tempId - 客户端临时ID（CREATE 时用于映射）
 * @returns {string} clientOpId
 */
function enqueue(entityType, action, data, entityId, tempId) {
  const op = {
    clientOpId: generateOpId(),
    entityType: entityType,
    action: action,
    entityId: entityId || null,
    tempId: tempId || null,
    data: data,
    timestamp: Date.now(),
    retryCount: 0
  }

  const queue = loadQueue()
  queue.push(op)
  saveQueue(queue)

  console.log('[SyncManager] 操作入队:', op.clientOpId, entityType, action)
  
  // 尝试立即同步
  flush()
  
  return op.clientOpId
}

/**
 * 撤销队列中尚未同步的 CREATE 操作。
 *
 * 场景：离线新建了一条待办（只有 tempId、还没拿到服务端 id），用户马上又把它删了。
 * 此时不该把 CREATE 发出去再补一条 DELETE，直接把队列里那条 CREATE 撤掉即可。
 *
 * @returns {boolean} 是否撤销成功（true 表示无需再发 DELETE）
 */
function cancelPendingCreate(entityType, tempId) {
  if (!tempId) return false
  const queue = loadQueue()
  const remaining = queue.filter(function (op) {
    return !(op && op.entityType === entityType && op.action === 'CREATE' && op.tempId === tempId)
  })
  if (remaining.length === queue.length) return false

  // 同一 tempId 上后续的 UPDATE 也一并作废
  const cleaned = remaining.filter(function (op) {
    return !(op && op.entityType === entityType && op.tempId === tempId)
  })
  saveQueue(cleaned)
  console.log('[SyncManager] 已撤销未同步的 CREATE:', entityType, tempId)
  return true
}

// ==================== 同步执行 ====================

/**
 * 获取用户ID
 * 优先级：本地缓存 user_info -> app.globalData.getUserId() -> 默认 3
 * 注意：不能只读 user_info，自动登录禁用时它为空会导致 flush 永远跳过，队列只进不出。
 */
function getUserId() {
  try {
    const userInfo = wx.getStorageSync('user_info')
    if (userInfo) {
      const parsed = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
      if (parsed && (parsed.id || parsed.userId)) return parsed.id || parsed.userId
    }
  } catch (e) {
    console.error('[SyncManager] getUserId error:', e)
  }
  // 回退到全局（app.js 里定义了默认用户 3）
  try {
    if (typeof getApp === 'function') {
      const app = getApp()
      if (app && app.globalData && typeof app.globalData.getUserId === 'function') {
        const uid = app.globalData.getUserId()
        if (uid) return uid
      }
    }
  } catch (e) { /* App 尚未初始化完成，忽略 */ }
  return DEFAULT_USER_ID
}

/**
 * 执行同步：将队列中的操作批量发送到服务端
 */
function flush() {
  if (isSyncing) {
    console.log('[SyncManager] 已在同步中，跳过')
    return
  }

  const queue = loadQueue()
  if (queue.length === 0) {
    return
  }

  const userId = getUserId()
  if (!userId) {
    console.warn('[SyncManager] 无用户ID，跳过同步')
    return
  }

  isSyncing = true
  notifyListeners('syncing', { pending: queue.length })

  const baseUrl = require('./request.js').baseUrl
  const operations = queue.map(op => ({
    clientOpId: op.clientOpId,
    entityType: op.entityType,
    action: op.action,
    entityId: op.entityId,
    tempId: op.tempId,
    data: op.data
  }))

  console.log('[SyncManager] 开始同步:', operations.length, '条操作')
  const startedAt = Date.now()

  wx.request({
    url: baseUrl + '/sync/batch',
    method: 'POST',
    data: {
      userId: userId,
      operations: operations
    },
    header: { 'Content-Type': 'application/json' },
    timeout: 30000,
    success: (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('[SyncManager] 同步完成，耗时', Date.now() - startedAt, 'ms')
        handleSyncSuccess(queue, res.data)
        retryCount = 0
        // 成功后清掉可能还挂着的退避定时器，防止无谓的重复 flush
        if (retryTimer) {
          clearTimeout(retryTimer)
          retryTimer = null
        }
      } else {
        handleSyncFailure(queue, 'HTTP ' + res.statusCode)
      }
    },
    fail: (err) => {
      const cost = Date.now() - startedAt
      const msg = (err && err.errMsg) || '网络请求失败'
      // 标注是 /sync/batch 超时，避免和页面上的普通请求混淆
      console.error('[SyncManager] /sync/batch FAIL |', msg, '| 耗时', cost, 'ms',
        '| 本批', operations.length, '条')
      handleSyncFailure(queue, msg)
    },
    complete: () => {
      isSyncing = false
    }
  })
}

/**
 * 处理同步成功
 */
function handleSyncSuccess(queue, results) {
  const failedOps = []
  const successOpIds = new Set()
  const idMapping = loadIdMapping()

  // 关键：SyncResult 没有回传 entityType，只能从队列（op）里取，否则 idMapping 会被错误存成
  // "undefined:tempId"，导致后续 merge 查不到映射、去重失效、列表出现重复。
  const opEntityType = {}
  ;(queue || []).forEach(function (op) { if (op) opEntityType[op.clientOpId] = op.entityType })

  if (Array.isArray(results)) {
    results.forEach(result => {
      if (result.success) {
        successOpIds.add(result.clientOpId)
        // 如果是 CREATE 操作，自动写 ID 映射（tempId/tempKey -> serverId）
        if (result.tempId && result.serverId) {
          // 用 result.entityType+tempId 作 key，避免不同实体的 tempId 冲突
          const et = opEntityType[result.clientOpId] || 'NOTE'
          idMapping[et + ':' + result.tempId] = result.serverId
        }
      } else {
        // 找到对应的操作，增加重试计数
        const op = queue.find(q => q.clientOpId === result.clientOpId)
        if (op) {
          op.retryCount = (op.retryCount || 0) + 1
          if (op.retryCount < MAX_RETRY) {
            failedOps.push(op)
          } else {
            console.warn('[SyncManager] 操作超过最大重试次数，丢弃:', op.clientOpId)
            notifyListeners('opFailed', op)
          }
        }
      }
    })
  } else {
    // 服务端返回非数组，全部重试
    queue.forEach(op => {
      op.retryCount = (op.retryCount || 0) + 1
      if (op.retryCount < MAX_RETRY) {
        failedOps.push(op)
      }
    })
  }

  // 持久化 ID 映射
  saveIdMapping(idMapping)

  // 同步成功后，把本地乐观缓存里的 temp 项回写为真实 serverId，
  // 否则下一次合并会出现「临时项 + 服务端项」两条重复记录。
  results.forEach(function (result) {
    if (result && result.success && result.tempId && result.serverId) {
      const et = opEntityType[result.clientOpId] || 'NOTE'
      reconcileLocalCache(et, result.tempId, result.serverId)
    }
  })

  // 更新队列：移除成功的，保留失败的（同时保住 flush 期间新入队的操作）
  reconcileQueue(queue, failedOps)

  const successCount = successOpIds.size
  const failCount = failedOps.length
  console.log('[SyncManager] 同步完成: 成功', successCount, '失败', failCount)

  if (failCount > 0) {
    notifyListeners('partialFail', { success: successCount, failed: failCount })
    // 指数退避后重试
    scheduleRetry()
  } else {
    notifyListeners('synced', { count: successCount })
  }
}

// ==================== ID 映射 ====================

const ID_MAPPING_KEY = 'sync_id_mapping'

function loadIdMapping() {
  try {
    const data = wx.getStorageSync(ID_MAPPING_KEY)
    return data ? JSON.parse(data) : {}
  } catch (e) {
    return {}
  }
}

function saveIdMapping(mapping) {
  try {
    wx.setStorageSync(ID_MAPPING_KEY, JSON.stringify(mapping))
  } catch (e) {
    console.error('[SyncManager] saveIdMapping error:', e)
  }
}

/**
 * 把本地乐观缓存中的 temp 项回写为真实 serverId。
 *
 * 同步成功后端返回 (tempId -> serverId) 的映射，本地缓存里那条 id:null 的乐观项
 * 应当被标记为已落库。否则下一次 mergeNotes/mergeWrong 会把「本地临时项」和
 * 「服务端返回项」当成两条不同的记录，导致列表里出现重复。
 */
const CACHE_KEY_BY_ENTITY = {
  NOTE: 'notes',
  WRONG_QUESTION: 'wrongQuestions',
  // 注意：todo.js / todo-add.js 用的本地缓存 key 是 'tasks'，不是 'todos'。
  // 历史上写成 'todos' 会让 reconcileLocalCache 找不到乐观项回填 serverId，
  // 表现为「新建任务后立即消失 / 同步成功后本地列表被服务端覆盖」。
  TODO: 'tasks',
  FOCUS_RECORD: 'focusRecords'
}

function reconcileLocalCache(entityType, tempId, serverId) {
  const key = CACHE_KEY_BY_ENTITY[entityType]
  if (!key) return
  try {
    const list = wx.getStorageSync(key)
    if (!Array.isArray(list) || list.length === 0) return
    let changed = false
    const next = list.map(function (it) {
      if (it && it.tempId === tempId && (it.id == null || it.id === '')) {
        changed = true
        const copy = Object.assign({}, it)
        copy.id = serverId
        delete copy.tempId
        return copy
      }
      return it
    })
    if (changed) wx.setStorageSync(key, next)
  } catch (e) {
    console.error('[SyncManager] reconcileLocalCache error:', e)
  }
}

/**
 * 通过 tempId 查找服务端 ID（已同步完成后有值）
 */
function getServerIdByTempId(entityType, tempId) {
  if (!tempId) return null
  const mapping = loadIdMapping()
  return mapping[entityType + ':' + tempId] || null
}

/**
 * 处理同步失败（网络层面）
 */
function handleSyncFailure(queue, reason) {
  console.warn('[SyncManager] 同步失败:', reason, '，队列保留', queue.length, '条操作')
  notifyListeners('syncFailed', { reason: reason, pending: queue.length })
  
  // 增加重试计数
  queue.forEach(op => {
    op.retryCount = (op.retryCount || 0) + 1
  })
  
  // 移除超过最大重试次数的操作
  const validOps = queue.filter(op => op.retryCount < MAX_RETRY)
  const droppedCount = queue.length - validOps.length
  if (droppedCount > 0) {
    console.warn('[SyncManager] 丢弃', droppedCount, '条超过重试上限的操作')
  }
  reconcileQueue(queue, validOps)
  
  scheduleRetry()
}

/**
 * 指数退避重试
 */
function scheduleRetry() {
  // 队列已空（例如全部超过重试上限被丢弃）就没必要再排重试，否则会留下空转定时器
  if (loadQueue().length === 0) {
    console.log('[SyncManager] 队列已空，取消重试排程')
    retryCount = 0
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
    return
  }

  // 去重：同一时刻只允许存在一个待重试定时器
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = null
  }

  retryCount++
  const delay = Math.min(BASE_DELAY * Math.pow(2, retryCount - 1), MAX_DELAY)
  console.log('[SyncManager] 将在', delay / 1000, '秒后重试 (第', retryCount, '次)')

  retryTimer = setTimeout(() => {
    retryTimer = null
    flush()
  }, delay)
}

// ==================== 网络监听 ====================

/**
 * 初始化网络状态监听
 */
function init() {
  // 监听网络状态变化
  wx.onNetworkStatusChange((res) => {
    console.log('[SyncManager] 网络状态变化:', res.isConnected, res.networkType)
    if (res.isConnected) {
      // 网络恢复，重置重试计数并立即同步
      retryCount = 0
      // 同时取消排队中的退避重试，避免「立即同步」和「定时重试」双发
      if (retryTimer) {
        clearTimeout(retryTimer)
        retryTimer = null
      }
      flush()
    }
  })

  // 启动时尝试同步
  flush()
}

// ==================== 状态查询与监听 ====================

/**
 * 获取待同步操作数量
 */
function getPendingCount() {
  return loadQueue().length
}

/**
 * 注册同步状态监听器
 * @param {function} callback - 回调函数 (event, data) => {}
 * @returns {function} 取消监听函数
 */
function onStatusChange(callback) {
  listeners.push(callback)
  return () => {
    listeners = listeners.filter(l => l !== callback)
  }
}

function notifyListeners(event, data) {
  listeners.forEach(cb => {
    try {
      cb(event, data)
    } catch (e) {
      console.error('[SyncManager] listener error:', e)
    }
  })
}

// ==================== 便捷方法 ====================

/**
 * 同步创建待办
 */
function syncCreateTodo(data) {
  const tempId = 'temp_' + Date.now()
  return enqueue('TODO', 'CREATE', data, null, tempId)
}

/**
 * 同步更新待办
 */
function syncUpdateTodo(id, data) {
  return enqueue('TODO', 'UPDATE', data, id)
}

/**
 * 同步删除待办
 */
function syncDeleteTodo(id) {
  return enqueue('TODO', 'DELETE', null, id)
}

/**
 * 同步创建笔记
 */
function syncCreateNote(data, tempId) {
  tempId = tempId || ('temp_' + Date.now())
  return enqueue('NOTE', 'CREATE', data, null, tempId)
}

/**
 * 同步更新笔记
 */
function syncUpdateNote(id, data) {
  return enqueue('NOTE', 'UPDATE', data, id)
}

/**
 * 同步删除笔记
 */
function syncDeleteNote(id) {
  return enqueue('NOTE', 'DELETE', null, id)
}

/**
 * 同步创建错题
 */
function syncCreateWrongQuestion(data, tempId) {
  tempId = tempId || ('temp_' + Date.now())
  return enqueue('WRONG_QUESTION', 'CREATE', data, null, tempId)
}

/**
 * 同步更新错题
 */
function syncUpdateWrongQuestion(id, data) {
  return enqueue('WRONG_QUESTION', 'UPDATE', data, id)
}

/**
 * 同步删除错题
 */
function syncDeleteWrongQuestion(id) {
  return enqueue('WRONG_QUESTION', 'DELETE', null, id)
}

/**
 * 同步创建专注记录
 */
function syncCreateFocusRecord(data) {
  const tempId = 'temp_' + Date.now()
  return enqueue('FOCUS_RECORD', 'CREATE', data, null, tempId)
}

/**
 * 同步删除专注记录
 */
function syncDeleteFocusRecord(id) {
  return enqueue('FOCUS_RECORD', 'DELETE', null, id)
}

module.exports = {
  init,
  flush,
  enqueue,
  cancelPendingCreate,
  getPendingCount,
  getServerIdByTempId,
  onStatusChange,
  // 便捷方法
  syncCreateTodo,
  syncUpdateTodo,
  syncDeleteTodo,
  syncCreateNote,
  syncUpdateNote,
  syncDeleteNote,
  syncCreateWrongQuestion,
  syncUpdateWrongQuestion,
  syncDeleteWrongQuestion,
  syncCreateFocusRecord,
  syncDeleteFocusRecord
}
