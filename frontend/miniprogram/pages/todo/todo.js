const app = getApp()
const syncManager = require('../../utils/syncManager.js')

// iOS 兼容的日期解析函数
function parseDate(dateStr) {
  if (!dateStr) return null
  const normalized = dateStr.replace(/-/g, '/')
  return new Date(normalized)
}

/**
 * 判断两条任务是否为同一条。
 * 注意：绝不能直接写 a.id === b.id || a.tempId === b.tempId，
 * 因为服务端返回的任务没有 tempId，undefined === undefined 会恒为 true，
 * 导致「点一个完成 → 全部完成」「删一个 → 全部删除」。
 * 这里要求两边的比较字段都存在才算匹配。
 */
function isSameTask(a, b) {
  if (!a || !b) return false
  if (a.id != null && b.id != null && String(a.id) === String(b.id)) return true
  if (a.tempId != null && b.tempId != null && String(a.tempId) === String(b.tempId)) return true
  return false
}

/**
 * 按 id / tempId 去重，避免列表里出现重复 key（Console 的 Do not set same key 警告）
 */
function dedupeTasks(list) {
  const seen = {}
  const result = []
  ;(list || []).forEach(function (t) {
    if (!t || (t.id == null && t.tempId == null)) return
    const key = t.id != null ? 'id_' + t.id : 'tmp_' + t.tempId
    if (seen[key]) return
    seen[key] = true
    result.push(t)
  })
  return result
}

