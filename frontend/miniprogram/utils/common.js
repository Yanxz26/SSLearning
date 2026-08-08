const debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

const throttle = (fn, delay = 300) => {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

const getRandomColor = () => {
  const colors = [
    '#42b9ff',
    '#52c41a',
    '#faad14',
    '#f5222d',
    '#722ed1',
    '#eb2f96',
    '#13c2c2',
    '#fa8c16'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  })
}

const showModal = (options) => {
  return new Promise((resolve) => {
    wx.showModal({
      title: options.title || '提示',
      content: options.content || '',
      showCancel: options.showCancel !== undefined ? options.showCancel : true,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

const navigateTo = (url) => {
  wx.navigateTo({ url })
}

const switchTab = (url) => {
  wx.switchTab({ url })
}

module.exports = {
  debounce,
  throttle,
  generateId,
  getRandomColor,
  showToast,
  showModal,
  navigateTo,
  switchTab
}