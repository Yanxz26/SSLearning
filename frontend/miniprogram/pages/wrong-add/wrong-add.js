const syncManager = require('../../utils/syncManager.js')
const { uploadFile, deleteFile, resolveFileUrl } = require('../../utils/request.js')

const MAX_IMAGES = 9

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

Page({
  data: {
    wrong: {
      subject: '高等数学',
      question: '',
      answer: '',
      analysis: ''
    },
    subjects: ['高等数学', '大学英语', '数据结构', '操作系统', '计算机网络'],
    showCustomInput: false,
    customSubject: '',
    /** 图片列表，每项 {url, display, uploading} */
    images: []
  },

  onInput: function (e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`wrong.${field}`]: e.detail.value
    })
  },

  onSubjectChange: function (e) {
    this.setData({
      'wrong.subject': e.currentTarget.dataset.subject
    })
  },

  showCustomSubject: function () {
    this.setData({ showCustomInput: true })
  },

  onCustomSubjectInput: function (e) {
    this.setData({ customSubject: e.detail.value })
  },

  addCustomSubject: function () {
    if (this.data.customSubject.trim()) {
      const subject = this.data.customSubject.trim()
      this.setData({
        'wrong.subject': subject,
        subjects: [...this.data.subjects, subject],
        customSubject: '',
        showCustomInput: false
      })
    }
  },

  saveWrong: function () {
    if (!this.data.wrong.question) {
      wx.showToast({ title: '请输入错题题目', icon: 'none' })
      return
    }

    if (!this.data.wrong.answer) {
      wx.showToast({ title: '请输入正确答案', icon: 'none' })
      return
    }

    if (this.data.images.some(img => img.uploading)) {
      wx.showToast({ title: '图片上传中，请稍候', icon: 'none' })
      return
    }

    const imageUrls = this.data.images.map(img => img.url).filter(u => !!u)

    const wrongData = {
      subject: this.data.wrong.subject,
      question: this.data.wrong.question,
      answer: this.data.wrong.answer,
      analysis: this.data.wrong.analysis || '',
      images: imageUrls.join(',')
      // 不传 createdAt/updatedAt：服务端统一用 LocalDateTime.now() 写入。
      // 前端斜杠格式 "2026/08/07 22:50:30" 会导致 Jackson 反序列化失败、同步静默失败。
    }

    const tempId = 'temp_' + Date.now()
    // 同一 tempId 同时用于「入队」与「本地乐观缓存」，
    // 保证同步成功后能回写 serverId，避免「临时项 + 服务端项」重复。
    syncManager.syncCreateWrongQuestion(wrongData, tempId)

    const wrongQuestions = wx.getStorageSync('wrongQuestions') || []
    wrongQuestions.unshift({
      ...this.data.wrong,
      id: null,
      tempId: tempId,
      time: formatDate(new Date()),
      createdAt: new Date().toISOString().split('T')[0],
      images: imageUrls.join(',')
    })
    wx.setStorageSync('wrongQuestions', wrongQuestions)

    wx.showToast({ title: '已加入同步队列', icon: 'success' })
    setTimeout(() => {
      wx.navigateBack()
    }, 800)
  },

  // ==================== 图片 ====================

  chooseImage: function () {
    const remain = MAX_IMAGES - this.data.images.length
    if (remain <= 0) {
      wx.showToast({ title: '最多 ' + MAX_IMAGES + ' 张', icon: 'none' })
      return
    }

    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const files = res.tempFiles || []
        if (files.length === 0) return

        const placeholders = files.map(f => ({
          url: '',
          display: f.tempFilePath,
          tempFilePath: f.tempFilePath,
          uploading: true
        }))
        const startIndex = this.data.images.length
        this.setData({ images: this.data.images.concat(placeholders) })

        files.forEach((f, i) => {
          const idx = startIndex + i
          uploadFile(f.tempFilePath, 'wrong').then(result => {
            const images = this.data.images.slice()
            if (!images[idx]) return
            images[idx] = {
              url: result.url,
              display: resolveFileUrl(result.url),
              uploading: false
            }
            this.setData({ images: images })
          }).catch(err => {
            console.error('图片上传失败:', err)
            const images = this.data.images.filter((item, j) => j !== idx || !item.uploading)
            this.setData({ images: images })
            wx.showToast({ title: '图片上传失败', icon: 'none' })
          })
        })
      }
    })
  },

  previewImage: function (e) {
    const index = e.currentTarget.dataset.index
    const urls = this.data.images.map(item => item.display).filter(u => !!u)
    if (urls.length === 0) return
    wx.previewImage({ current: urls[index], urls: urls })
  },

  removeImage: function (e) {
    const index = e.currentTarget.dataset.index
    const target = this.data.images[index]
    if (!target) return

    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images: images })

    if (target.url) {
      deleteFile(target.url).catch(err => console.warn('服务端删除图片失败:', err))
    }
  }
})
