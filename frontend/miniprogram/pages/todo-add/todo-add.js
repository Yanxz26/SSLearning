const syncManager = require('../../utils/syncManager.js')

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

Page({
  data: {
    task: {
      title: '',
      category: '作业',
      deadline: '',
      description: '',
      remind: false
    },
    categories: ['作业', '考试', '复习', '预习', '阅读', '笔记', '项目', '会议', '购物', '运动', '健康', '其他'],
    editingId: null
  },

  onLoad: function (options) {
    if (options && options.id) {
      this.setData({ editingId: options.id })
      this.loadTask(options.id)
    }
  },

  loadTask: function (id) {
    // 直接从本地缓存加载（离线优先）
    const tasks = wx.getStorageSync('tasks') || []
    const task = tasks.find(t => t.id == id || t.tempId == id)
    if (task) {
      this.setData({
        task: {
          title: task.title || '',
          category: task.category || '作业',
          deadline: task.deadline || '',
          description: task.description || '',
          remind: task.remindEnabled || task.remind || false,
          completed: task.completed || false,
          priority: task.priority || 1
        }
      })
    }
  },

  onInput: function (e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`task.${field}`]: e.detail.value
    })
  },

  onCategoryChange: function (e) {
    this.setData({
      'task.category': e.currentTarget.dataset.category
    })
  },

  onDateChange: function (e) {
    this.setData({
      'task.deadline': e.detail.value
    })
  },

  onRemindChange: function (e) {
    this.setData({
      'task.remind': e.detail.value
    })
  },

  saveTask: function () {
    if (!this.data.task.title) {
      wx.showToast({ title: '请输入任务标题', icon: 'none' })
      return
    }

    // 注意：data 中不带 userId / id。userId 由 syncManager 在 flush 时从 user_info 取
    // 服务端实体 ID 在 flush 成功后通过 SyncResult.serverId / tempId 映射回写到本地。
    const taskData = {
      title: this.data.task.title,
      category: this.data.task.category || '作业',
      deadline: this.data.task.deadline || '',
      description: this.data.task.description || '',
      remindEnabled: this.data.task.remind || false,
      completed: this.data.task.completed || false,
      priority: this.data.task.priority || 1,
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    }

    const tasks = wx.getStorageSync('tasks') || []
    let clientOpId

    if (this.data.editingId) {
      // 更新：进入同步队列
      clientOpId = syncManager.syncUpdateTodo(this.data.editingId, taskData)
      const updatedTasks = tasks.map(t => (t.id == this.data.editingId) ? {
        ...t,
        ...taskData,
        remind: taskData.remindEnabled
      } : t)
      wx.setStorageSync('tasks', updatedTasks)
      wx.showToast({ title: '已加入同步队列', icon: 'success' })
    } else {
      // 创建：进入同步队列，服务端 ID 回填通过 syncManager 的 'idMapped' 事件实现
      const tempId = 'temp_' + Date.now()
      // 关键：必须把 tempId 传给 syncManager，否则它内部 tempId 为 null，
      // 导致「本地乐观项的 tempId」与「同步队列里的 tempId」不一致，
      // 同步成功后 reconcileLocalCache 找不到这条乐观项回填 serverId。
      clientOpId = syncManager.syncCreateTodo(taskData, tempId)
      // 乐观更新：立刻在本地显示这条待办
      tasks.unshift({
        ...taskData,
        id: null,           // 服务端 ID 待回填
        tempId: tempId,     // 用于服务端 ID 回填时定位这条记录
        remind: taskData.remindEnabled,
        clientOpId: clientOpId
      })
      wx.setStorageSync('tasks', tasks)
      wx.showToast({ title: '已加入同步队列', icon: 'success' })
    }

    setTimeout(() => {
      wx.navigateBack()
    }, 800)
  }
})
