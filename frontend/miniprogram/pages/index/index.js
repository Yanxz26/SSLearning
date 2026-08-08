const app = getApp()
const { post, get } = require('../../utils/request.js')

Page({
  data: {
    viewMode: 'week',
    weekTitle: '',
    currentWeekOffset: 0,
    weekDays: [],
    timeSlots: [
      { slot: 0, start: '08:00', end: '09:30' },
      { slot: 1, start: '09:40', end: '11:10' },
      { slot: 2, start: '11:20', end: '12:50' },
      { slot: 3, start: '14:00', end: '15:30' },
      { slot: 4, start: '15:40', end: '17:10' },
      { slot: 5, start: '17:20', end: '18:50' },
      { slot: 6, start: '19:00', end: '20:30' },
      { slot: 7, start: '20:40', end: '22:10' }
    ],
    courses: [],
    todayCourses: [],
    termStartDate: '2026-03-02',
    currentWeek: 1,
    termName: '2026年春季学期',
    totalWeeks: 18
  },

  onLoad: function () {
    this.loadTermConfig()
    this.initWeekDays()
    this.loadCourses()
    this.calculateCurrentWeek()
  },

  onShow: function () {
    this.setData({ currentWeekOffset: 0 })
    this.initWeekDays()
    this.calculateCurrentWeek()
    this.loadCoursesFromServer()
  },

  loadTermConfig: function () {
    const userId = app.globalData.getUserId()
    if (!userId) { console.warn('未登录，跳过加载学期配置'); return }

    get('/term-configs/user/' + userId + '/latest').then(res => {
      if (res && res.id) {
        this.setData({
          termStartDate: res.startDate || '2026-02-19',
          termName: res.termName || '2026年春季学期',
          totalWeeks: res.totalWeeks || 18
        })
        
        wx.setStorageSync('termConfig', {
          startDate: res.startDate,
          termName: res.termName,
          totalWeeks: res.totalWeeks
        })
      }
    }).catch(err => {
      console.error('加载学期配置失败:', err)
      const config = wx.getStorageSync('termConfig')
      if (config) {
        this.setData({
          termStartDate: config.startDate || '2026-02-19',
          termName: config.termName || '2026年春季学期',
          totalWeeks: config.totalWeeks || 18
        })
      }
    })
  },

  initWeekDays: function () {
    const days = ['日', '一', '二', '三', '四', '五', '六']
    const today = new Date()
    const adjustedToday = new Date(today)
    adjustedToday.setDate(today.getDate() + this.data.currentWeekOffset * 7)
    
    const dayOfWeek = adjustedToday.getDay()
    const weekDays = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(adjustedToday)
      date.setDate(adjustedToday.getDate() - dayOfWeek + i)
      const month = date.getMonth() + 1
      const day = date.getDate()
      weekDays.push({
        name: days[i],
        date: month + '/' + day,
        fullDate: date.toISOString().split('T')[0],
        dayIndex: i,
        isToday: date.toDateString() === today.toDateString()
      })
    }
    
    const startDate = weekDays[0]
    const endDate = weekDays[6]
    const todayDateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 周${days[today.getDay()]}`
    
    const displayedWeek = this.calculateWeekForDate(adjustedToday)
    
    this.setData({ 
      weekDays, 
      weekTitle: startDate.date + ' - ' + endDate.date, 
      todayDate: todayDateStr,
      currentWeek: displayedWeek
    })
  },

  calculateWeekForDate: function (date) {
    const startDate = new Date(this.data.termStartDate)
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    const startYear = startDate.getFullYear()
    const startMonth = startDate.getMonth()
    const startDay = startDate.getDate()
    
    const currentStartDate = new Date(targetDate.getFullYear(), startMonth, startDay)
    if (targetDate < currentStartDate) {
      currentStartDate.setFullYear(currentStartDate.getFullYear() - 1)
    }
    
    const diffTime = targetDate - currentStartDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const weekNumber = Math.max(1, Math.floor(diffDays / 7) + 1)
    
    return weekNumber
  },

  calculateCurrentWeek: function () {
  },

  loadCourses: function () {
    const storedCourses = wx.getStorageSync('courses') || []
    this.updateScheduleDisplay(storedCourses)
  },

  updateScheduleDisplay: function (courses) {
    const activeCourses = courses.filter(c => c && c.id)
    
    const scheduleMatrix = []
    for (let slot = 0; slot < 8; slot++) {
      const row = []
      for (let day = 0; day < 7; day++) {
        const course = activeCourses.find(c => c.day === day && c.slot === slot)
        row.push(course || null)
      }
      scheduleMatrix.push(row)
    }
    
    const today = new Date().getDay()
    const todayCourses = activeCourses
      .filter(c => c.day === today)
      .map(c => ({ ...c, startTime: this.data.timeSlots[c.slot]?.start || '', endTime: this.data.timeSlots[c.slot]?.end || '' }))
      .sort((a, b) => a.slot - b.slot)
    
    this.setData({
      courses: activeCourses,
      todayCourses,
      scheduleMatrix
    })
  },

  getCourse: function (dayIndex, slotIndex) {
    return this.data.courses.find(c => c.day === dayIndex && c.slot === slotIndex)
  },

  getCoursesForDay: function (dayIndex) {
    return this.data.courses.filter(c => c.day === dayIndex).sort((a, b) => a.slot - b.slot)
  },

  switchView: function (e) {
    const mode = e.currentTarget.dataset.view
    this.setData({ viewMode: mode })
    if (mode === 'day') this.loadCourses()
  },

  prevWeek: function () {
    if (this.data.currentWeekOffset > -50) {
      this.setData({ currentWeekOffset: this.data.currentWeekOffset - 1 }, () => this.initWeekDays())
    }
  },

  nextWeek: function () {
    if (this.data.currentWeekOffset < 12) {
      this.setData({ currentWeekOffset: this.data.currentWeekOffset + 1 }, () => this.initWeekDays())
    }
  },

  addCourse: function () {
    wx.navigateTo({ url: '/pages/course-add/course-add' })
  },

  importCourse: function () {
    const that = this
    
    wx.showActionSheet({
      itemList: ['从聊天文件导入Excel', '导入示例课程'],
      success: (res) => {
        if (res.tapIndex === 0) {
          that.handleChooseFile()
        } else {
          that.importSampleCourses()
        }
      }
    })
  },

  handleChooseFile: function () {
    const that = this
    
    wx.showToast({
      title: '请从聊天中选择文件',
      icon: 'none',
      duration: 2000
    })
    
    setTimeout(() => {
      that.chooseFile()
    }, 500)
  },

  chooseFile: function () {
    const that = this
    const colors = ['#42b9ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16']
    
    if (wx.chooseMessageFile) {
      wx.chooseMessageFile({
        count: 1,
        type: 'file',
        success: function (res) {
          const file = res.tempFiles[0]
          const fileName = file.name || ''
          
          if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
            wx.showModal({
              title: '格式错误',
              content: '请选择Excel文件（.xlsx或.xls格式）',
              showCancel: false
            })
            return
          }
          
          that.parseExcelFile(file.path, colors)
        },
        fail: function () {
          wx.showModal({
            title: '提示',
            content: '无法选择文件，请先将Excel文件发送到微信聊天中。\n\n是否导入示例课程？',
            success: function (modalRes) {
              if (modalRes.confirm) {
                that.importSampleCourses()
              }
            }
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前环境不支持文件选择功能。\n\n是否导入示例课程？',
        success: function (modalRes) {
          if (modalRes.confirm) {
            that.importSampleCourses()
          }
        }
      })
    }
  },

  parseExcelFile: function (filePath, colors) {
    const that = this
    
    wx.showLoading({ title: '解析中...' })
    
    wx.getFileSystemManager().readFile({
      filePath: filePath,
      encoding: 'utf8',
      success: function (res) {
        try {
          const courses = that.extractCoursesFromCSV(res.data, colors)
          
          wx.hideLoading()
          
          if (courses.length === 0) {
            wx.showModal({
              title: '解析结果',
              content: '未找到有效课程数据。\n\n是否导入示例课程？',
              success: function (modalRes) {
                if (modalRes.confirm) {
                  that.importSampleCourses()
                }
              }
            })
            return
          }
          
          that.confirmAndSaveCourses(courses)
        } catch (e) {
          wx.hideLoading()
          that.handleParseError()
        }
      },
      fail: function () {
        wx.hideLoading()
        that.handleParseError()
      }
    })
  },

  handleParseError: function () {
    const that = this
    wx.showModal({
      title: '解析失败',
      content: '无法解析Excel文件。\n\n是否导入示例课程？',
      success: function (modalRes) {
        if (modalRes.confirm) {
          that.importSampleCourses()
        }
      }
    })
  },

  extractCoursesFromCSV: function (text, colors) {
    const courses = []
    const lines = text.split(/\r\n|\n/)
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith('#')) continue
      
      const parts = line.split(/,|\t|;/)
      if (parts.length < 5) continue
      
      const name = parts[0]?.trim()
      const teacher = parts[1]?.trim()
      const room = parts[2]?.trim()
      
      const dayStr = parts[3]?.trim()
      let day = parseInt(dayStr) || 1
      if (dayStr === '周一' || dayStr === '一') day = 1
      else if (dayStr === '周二' || dayStr === '二') day = 2
      else if (dayStr === '周三' || dayStr === '三') day = 3
      else if (dayStr === '周四' || dayStr === '四') day = 4
      else if (dayStr === '周五' || dayStr === '五') day = 5
      else if (dayStr === '周六' || dayStr === '六') day = 6
      else if (dayStr === '周日' || dayStr === '日') day = 0
      
      const slotStr = parts[4]?.trim()
      let slot = parseInt(slotStr) || 0
      if (slotStr === '第1节' || slotStr === '1节') slot = 0
      else if (slotStr === '第2节' || slotStr === '2节') slot = 1
      else if (slotStr === '第3节' || slotStr === '3节') slot = 2
      else if (slotStr === '第4节' || slotStr === '4节') slot = 3
      else if (slotStr === '第5节' || slotStr === '5节') slot = 4
      else if (slotStr === '第6节' || slotStr === '6节') slot = 5
      else if (slotStr === '第7节' || slotStr === '7节') slot = 6
      else if (slotStr === '第8节' || slotStr === '8节') slot = 7
      
      const colorStr = parts[5]?.trim()
      const color = colorStr && colorStr.startsWith('#') ? colorStr : colors[i % colors.length]
      
      if (!name || !teacher) continue
      
      const finalDay = Math.max(0, Math.min(6, day))
      const finalSlot = Math.max(0, Math.min(7, slot))
      
      courses.push({
        id: Date.now() + i,
        name: name,
        teacher: teacher,
        room: room || '未指定',
        day: finalDay,
        slot: finalSlot,
        color: color,
        remind: false,
        startWeek: 1,
        endWeek: 18
      })
    }
    
    return courses
  },

  readAndParseExcel: function (filePath, colors) {
    const that = this
    
    wx.showLoading({ title: '解析中...' })
    
    wx.getFileSystemManager().readFile({
      filePath: filePath,
      encoding: 'utf-8',
      success: (res) => {
        try {
          const data = typeof res.data === 'string' ? res.data : ''
          
          if (data.startsWith('PK')) {
            wx.hideLoading()
            wx.showModal({
              title: '文件格式错误',
              content: '无法直接解析.xlsx格式文件，请将Excel另存为CSV格式后再导入，或选择导入示例课程。',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  that.importSampleCourses()
                }
              }
            })
            return
          }
          
          const courses = that.extractCoursesFromText(data, colors)
          
          wx.hideLoading()
          
          if (courses.length === 0) {
            wx.showModal({
              title: '解析结果',
              content: '未找到课程数据，请检查文件格式是否正确。\n\n是否尝试导入示例课程？',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  that.importSampleCourses()
                }
              }
            })
            return
          }
          
          that.confirmAndSaveCourses(courses)
        } catch (e) {
          wx.hideLoading()
          wx.showModal({
            title: '解析失败',
            content: '无法解析文件，请将Excel另存为CSV格式后再导入，或尝试导入示例课程。',
            success: (modalRes) => {
              if (modalRes.confirm) {
                that.importSampleCourses()
              }
            }
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showModal({
          title: '读取失败',
          content: '无法读取文件，请尝试导入示例课程。',
          success: (modalRes) => {
            if (modalRes.confirm) {
              that.importSampleCourses()
            }
          }
        })
      }
    })
  },

  extractCoursesFromText: function (text, colors) {
    const courses = []
    
    const lines = text.split(/[\r\n]+/)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const parts = line.split(/[\t,;|]+/)
      if (parts.length < 5) continue
      
      const name = parts[0]?.trim()
      const teacher = parts[1]?.trim()
      const room = parts[2]?.trim()
      const day = parseInt(parts[3]) || 1
      const slot = parseInt(parts[4]) || 0
      const colorStr = parts[5]?.trim()
      const color = colorStr && colorStr.startsWith('#') ? colorStr : colors[i % colors.length]
      
      if (!name || !teacher) continue
      
      courses.push({
        id: Date.now() + i,
        name: name,
        teacher: teacher,
        room: room || '未指定',
        day: Math.max(0, Math.min(6, day)),
        slot: Math.max(0, Math.min(7, slot)),
        color: color,
        remind: false,
        startWeek: 1,
        endWeek: 18
      })
    }
    
    return courses
  },

  importSampleCourses: function () {
    const sampleCourses = [
      { id: Date.now() + 1, name: '高等数学', teacher: '张老师', room: '教学楼A-301', day: 1, slot: 0, color: '#42b9ff', remind: true, startWeek: 1, endWeek: 18 },
      { id: Date.now() + 2, name: '大学英语', teacher: '李老师', room: '教学楼B-202', day: 1, slot: 2, color: '#52c41a', remind: false, startWeek: 1, endWeek: 18 },
      { id: Date.now() + 3, name: '数据结构', teacher: '王老师', room: '实验楼C-101', day: 2, slot: 1, color: '#faad14', remind: true, startWeek: 1, endWeek: 16 },
      { id: Date.now() + 4, name: '操作系统', teacher: '赵老师', room: '教学楼A-401', day: 2, slot: 3, color: '#ff4d4f', remind: false, startWeek: 3, endWeek: 18 },
      { id: Date.now() + 5, name: '计算机网络', teacher: '刘老师', room: '实验楼C-202', day: 3, slot: 0, color: '#722ed1', remind: true, startWeek: 1, endWeek: 18 },
      { id: Date.now() + 6, name: '软件工程', teacher: '陈老师', room: '教学楼B-305', day: 3, slot: 4, color: '#13c2c2', remind: false, startWeek: 1, endWeek: 18 },
      { id: Date.now() + 7, name: '数据库原理', teacher: '周老师', room: '实验楼C-102', day: 4, slot: 1, color: '#eb2f96', remind: true, startWeek: 1, endWeek: 16 },
      { id: Date.now() + 8, name: '线性代数', teacher: '吴老师', room: '教学楼A-201', day: 4, slot: 5, color: '#42b9ff', remind: false, startWeek: 1, endWeek: 12 },
      { id: Date.now() + 9, name: '离散数学', teacher: '郑老师', room: '教学楼B-103', day: 5, slot: 2, color: '#52c41a', remind: true, startWeek: 1, endWeek: 14 },
      { id: Date.now() + 10, name: 'AI导论', teacher: '孙老师', room: '实验楼C-301', day: 5, slot: 6, color: '#faad14', remind: false, startWeek: 5, endWeek: 18 }
    ]
    
    wx.showModal({
      title: '导入示例课程',
      content: `即将导入 ${sampleCourses.length} 门示例课程：\n${sampleCourses.map(c => c.name).join('、')}`,
      success: (res) => {
        if (res.confirm) {
          this.confirmAndSaveCourses(sampleCourses)
        }
      }
    })
  },

  confirmAndSaveCourses: function (courses) {
    const that = this
    
    wx.showModal({
      title: '导入确认',
      content: `共解析到 ${courses.length} 门课程，确认导入？`,
      success: (modalRes) => {
        if (modalRes.confirm) {
          wx.showLoading({ title: '保存中...' })

          const userId = app.globalData.getUserId()
          
          const courseData = courses.map(c => ({
            name: c.name,
            teacher: c.teacher,
            room: c.room,
            dayOfWeek: c.day + 1,
            timeSlot: c.slot + 1,
            color: c.color,
            remindEnabled: c.remind || false,
            remindMinutes: 10,
            startWeek: c.startWeek || 1,
            endWeek: c.endWeek || 18
          }))
          
          post('/courses/batch', {
            courses: courseData,
            userId: userId
          }).then(res => {
            wx.hideLoading()
            wx.showToast({ title: `成功导入 ${courses.length} 门课程`, icon: 'success' })
            that.loadCoursesFromServer()
          }).catch(err => {
            wx.hideLoading()
            wx.showToast({ title: '保存失败', icon: 'none' })
            console.error('保存失败:', err)
          })
        }
      }
    })
  },

  loadCoursesFromServer: function () {
    const that = this
    const userId = app.globalData.getUserId()
    if (!userId) { console.warn('未登录，跳过加载课程'); return }

    wx.showLoading({ title: '加载中...' })
    
    get('/courses/user/' + userId).then(res => {
      wx.hideLoading()
      const records = Array.isArray(res) ? res : (res.data || [])
      
      if (records.length > 0) {
        const courses = records.map(c => ({
          id: c.id,
          name: c.name,
          teacher: c.teacher,
          room: c.room || '未指定',
          day: c.dayOfWeek !== undefined ? Math.max(0, c.dayOfWeek - 1) : 0,
          slot: c.timeSlot !== undefined ? Math.max(0, c.timeSlot - 1) : 0,
          color: c.color || '#42b9ff',
          remind: c.remindEnabled || false,
          startWeek: c.startWeek || 1,
          endWeek: c.endWeek || 18
        }))
        wx.setStorageSync('courses', courses)
        that.updateScheduleDisplay(courses)
      } else {
        that.loadCourses()
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('加载课程失败:', err)
      that.loadCourses()
    })
  },

  termConfig: function () {
    wx.showModal({
      title: '学期配置',
      content: '当前学期：' + this.data.termName + '\n开学时间：' + this.data.termStartDate + '\n当前周次：第' + this.data.currentWeek + '周',
      showCancel: false
    })
  },

  viewCourseDetail: function (e) {
    const course = e.currentTarget.dataset.course
    if (!course) return
    
    wx.showActionSheet({
      itemList: ['查看详情', '删除课程'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.showCourseInfo(course)
        } else if (res.tapIndex === 1) {
          this.deleteCourse(course)
        }
      }
    })
  },

  showCourseInfo: function (course) {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    wx.showModal({
      title: course.name,
      content: '教师：' + course.teacher + '\n教室：' + course.room + '\n时间：周' + weekDays[course.day] + ' 第' + (course.slot + 1) + '节\n提醒：' + (course.remind ? '开启' : '关闭'),
      showCancel: false
    })
  },

  deleteCourse: function (course) {
    const { del } = require('../../utils/request.js')
    const that = this
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除课程「' + course.name + '」吗？',
      success: (modalRes) => {
        if (modalRes.confirm) {
          wx.showLoading({ title: '删除中...' })
          
          del('/courses/' + course.id).then(res => {
            wx.hideLoading()
            
            let courses = wx.getStorageSync('courses') || []
            courses = courses.filter(c => c.id !== course.id)
            wx.setStorageSync('courses', courses)
            
            that.updateScheduleDisplay(courses)
            wx.showToast({ title: '删除成功', icon: 'success' })
          }).catch(err => {
            wx.hideLoading()
            console.error('删除失败:', err)
            
            let courses = wx.getStorageSync('courses') || []
            courses = courses.filter(c => c.id !== course.id)
            wx.setStorageSync('courses', courses)
            
            that.updateScheduleDisplay(courses)
            wx.showToast({ title: '删除成功', icon: 'success' })
          })
        }
      }
    })
  }
})