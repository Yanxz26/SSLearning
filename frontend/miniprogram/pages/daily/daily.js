const { formatDate, getWeekDay, getDayOfWeek } = require('../../utils/date.js')
const { mockCourses } = require('../../data/mockData.js')

Page({
  data: {
    currentDate: '',
    currentWeekday: '',
    selectedDate: null,
    timeSlots: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    dayCourses: []
  },

  onLoad: function () {
    const now = new Date()
    this.setSelectedDate(now)
  },

  setSelectedDate: function (date) {
    const dayOfWeek = getDayOfWeek(date)
    const courses = mockCourses.filter(c => c.day_of_week === dayOfWeek)

    this.setData({
      selectedDate: date,
      currentDate: formatDate(date, 'YYYY年MM月DD日'),
      currentWeekday: getWeekDay(date),
      dayCourses: courses
    })
  },

  prevDay: function () {
    const prevDate = new Date(this.data.selectedDate.getTime() - 24 * 60 * 60 * 1000)
    this.setSelectedDate(prevDate)
  },

  nextDay: function () {
    const nextDate = new Date(this.data.selectedDate.getTime() + 24 * 60 * 60 * 1000)
    this.setSelectedDate(nextDate)
  },

  goToday: function () {
    this.setSelectedDate(new Date())
  },

  getCoursesAtTime: function (time) {
    const timeMap = {
      '08:00': [1, 2],
      '09:00': [2, 3],
      '10:00': [3, 4],
      '11:00': [4, 5],
      '12:00': [5],
      '13:00': [],
      '14:00': [6, 7],
      '15:00': [7, 8],
      '16:00': [8],
      '17:00': []
    }
    const periods = timeMap[time] || []
    return this.data.dayCourses.filter(c => periods.includes(c.start_period))
  }
})