const { get } = require('../../utils/request.js')

function safeToISODate(date) {
  if (!date || isNaN(date.getTime())) {
    return null
  }
  return date.toISOString().split('T')[0]
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

Page({
  data: {
    timeRange: 'week',
    totalFocusHours: 0,
    taskCompletionRate: 0,
    notesCount: 0,
    wrongCount: 0,
    todayFocus: 0,
    weekTasks: 0,
    completedTasks: 0,
    newNotes: 0,
    newWrong: 0,
    dailyFocus: [],
    taskTrend: [],
    linePath: '',
    tasks: []
  },

  onLoad: function () {
    this.loadStats()
  },

  onShow: function () {
    this.loadStats()
  },

  loadStats: function () {
    this.loadFocusStats()
    this.loadTaskStats().then(() => {
      this.loadTaskTrend()
    })
    this.loadNoteStats()
    this.loadWrongStats()
    this.loadDailyFocus()
  },

  loadFocusStats: function () {
    const records = wx.getStorageSync('focusRecords') || []
    const today = new Date().toISOString().split('T')[0]
    
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    const weekStartStr = weekStart.toISOString().split('T')[0]
    
    const weekRecords = records.filter(r => r.date >= weekStartStr)
    const todayRecords = records.filter(r => r.date === today)
    
    const weekMinutes = weekRecords.reduce((sum, r) => sum + r.minutes, 0)
    const todayMinutes = todayRecords.reduce((sum, r) => sum + r.minutes, 0)
    
    this.setData({
      totalFocusHours: (weekMinutes / 60).toFixed(1),
      todayFocus: todayMinutes
    })
  },

  loadTaskStats: function () {
    const app = getApp()
    const userId = app.globalData.getUserId()
    if (!userId) { console.warn('未登录，无法加载任务统计'); return Promise.resolve() }

    return get('/tasks/user/' + userId, {}, 20000).then(res => {
      console.log('统计页面加载任务, res:', res)
      
      // 处理不同的返回格式
      let tasks = []
      if (Array.isArray(res)) {
        tasks = res
      } else if (res && Array.isArray(res.data)) {
        tasks = res.data
      } else if (res && res.tasks) {
        tasks = res.tasks
      }
      
      console.log('统计页面任务数量:', tasks.length)
      
      tasks = tasks.filter(t => t && t.id).map(t => ({
        ...t,
        remind: t.remindEnabled || t.remind || false,
        completed: t.completed || false
      }))
      
      const completed = tasks.filter(t => t.completed).length
      const total = tasks.length
      
      wx.setStorageSync('tasks', tasks)
      
      this.setData({
        tasks,
        weekTasks: total,
        completedTasks: completed,
        taskCompletionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      })
    }).catch(err => {
      console.error('加载任务统计失败:', err)
      const todos = wx.getStorageSync('tasks') || []
      const validTodos = todos.filter(t => t && t.id).map(t => ({
        ...t,
        remind: t.remindEnabled || t.remind || false,
        completed: t.completed || false
      }))
      const completed = validTodos.filter(t => t.completed).length
      const total = validTodos.length
      
      this.setData({
        tasks: validTodos,
        weekTasks: total,
        completedTasks: completed,
        taskCompletionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      })
    })
  },

  loadNoteStats: function () {
    const notes = wx.getStorageSync('notes') || []
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    const weekStartStr = weekStart.toISOString().split('T')[0]
    
    const weekNotes = notes.filter(n => {
      return n.createdAt && n.createdAt >= weekStartStr
    })
    
    this.setData({ 
      notesCount: notes.length,
      newNotes: weekNotes.length
    })
  },

  loadWrongStats: function () {
    const wrongQuestions = wx.getStorageSync('wrongQuestions') || []
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    const weekStartStr = weekStart.toISOString().split('T')[0]
    
    const weekWrong = wrongQuestions.filter(w => {
      return w.createdAt && w.createdAt >= weekStartStr
    })
    
    this.setData({ 
      wrongCount: wrongQuestions.length,
      newWrong: weekWrong.length
    })
  },

  loadDailyFocus: function () {
    const records = wx.getStorageSync('focusRecords') || []
    const today = new Date()
    
    let dailyData = []
    
    if (this.data.timeRange === 'month') {
      const year = today.getFullYear()
      const month = today.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      
      const weeks = []
      let currentWeek = []
      
      for (let i = 0; i < daysInMonth; i++) {
        const date = new Date(year, month, i + 1)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayRecords = records.filter(r => r.date === dateStr)
        const minutes = dayRecords.reduce((sum, r) => sum + r.minutes, 0)
        
        currentWeek.push({
          day: `${i + 1}`,
          weekday: weekDays[date.getDay()],
          date: dateStr,
          minutes,
          percentage: 0
        })
        
        if (date.getDay() === 6 || i === daysInMonth - 1) {
          weeks.push(currentWeek)
          currentWeek = []
        }
      }
      
      const maxMinutes = Math.max(...weeks.flat().map(d => d.minutes), 1)
      weeks.forEach(week => {
        week.forEach(d => {
          d.percentage = (d.minutes / maxMinutes) * 100
        })
      })
      
      this.setData({ dailyFocus: weeks, isWeeklyView: true })
    } else {
      const days = ['一', '二', '三', '四', '五', '六', '日']
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayRecords = records.filter(r => r.date === dateStr)
        const minutes = dayRecords.reduce((sum, r) => sum + r.minutes, 0)
        
        dailyData.push({
          day: days[date.getDay()],
          date: dateStr,
          minutes,
          percentage: 0
        })
      }
      
      const maxMinutes = Math.max(...dailyData.map(d => d.minutes), 1)
      dailyData.forEach(d => {
        d.percentage = (d.minutes / maxMinutes) * 100
      })
      
      this.setData({ dailyFocus: dailyData, isWeeklyView: false })
    }
  },

  loadTaskTrend: function () {
    const validTodos = this.data.tasks.filter(t => t && t.id)
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const today = new Date()

    // 统一把任何日期字符串归一为 YYYY-MM-DD：
    //   "2026-06-13T13:16:57" → "2026-06-13"
    //   "2026/06/13 12:00:00" → "2026-06-13"
    const toYMD = (s) => {
      if (!s || typeof s !== 'string') return ''
      const t = s.trim()
      if (!t) return ''
      if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.substring(0, 10)
      return t.substring(0, 10).replace(/\//g, '-')
    }

    // 任务"属于"某一天的判定（涵盖多种来源，避免 0%）：
    //   1) deadline 是那天
    //   2) 已完成且 updatedAt 是那天（反映真实的勾选完成活动）
    //   3) createdAt / time 是那天（兜底）
    const belongsToDay = (t, dateStr) => {
      if (toYMD(t.deadline) === dateStr) return true
      if (t.completed && toYMD(t.updatedAt) === dateStr) return true
      if (toYMD(t.createdAt) === dateStr) return true
      if (toYMD(t.time) === dateStr) return true
      return false
    }

    const completionRates = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = formatDate(date)

      const dayTodos = validTodos.filter(t => t && belongsToDay(t, dateStr))
      const completed = dayTodos.filter(t => t && t.completed).length
      const total = dayTodos.length
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0

      const dayIndex = date.getDay()
      completionRates.push({
        day: days[dayIndex],
        value: rate,
        x: ((6 - i) / 6) * 100,
        y: rate,
        isToday: i === 0
      })
    }

    let path = ''
    if (completionRates.length > 1) {
      const points = completionRates.map((point, index) => {
        const x = point.x
        const y = 100 - point.y
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      path = points.join(' ')
    }

    console.log('Task trend data:', completionRates)
    console.log('Line path:', path)

    this.setData({ taskTrend: completionRates, linePath: path })
  },

  setTimeRange: function (e) {
    const range = e.currentTarget.dataset.range
    this.setData({ timeRange: range })
    this.loadDailyFocus()
    
    if (range === 'month') {
      const records = wx.getStorageSync('focusRecords') || []
      const monthStart = new Date()
      monthStart.setDate(1)
      const monthStartStr = monthStart.toISOString().split('T')[0]
      
      const monthRecords = records.filter(r => r.date >= monthStartStr)
      const monthMinutes = monthRecords.reduce((sum, r) => sum + r.minutes, 0)
      
      this.setData({ totalFocusHours: (monthMinutes / 60).toFixed(1) })
    } else {
      this.loadFocusStats()
    }
  }
})
