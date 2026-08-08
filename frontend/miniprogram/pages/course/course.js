Page({
  data: {
    courses: [],
    filteredCourses: [],
    searchKeyword: '',
    currentFilter: 'all',
    showModal: false,
    isEditing: false,
    editingId: null,
    formData: {
      name: '',
      subject: '',
      teacher: '',
      classroom: '',
      day_of_week: 1,
      start_period: 1,
      end_period: 2,
      week_range: '1-16',
      reminder: 0,
      reminder_minutes: 15,
      periodText: ''
    },
    subjects: ['数学', '英语', '计算机', '体育', '物理', '化学', '生物', '其他'],
    weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    periods: ['1-2节', '3-4节', '5-6节', '7-8节', '1节', '2节', '3节', '4节', '5节', '6节', '7节', '8节'],
    reminderTimes: ['5分钟', '10分钟', '15分钟', '20分钟', '30分钟']
  },

  getUserId: function () {
    const app = getApp()
    return app.globalData.getUserId()
  },

  onLoad: function () {
    this.loadCourses()
  },

  onShow: function () {
    this.loadCourses()
  },

  loadCourses: function () {
    const { get } = require('../../utils/request.js')
    const that = this
    const userId = this.getUserId()
    
    if (!userId) {
      console.warn('用户未登录，无法加载课程')
      return
    }
    
    wx.showLoading({ title: '加载中...' })
    
    get('/courses/user/' + userId).then(res => {
      wx.hideLoading()
      const records = Array.isArray(res) ? res : (res.data || [])
      
      if (records.length > 0) {
        const courses = records.map(c => ({
          id: c.id,
          name: c.name,
          subject: '',
          teacher: c.teacher,
          classroom: c.room || '未指定',
          day_of_week: c.dayOfWeek !== undefined ? c.dayOfWeek + 1 : 1,
          start_period: c.timeSlot !== undefined ? c.timeSlot + 1 : 1,
          end_period: c.timeSlot !== undefined ? c.timeSlot + 1 : 2,
          week_range: `${c.startWeek || 1}-${c.endWeek || 18}`,
          reminder: c.remindEnabled ? 1 : 0,
          reminder_minutes: c.remindMinutes || 15,
          color: c.color || '#42b9ff'
        }))
        that.setData({
          courses,
          filteredCourses: courses
        })
      } else {
        that.setData({
          courses: [],
          filteredCourses: []
        })
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('加载课程失败:', err)
      
      const storedCourses = wx.getStorageSync('courses') || []
      const courses = storedCourses.map(c => ({
        id: c.id,
        name: c.name,
        subject: '',
        teacher: c.teacher,
        classroom: c.room || '未指定',
        day_of_week: c.day !== undefined ? c.day + 1 : 1,
        start_period: c.slot !== undefined ? c.slot + 1 : 1,
        end_period: c.slot !== undefined ? c.slot + 1 : 2,
        week_range: `${c.startWeek || 1}-${c.endWeek || 18}`,
        reminder: c.remind ? 1 : 0,
        reminder_minutes: 15,
        color: c.color || '#42b9ff'
      }))
      that.setData({
        courses,
        filteredCourses: courses
      })
    })
  },

  onSearch: function (e) {
    const keyword = e.detail.value
    this.setData({
      searchKeyword: keyword
    })
    this.filterCourses()
  },

  setFilter: function (filter) {
    this.setData({
      currentFilter: filter
    })
    this.filterCourses()
  },

  filterCourses: function () {
    let result = [...this.data.courses]
    
    if (this.data.searchKeyword) {
      result = result.filter(c => 
        c.name.includes(this.data.searchKeyword)
      )
    }
    
    if (this.data.currentFilter === 'weekday') {
      result = result.filter(c => c.day_of_week <= 5)
    } else if (this.data.currentFilter === 'weekend') {
      result = result.filter(c => c.day_of_week > 5)
    }
    
    this.setData({
      filteredCourses: result
    })
  },

  getWeekDayText: function (day) {
    const days = ['一', '二', '三', '四', '五', '六', '日']
    return days[day - 1]
  },

  getPeriodText: function (period) {
    const times = ['08:00', '08:50', '09:50', '10:40', '11:30', '14:00', '14:50', '15:40']
    return times[period - 1] || ''
  },

  addCourse: function () {
    this.setData({
      showModal: true,
      isEditing: false,
      editingId: null,
      formData: {
        name: '',
        subject: '',
        teacher: '',
        classroom: '',
        day_of_week: 1,
        start_period: 1,
        end_period: 2,
        week_range: '1-16',
        reminder: 0,
        reminder_minutes: 15,
        periodText: ''
      }
    })
  },

  editCourse: function (course) {
    this.setData({
      showModal: true,
      isEditing: true,
      editingId: course.id,
      formData: {
        name: course.name,
        subject: course.subject,
        teacher: course.teacher,
        classroom: course.classroom,
        day_of_week: course.day_of_week,
        start_period: course.start_period,
        end_period: course.end_period,
        week_range: course.week_range,
        reminder: course.reminder,
        reminder_minutes: course.reminder_minutes || 15,
        periodText: `${course.start_period}-${course.end_period}节`
      }
    })
  },

  deleteCourse: function (course) {
    const { del } = require('../../utils/request.js')
    const that = this
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除课程「${course.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          
          del('/courses/' + course.id).then(res => {
            wx.hideLoading()
            
            let courses = that.data.courses.filter(c => c.id !== course.id)
            that.setData({
              courses,
              filteredCourses: courses
            })
            
            let storedCourses = wx.getStorageSync('courses') || []
            storedCourses = storedCourses.filter(c => c.id !== course.id)
            wx.setStorageSync('courses', storedCourses)
            
            wx.showToast({ title: '删除成功', icon: 'success' })
          }).catch(err => {
            wx.hideLoading()
            console.error('删除失败:', err)
            
            let courses = that.data.courses.filter(c => c.id !== course.id)
            that.setData({
              courses,
              filteredCourses: courses
            })
            
            let storedCourses = wx.getStorageSync('courses') || []
            storedCourses = storedCourses.filter(c => c.id !== course.id)
            wx.setStorageSync('courses', storedCourses)
            
            wx.showToast({ title: '删除成功', icon: 'success' })
          })
        }
      }
    })
  },

  onFormInput: function (field) {
    return function (e) {
      const value = e.detail.value
      this.setData({
        [`formData.${field}`]: value
      })
    }
  },

  onSubjectChange: function (e) {
    this.setData({
      'formData.subject': this.data.subjects[e.detail.value]
    })
  },

  onWeekDayChange: function (e) {
    this.setData({
      'formData.day_of_week': parseInt(e.detail.value) + 1
    })
  },

  onPeriodChange: function (e) {
    const periodText = this.data.periods[e.detail.value]
    const match = periodText.match(/(\d+)-(\d+)/)
    if (match) {
      this.setData({
        'formData.start_period': parseInt(match[1]),
        'formData.end_period': parseInt(match[2]),
        'formData.periodText': periodText
      })
    } else {
      const num = parseInt(periodText)
      this.setData({
        'formData.start_period': num,
        'formData.end_period': num,
        'formData.periodText': periodText
      })
    }
  },

  onReminderChange: function (e) {
    this.setData({
      'formData.reminder': e.detail.value ? 1 : 0
    })
  },

  onReminderTimeChange: function (e) {
    const time = this.data.reminderTimes[e.detail.value]
    const num = parseInt(time)
    this.setData({
      'formData.reminder_minutes': num
    })
  },

  closeModal: function () {
    this.setData({
      showModal: false
    })
  },

  stopPropagation: function () {},

  saveCourse: function () {
    const { name, subject, teacher, classroom, day_of_week, start_period, end_period, week_range, reminder, reminder_minutes } = this.data.formData
    
    if (!name.trim()) {
      wx.showToast({ title: '请输入课程名称', icon: 'none' })
      return
    }

    const userId = this.getUserId()
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    const colors = ['#42b9ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16']

    // 解析 week_range "1-16" → startWeek / endWeek
    const weekParts = (week_range || '1-18').split('-')
    const startWeek = parseInt(weekParts[0]) || 1
    const endWeek = parseInt(weekParts[1]) || 18

    const apiCourse = {
      userId: userId,
      name: name,
      teacher: teacher,
      room: classroom,
      dayOfWeek: day_of_week - 1,      // 页面 1-7 → 后端 0-6
      timeSlot: start_period - 1,       // 页面 1-based → 后端 0-based
      color: colors[Math.floor(Math.random() * colors.length)],
      remindEnabled: reminder === 1,
      remindMinutes: reminder_minutes,
      startWeek: startWeek,
      endWeek: endWeek
    }

    const { post, put } = require('../../utils/request.js')
    const that = this
    
    wx.showLoading({ title: '保存中...' })

    const request = this.data.isEditing 
      ? put('/courses/' + this.data.editingId, apiCourse)
      : post('/courses', apiCourse)

    request.then(res => {
      wx.hideLoading()
      const savedCourse = (res && res.id) ? {
        id: res.id,
        name: res.name || name,
        subject: subject,
        teacher: res.teacher || teacher,
        classroom: res.room || classroom,
        day_of_week: (res.dayOfWeek !== undefined ? res.dayOfWeek + 1 : day_of_week),
        start_period: (res.timeSlot !== undefined ? res.timeSlot + 1 : start_period),
        end_period: (res.timeSlot !== undefined ? res.timeSlot + 1 : end_period),
        week_range: `${res.startWeek || startWeek}-${res.endWeek || endWeek}`,
        reminder: (res.remindEnabled ? 1 : reminder),
        reminder_minutes: res.remindMinutes || reminder_minutes,
        color: res.color || apiCourse.color
      } : null

      let courses = [...that.data.courses]
      if (that.data.isEditing && savedCourse) {
        const index = courses.findIndex(c => c.id === that.data.editingId)
        if (index !== -1) courses[index] = savedCourse
      } else if (savedCourse) {
        courses.push(savedCourse)
      }

      that.setData({ courses, filteredCourses: courses, showModal: false })
      wx.showToast({ title: that.data.isEditing ? '修改成功' : '添加成功', icon: 'success' })

      // 同步到 storage，方便离线使用
      wx.setStorageSync('courses', courses.map(c => ({
        id: c.id, name: c.name, teacher: c.teacher, room: c.classroom,
        day: c.day_of_week - 1, slot: c.start_period - 1, color: c.color,
        remind: c.reminder === 1, startWeek: parseInt((c.week_range || '1').split('-')[0]) || 1,
        endWeek: parseInt((c.week_range || '18').split('-')[1]) || 18
      })))
    }).catch(err => {
      wx.hideLoading()
      console.error('保存课程失败:', err)
      // 乐观 UI：即使失败也本地保存
      const localCourse = {
        id: that.data.isEditing ? that.data.editingId : Date.now(),
        name, subject, teacher,
        classroom: classroom,
        day_of_week, start_period, end_period,
        week_range: week_range || '1-18', reminder, reminder_minutes,
        color: apiCourse.color
      }
      let courses = [...that.data.courses]
      if (that.data.isEditing) {
        const index = courses.findIndex(c => c.id === that.data.editingId)
        if (index !== -1) courses[index] = localCourse
      } else {
        courses.push(localCourse)
      }
      that.setData({ courses, filteredCourses: courses, showModal: false })
      wx.showToast({ title: '已本地保存', icon: 'none' })
    })
  },

  importCourse: function () {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  }
})