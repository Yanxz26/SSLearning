Page({
  data: {
    totalMinutes: 0,
    totalHours: 0,
    totalSessions: 0,
    weekData: [],
    historyData: []
  },

  onLoad: function () {
    this.loadFocusHistory()
  },

  loadFocusHistory: function () {
    const { get } = require('../../utils/request.js')
    const app = getApp()
    const userId = app.globalData.getUserId()
    if (!userId) { console.warn('未登录，无法加载专注历史'); return }

    get('/focus-records/user/' + userId).then(res => {
      const records = Array.isArray(res) ? res : (res.data || [])
      
      if (records.length === 0) {
        const history = this.getLocalRecords()
        this.updateUI(history)
        return
      }
      
      const history = this.processRecords(records)
      this.updateUI(history)
    }).catch(err => {
      console.error('加载专注记录失败:', err)
      const history = this.getLocalRecords()
      this.updateUI(history)
    })
  },

  processRecords: function (records) {
    const groupedRecords = {}
    records.forEach(record => {
      if (!groupedRecords[record.date]) {
        groupedRecords[record.date] = {
          date: record.date,
          sessions: 0,
          minutes: 0,
          weekday: ''
        }
      }
      groupedRecords[record.date].sessions++
      groupedRecords[record.date].minutes += record.focusDuration || 0
    })
    
    const days = ['日', '一', '二', '三', '四', '五', '六']
    return Object.values(groupedRecords).map(item => {
      const date = new Date(item.date)
      return {
        ...item,
        weekday: days[date.getDay()]
      }
    }).sort((a, b) => b.date.localeCompare(a.date))
  },

  getLocalRecords: function () {
    const records = wx.getStorageSync('focusRecords') || []
    
    const groupedRecords = {}
    records.forEach(record => {
      if (!groupedRecords[record.date]) {
        groupedRecords[record.date] = {
          date: record.date,
          sessions: 0,
          minutes: 0,
          weekday: ''
        }
      }
      groupedRecords[record.date].sessions++
      groupedRecords[record.date].minutes += record.minutes
    })
    
    const days = ['日', '一', '二', '三', '四', '五', '六']
    return Object.values(groupedRecords).map(item => {
      const date = new Date(item.date)
      return {
        ...item,
        weekday: days[date.getDay()]
      }
    }).sort((a, b) => b.date.localeCompare(a.date))
  },

  updateUI: function (history) {
    const totalMinutes = history.reduce((sum, item) => sum + item.minutes, 0)
    const totalSessions = history.reduce((sum, item) => sum + item.sessions, 0)
    
    const weekData = this.generateWeekData(history)
    const historyData = this.formatHistoryData(history)

    this.setData({
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      totalSessions,
      weekData,
      historyData
    })
  },

  generateWeekData: function (history) {
    const today = new Date()
    const days = ['日', '一', '二', '三', '四', '五', '六']
    const weekData = []
    const maxMinutes = 150
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const record = history.find(h => h.date === dateStr)
      const minutes = record ? record.minutes : 0
      
      weekData.push({
        date: dateStr,
        dayName: days[date.getDay()],
        minutes,
        percentage: Math.max(5, (minutes / maxMinutes) * 100)
      })
    }
    
    return weekData
  },

  formatHistoryData: function (history) {
    const recentHistory = history.slice(0, 14)
    
    return recentHistory.map(item => {
      const dateParts = item.date.split('-')
      return {
        date: item.date,
        dateStr: `${dateParts[1]}月${dateParts[2]}日`,
        weekday: item.weekday,
        sessions: item.sessions,
        minutes: item.minutes,
        progress: Math.min(100, (item.minutes / 120) * 100)
      }
    })
  }
})