Page({
  data: {
    filter: 'all',
    sortByTime: false,
    sortOrder: 'desc',
    tasks: [],
    filteredTasks: [],
    categories: ['作业', '考试', '复习', '阅读', '笔记', '其他'],
    pendingCount: 0,
    completedCount: 0,
    completionRate: 0
  },

  onLoad: function () {
    this.loadTasks()
  },

  onShow: function () {
    this.loadTasks()
  },

  loadTasks: function () {
    console.log('开始加载任务...')

    // 离线优先：先读本地缓存
    const storedTasks = wx.getStorageSync('tasks') || []
    if (storedTasks.length > 0) {
      const validTasks = dedupeTasks(storedTasks).map(t => ({
        ...t,
        remind: t.remindEnabled || t.remind || false,
        completed: t.completed || false
      }))
      this.setData({ tasks: validTasks })
      this.applyFilterAndSort()
    }

    // 尝试从服务端拉最新（有网时刷新）
    // 注意：这里仍然是读操作（GET），不进入写队列
    const userId = (app.globalData && app.globalData.getUserId && app.globalData.getUserId()) || null
    if (userId) {
      // 如果有 userId 才去服务端拉，否则仅用本地
      // 这个调用保持使用直接的 request.get 而不进队列，因为读操作不需要补偿
      const { get } = require('../../utils/request.js')
      const fetchStartedAt = Date.now()
      get('/tasks/user/' + userId).then(res => {
        let serverTasks = []
        if (Array.isArray(res)) serverTasks = res
        else if (res && Array.isArray(res.data)) serverTasks = res.data
        else if (res && res.tasks) serverTasks = res.tasks

        serverTasks = dedupeTasks(serverTasks.filter(t => t && t.id != null)).map(t => ({
          ...t,
          remind: t.remindEnabled || t.remind || false,
          completed: t.completed || false
        }))

        // 关键：之前直接 setData({ tasks: serverTasks }) 会覆盖本地乐观项（id:null 的）。
        // 服务端响应不含这些本地新建还没同步上的任务，于是用户看到「新建的任务消失」。
        // 改为 merge：服务端权威数据 + 本地乐观项（id 为 null 的临时项保留显示）。
        const localPending = (storedTasks || []).filter(t => t && t.id == null && t.tempId)
        const merged = dedupeTasks([...serverTasks, ...localPending]).map(t => ({
          ...t,
          remind: t.remindEnabled || t.remind || false,
          completed: t.completed || false
        }))

        this.setData({ tasks: merged })
        this.applyFilterAndSort()
      }).catch(err => {
        const cost = Date.now() - fetchStartedAt
        const msg = (err && err.errMsg) || (err && err.message) || '未知错误'
        // 关键：之前 catch 只 console.log，用户看到的就是「任务页一片空白但没有任何提示」。
        // 这里改 toast + 日志双重兜底，至少让用户知道发生了什么。
        const isTimeout = /timeout/i.test(msg)
        console.warn('[todo.loadTasks] 服务端拉取失败 |', msg, '| 耗时', cost, 'ms',
          isTimeout ? '↑ 多半是 urlCheck 没生效（需重启开发者工具）或后端慢' : '')

        // 网络失败时使用本地
        const validTasks = dedupeTasks(storedTasks).map(t => ({
          ...t,
          remind: t.remindEnabled || t.remind || false,
          completed: t.completed || false
        }))
        this.setData({ tasks: validTasks })
        this.applyFilterAndSort()

        // 只有真正失败时才弹 toast，避免每次进页面都吵用户
        if (isTimeout) {
          wx.showToast({
            title: '服务端无响应，已展示本地缓存',
            icon: 'none',
            duration: 2500
          })
        }
      })
    }
  },

  applyFilterAndSort: function () {
    let filtered = [...this.data.tasks].filter(t => t && (t.id || t.tempId))

    filtered = filtered.map(t => ({
      ...t,
      completed: !!t.completed
    }))

    if (this.data.filter === 'pending') filtered = filtered.filter(t => t.completed === false)
    else if (this.data.filter === 'completed') filtered = filtered.filter(t => t.completed === true)

    if (this.data.sortByTime) {
      filtered.sort((a, b) => {
        const comparison = (parseDate(a.deadline) || new Date(9999, 11, 31)) - (parseDate(b.deadline) || new Date(9999, 11, 31))
        return this.data.sortOrder === 'asc' ? comparison : -comparison
      })
    } else {
      filtered.sort((a, b) => {
        const comparison = parseDate(b.createTime) - parseDate(a.createTime)
        return this.data.sortOrder === 'asc' ? -comparison : comparison
      })
    }

    this.setData({ filteredTasks: filtered })
    this.updateStats()
  },

  updateStats: function () {
    const tasks = this.data.tasks.filter(t => t && (t.id || t.tempId))
    const completedCount = tasks.filter(t => t.completed).length
    const pendingCount = tasks.filter(t => !t.completed).length
    const completionRate = tasks.length > 0 ? Math.round(completedCount / tasks.length * 100) : 0
    this.setData({ completedCount, pendingCount, completionRate })
  },

  setFilter: function (e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ filter }, () => this.applyFilterAndSort())
  },

  toggleSort: function () {
    this.setData({ sortByTime: !this.data.sortByTime, sortOrder: 'desc' }, () => this.applyFilterAndSort())
  },

  toggleComplete: function (e) {
    const task = e.currentTarget.dataset.task
    if (!task || (!task.id && !task.tempId)) return

    const newCompleted = !task.completed
    const updatedTask = {
      ...task,
      completed: newCompleted,
      updatedAt: new Date().toISOString()
    }

    // 写操作 → syncManager 入队
    const targetId = task.id || task.tempId
    syncManager.syncUpdateTodo(targetId, {
      title: task.title,
      category: task.category,
      deadline: task.deadline,
      description: task.description,
      remindEnabled: task.remind || task.remindEnabled || false,
      completed: newCompleted,
      priority: task.priority,
      updatedAt: updatedTask.updatedAt
    })

    // 乐观 UI 更新：只更新被点击的那一条
    const tasks = this.data.tasks
      .map(t => (isSameTask(t, task) ? updatedTask : t))
      .filter(t => t && (t.id != null || t.tempId != null))
    wx.setStorageSync('tasks', tasks)

    if (!task.completed && this.data.filter === 'pending') {
      this.setData({ tasks, filter: 'all' }, () => {
        this.applyFilterAndSort()
        wx.showToast({ title: '任务已完成', icon: 'success' })
      })
    } else {
      this.setData({ tasks }, () => {
        this.applyFilterAndSort()
        if (!task.completed) wx.showToast({ title: '任务已完成', icon: 'success' })
      })
    }
  },

  addTask: function () {
    wx.navigateTo({ url: '/pages/todo-add/todo-add' })
  },

  editTask: function (e) {
    const task = e.currentTarget.dataset.task
    wx.navigateTo({ url: '/pages/todo-add/todo-add?id=' + (task.id || task.tempId) })
  },

  deleteTask: function (e) {
    const task = e.currentTarget.dataset.task
    if (!task || (!task.id && !task.tempId)) return

    const targetId = task.id || task.tempId

    wx.showModal({
      title: '确认删除',
      content: '确定要删除任务「' + task.title + '」吗？',
      success: (res) => {
        if (res.confirm) {
          // 写操作 → syncManager 入队
          if (task.id != null) {
            syncManager.syncDeleteTodo(task.id)
          } else if (task.tempId) {
            // 还没同步到服务端的新任务：直接撤销队列里那条 CREATE，
            // 否则它仍会被创建出来，删除也就白删了
            syncManager.cancelPendingCreate('TODO', task.tempId)
          }
          // 立即移除本地：只移除被点击的那一条
          const tasks = this.data.tasks
            .filter(t => !isSameTask(t, task))
            .filter(t => t && (t.id != null || t.tempId != null))
          wx.setStorageSync('tasks', tasks)
          this.setData({ tasks }, () => {
            this.applyFilterAndSort()
            wx.showToast({ title: '已加入同步队列', icon: 'success' })
          })
        }
      }
    })
  },

  getDeadlineText: function (deadline) {
    if (!deadline) return ''
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '/')
    const deadlineDate = parseDate(deadline)
    const todayDate = new Date(today)
    const diffDays = Math.ceil((deadlineDate - todayDate) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '明天'
    if (diffDays < 0) return '已过期'
    if (diffDays <= 7) return diffDays + '天后'
    return deadline
  },

  getDeadlineColor: function (deadline) {
    if (!deadline) return '#999'
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '/')
    const deadlineDate = parseDate(deadline)
    const todayDate = new Date(today)
    const diffDays = Math.ceil((deadlineDate - todayDate) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return '#ff4d4f'
    if (diffDays <= 1) return '#faad14'
    return '#999'
  },

  getCategoryColor: function (category) {
    const colors = {
      '作业': '#42b9ff', '考试': '#ff4d4f', '复习': '#52c41a',
      '阅读': '#722ed1', '笔记': '#faad14', '其他': '#999'
    }
    return colors[category] || '#999'
  }
})