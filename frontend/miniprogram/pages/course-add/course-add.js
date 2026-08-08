Page({
  data: {
    course: {
      name: '',
      teacher: '',
      room: '',
      day: 1,
      slot: 0,
      remind: false,
      color: '#42b9ff'
    },
    weekDays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    timeSlots: ['第1节 08:00', '第2节 09:40', '第3节 11:20', '第4节 14:00', '第5节 15:40', '第6节 17:20', '第7节 19:00', '第8节 20:40'],
    colors: ['#42b9ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16']
  },

  onInput: function (e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`course.${field}`]: e.detail.value
    })
  },

  onDayChange: function (e) {
    this.setData({
      'course.day': parseInt(e.detail.value)
    })
  },

  onSlotChange: function (e) {
    this.setData({
      'course.slot': parseInt(e.detail.value)
    })
  },

  onRemindChange: function (e) {
    this.setData({
      'course.remind': e.detail.value
    })
  },

  onColorChange: function (e) {
    this.setData({
      'course.color': e.currentTarget.dataset.color
    })
  },

  saveCourse: function () {
    const { post } = require('../../utils/request.js')
    const app = getApp()
    const userId = app.globalData.getUserId()
    
    if (!this.data.course.name) {
      wx.showToast({ title: '请输入课程名称', icon: 'none' })
      return
    }

    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    const newCourse = {
      userId: userId,
      name: this.data.course.name,
      teacher: this.data.course.teacher,
      room: this.data.course.room,
      dayOfWeek: this.data.course.day + 1,
      timeSlot: this.data.course.slot + 1,
      color: this.data.course.color,
      remindEnabled: this.data.course.remind,
      remindMinutes: 10,
      startWeek: 1,
      endWeek: 18
    }
    
    wx.showLoading({ title: '保存中...' })
    
    post('/courses', newCourse).then(res => {
      wx.hideLoading()
      if (res && res.id) {
        wx.showToast({ title: '保存成功', icon: 'success' })
        
        const courses = wx.getStorageSync('courses') || []
        courses.push({
          id: res.id,
          name: res.name,
          teacher: res.teacher,
          room: res.room,
          day: Math.max(0, res.dayOfWeek - 1),
          slot: Math.max(0, res.timeSlot - 1),
          color: res.color,
          remind: res.remindEnabled,
          startWeek: res.startWeek,
          endWeek: res.endWeek
        })
        wx.setStorageSync('courses', courses)
        
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
      console.error('保存失败:', err)
    })
  }
})
