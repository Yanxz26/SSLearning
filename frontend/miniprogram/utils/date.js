const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

const getWeekDays = () => {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  const today = new Date()
  const dayOfWeek = today.getDay()
  const weekDays = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - dayOfWeek + i)
    weekDays.push({
      name: days[i],
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      fullDate: date.toISOString().split('T')[0],
      dayIndex: i
    })
  }
  
  return weekDays
}

const getTodayStr = () => {
  return formatDate(new Date())
}

const diffDays = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))
}

const isToday = (dateStr) => {
  return dateStr === getTodayStr()
}

module.exports = {
  formatDate,
  getWeekDays,
  getTodayStr,
  diffDays,
  isToday
}
