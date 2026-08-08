const STORAGE_KEYS = {
  USER_INFO: 'user_info',
  OPEN_ID: 'open_id',
  SEMESTER_START: 'semester_start',
  FOCUS_SETTINGS: 'focus_settings'
}

const setItem = (key, value) => {
  try {
    wx.setStorageSync(key, typeof value === 'object' ? JSON.stringify(value) : value)
    return true
  } catch (e) {
    console.error('Storage set error:', e)
    return false
  }
}

const getItem = (key) => {
  try {
    const data = wx.getStorageSync(key)
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  } catch (e) {
    console.error('Storage get error:', e)
    return null
  }
}

const removeItem = (key) => {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('Storage remove error:', e)
    return false
  }
}

const clear = () => {
  try {
    wx.clearStorageSync()
    return true
  } catch (e) {
    console.error('Storage clear error:', e)
    return false
  }
}

module.exports = {
  STORAGE_KEYS,
  setItem,
  getItem,
  removeItem,
  clear
}