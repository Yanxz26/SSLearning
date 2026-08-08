const app = getApp()
const { get, post } = require('../../utils/request.js')

Page({
  data: {
    timeLeft: 25 * 60,
    elapsedTime: 0,
    elapsedTimeText: '00:00',
    isRunning: false,
    isWorking: true,
    focusMinutes: 25,
    breakMinutes: 5,
    progress: 0,
    todayFocus: 45,
    totalFocus: 128,
    focusSessions: 0,
    currentSession: 0,
    maxSessions: 4
  },

  timer: null,
  startTime: null,
  totalFocusedMinutes: 0,

  onLoad: function () {
    this.updateProgress()
    this.loadFocusRecords()
  },

  onUnload: function () {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },

  onShow: function () {
    this.loadFocusRecords()
  },

  loadFocusRecords: function () {
    if (this.data.isRunning && this.data.isWorking) {
      return
    }
    
    const today = new Date().toISOString().split('T')[0]
    const userId = app.globalData.getUserId()
    if (!userId) { console.warn('未登录，跳过加载专注记录'); return }
    
    get('/focus-records/user/' + userId).then(res => {
      const records = Array.isArray(res) ? res : (res.data || [])
      
      if (records.length === 0) {
        const allRecords = wx.getStorageSync('focusRecords') || []
        const todayRecords = allRecords.filter(r => r.date === today)
        const todayFocusMinutes = todayRecords.reduce((sum, record) => sum + record.minutes, 0)
        const totalMinutes = allRecords.reduce((sum, record) => sum + record.minutes, 0)
        
        this.setData({ 
          todayFocus: todayFocusMinutes,
          totalFocus: (totalMinutes / 60).toFixed(1),
          focusSessions: todayRecords.length
        })
        return
      }
      
      const todayRecords = records.filter(r => r.date === today)
      const todayFocusMinutes = todayRecords.reduce((sum, record) => sum + (record.focusDuration || 0), 0)
      const totalMinutes = records.reduce((sum, record) => sum + (record.focusDuration || 0), 0)
      
      this.setData({ 
        todayFocus: todayFocusMinutes,
        totalFocus: (totalMinutes / 60).toFixed(1),
        focusSessions: todayRecords.length
      })
    }).catch(err => {
      console.error('加载专注记录失败:', err)
      
      const allRecords = wx.getStorageSync('focusRecords') || []
      const todayRecords = allRecords.filter(r => r.date === today)
      const todayFocusMinutes = todayRecords.reduce((sum, record) => sum + record.minutes, 0)
      const totalMinutes = allRecords.reduce((sum, record) => sum + record.minutes, 0)
      
      this.setData({ 
        todayFocus: todayFocusMinutes,
        totalFocus: (totalMinutes / 60).toFixed(1),
        focusSessions: todayRecords.length
      })
    })
  },

  formatTime: function (seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  },

  updateProgress: function () {
    const total = this.data.isWorking ? this.data.focusMinutes * 60 : this.data.breakMinutes * 60
    const progress = ((total - this.data.timeLeft) / total) * 360
    this.setData({ progress })
  },

  toggleTimer: function () {
    if (this.data.isRunning) {
      this.pauseTimer()
    } else {
      this.startTimer()
    }
  },

  startTimer: function () {
    if (!this.startTime) {
      this.startTime = Date.now()
    }
    this.setData({ isRunning: true })
    this.timer = setInterval(() => {
      let timeLeft = this.data.timeLeft - 1
      let elapsedTime = this.data.elapsedTime + 1
      let elapsedTimeText = this.formatTime(elapsedTime)
      
      if (this.data.isWorking) {
        let totalSeconds = this.data.todayFocus * 60 + 1
        let todayFocus = Math.floor(totalSeconds / 60)
        this.setData({ todayFocus })
      }
      
      this.setData({ timeLeft, elapsedTime, elapsedTimeText })
      this.updateProgress()
      
      if (timeLeft <= 0) {
        this.finishPhase()
        return
      }
    }, 1000)
  },

  pauseTimer: function () {
    this.setData({ isRunning: false })
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },

  resetTimer: function () {
    this.pauseTimer()
    this.startTime = null
    const total = this.data.isWorking ? this.data.focusMinutes * 60 : this.data.breakMinutes * 60
    this.setData({ timeLeft: total, elapsedTime: 0, elapsedTimeText: '00:00', progress: 0 })
  },

  skipPhase: function () {
    this.finishPhase()
  },

  prevPhase: function () {
    this.pauseTimer()
    
    if (!this.data.isWorking) {
      this.setData({ 
        isWorking: true,
        timeLeft: this.data.focusMinutes * 60,
        elapsedTime: 0,
        elapsedTimeText: '00:00',
        progress: 0
      })
      wx.showToast({ title: '回到专注阶段', icon: 'none', duration: 2000 })
    } else if (this.data.currentSession > 0) {
      const newSession = this.data.currentSession - 1
      this.setData({ 
        todayFocus: Math.max(0, this.data.todayFocus - this.data.focusMinutes),
        currentSession: newSession,
        timeLeft: this.data.focusMinutes * 60,
        elapsedTime: 0,
        elapsedTimeText: '00:00',
        progress: 0
      })
      wx.showToast({ title: `回到第${newSession + 1}个番茄钟`, icon: 'none', duration: 2000 })
    }
    this.startTime = null
  },

  finishPhase: function () {
    this.pauseTimer()
    
    if (this.data.isWorking) {
      const focusedMinutes = Math.floor(this.data.elapsedTime / 60)
      this.totalFocusedMinutes += focusedMinutes
      const newSession = this.data.currentSession + 1
      
      const today = new Date().toISOString().split('T')[0]
      const recordData = {
        userId: app.globalData.getUserId(),
        focusDuration: focusedMinutes,
        breakDuration: this.data.breakMinutes,
        date: today,
        startTime: this.startTime ? new Date(this.startTime).toISOString() : new Date().toISOString(),
        endTime: new Date().toISOString()
      }
      
      post('/focus-records', recordData).then(res => {
        console.log('专注记录保存成功:', res)
      }).catch(err => {
        console.error('保存失败:', err)
      })
      
      const existingRecords = wx.getStorageSync('focusRecords') || []
      existingRecords.push({
        date: today,
        minutes: focusedMinutes,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      })
      wx.setStorageSync('focusRecords', existingRecords)
      
      this.setData({ 
        isWorking: false,
        timeLeft: this.data.breakMinutes * 60,
        elapsedTime: 0,
        progress: 0,
        currentSession: newSession
      })
      
      if (newSession >= this.data.maxSessions) {
        wx.showModal({
          title: '🎉 太棒了！',
          content: `你已完成${this.data.maxSessions}个番茄钟，共专注${this.totalFocusedMinutes}分钟，休息一下吧！`,
          showCancel: false
        })
      } else {
        wx.showToast({ title: '专注结束，休息一下吧！', icon: 'none', duration: 2000 })
      }
    } else {
      this.setData({ 
        isWorking: true,
        timeLeft: this.data.focusMinutes * 60,
        elapsedTime: 0,
        progress: 0
      })
      wx.showToast({ title: '休息结束，继续专注！', icon: 'none', duration: 2000 })
    }
    this.startTime = null
  },

  adjustFocusTime: function (e) {
    const delta = parseInt(e.currentTarget.dataset.delta)
    let newTime = this.data.focusMinutes + delta
    if (newTime >= 1 && newTime <= 120) {
      if (!this.data.isRunning) {
        this.setData({ focusMinutes: newTime, timeLeft: newTime * 60 })
      } else {
        this.setData({ focusMinutes: newTime })
      }
    }
  },

  adjustBreakTime: function (e) {
    const delta = parseInt(e.currentTarget.dataset.delta)
    let newTime = this.data.breakMinutes + delta
    if (newTime >= 1 && newTime <= 15) {
      if (!this.data.isRunning && !this.data.isWorking) {
        this.setData({ breakMinutes: newTime, timeLeft: newTime * 60 })
      } else {
        this.setData({ breakMinutes: newTime })
      }
    }
  },

  viewHistory: function () {
    wx.navigateTo({
      url: '/pages/focus-history/focus-history'
    })
  }
})
