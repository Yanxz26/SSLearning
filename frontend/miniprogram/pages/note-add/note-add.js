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
    note: {
      title: '',
      content: '',
      tags: []
    },
    defaultTags: ['数据结构', '高数', '英语', '复习', '笔记', '作业'],
    showTagInput: false,
    newTag: '',
    /**
     * 图片列表，每项结构：
     * { url: 服务器相对路径(上传成功后才有), display: 用于展示的地址, uploading: 是否上传中 }
     */
    images: []
  },

  onLoad: function () {
    this.setData({
      defaultTags: ['数据结构', '高数', '英语', '复习', '笔记', '作业']
    })
  },

  onInput: function (e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`note.${field}`]: e.detail.value
    })
  },

  // ==================== 图片 ====================

  /**
   * 选择图片并逐张上传。
   * 先用本地临时路径占位显示（uploading: true），上传成功后替换为服务器地址。
   */
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

        // 先占位
        const placeholders = files.map(f => ({
          url: '',
          display: f.tempFilePath,
          tempFilePath: f.tempFilePath,
          uploading: true
        }))
        const startIndex = this.data.images.length
        this.setData({ images: this.data.images.concat(placeholders) })

        // 逐张上传，单张失败不影响其它
        files.forEach((f, i) => {
          const idx = startIndex + i
          uploadFile(f.tempFilePath, 'notes').then(result => {
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
            // 移除失败的占位项
            const images = this.data.images.filter((item, j) => j !== idx || !item.uploading)
            this.setData({ images: images })
            wx.showToast({ title: '图片上传失败', icon: 'none' })
          })
        })
      }
    })
  },

  /** 点击图片全屏预览 */
  previewImage: function (e) {
    const index = e.currentTarget.dataset.index
    const urls = this.data.images.map(item => item.display).filter(u => !!u)
    if (urls.length === 0) return
    wx.previewImage({ current: urls[index], urls: urls })
  },

  /** 删除某张图片，已上传的同时通知服务端删文件 */
  removeImage: function (e) {
    const index = e.currentTarget.dataset.index
    const target = this.data.images[index]
    if (!target) return

    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images: images })

    // 已经落盘的才需要通知服务端清理，失败也不影响用户操作
    if (target.url) {
      deleteFile(target.url).catch(err => console.warn('服务端删除图片失败:', err))
    }
  },

  toggleTag: function (e) {
    const tag = e.currentTarget.dataset.tag
    const tags = this.data.note.tags.includes(tag)
      ? this.data.note.tags.filter(t => t !== tag)
      : [...this.data.note.tags, tag]
    this.setData({ 'note.tags': tags })
  },

  showAddTag: function () {
    this.setData({ showTagInput: true })
  },

  onNewTagInput: function (e) {
    this.setData({ newTag: e.detail.value })
  },

  removeTag: function (e) {
    const index = e.currentTarget.dataset.index
    const tags = this.data.note.tags.filter((_, i) => i !== index)
    this.setData({ 'note.tags': tags })
  },

  addCustomTag: function () {
    if (this.data.newTag.trim()) {
      const tags = [...this.data.note.tags, this.data.newTag.trim()]
      this.setData({
        'note.tags': tags,
        newTag: '',
        showTagInput: false
      })
    }
  },

  saveNote: function () {
    if (!this.data.note.title) {
      wx.showToast({ title: '请输入笔记标题', icon: 'none' })
      return
    }

    if (!this.data.note.content) {
      wx.showToast({ title: '请输入笔记内容', icon: 'none' })
      return
    }

    // 还有图片在上传中就先等一下，否则会丢图
    if (this.data.images.some(img => img.uploading)) {
      wx.showToast({ title: '图片上传中，请稍候', icon: 'none' })
      return
    }

    // 只取上传成功的（有服务器相对路径的），逗号分隔存库
    const imageUrls = this.data.images.map(img => img.url).filter(u => !!u)

    // 不带 userId（由 syncManager 从 user_info 取，服务端用 SyncRequest.userId 注入）
    const noteData = {
      title: this.data.note.title,
      content: this.data.note.content,
      tags: this.data.note.tags.join(','),
      images: imageUrls.join(',')
      // 不传 createdAt/updatedAt：服务端统一写入，避免斜杠日期导致同步失败
    }

    // 进入同步队列（同一 tempId 同时用于入队与本地乐观缓存）
    const tempId = 'temp_' + Date.now()
    syncManager.syncCreateNote(noteData, tempId)

    // 乐观写本地：立即出现在笔记列表
    const notes = wx.getStorageSync('notes') || []
    notes.unshift({
      ...this.data.note,
      id: null,
      tempId: tempId,
      tags: this.data.note.tags,
      images: imageUrls.join(','),
      time: formatDate(new Date()),
      createdAt: new Date().toISOString().split('T')[0]
    })
    wx.setStorageSync('notes', notes)

    wx.showToast({ title: '已加入同步队列', icon: 'success' })
    setTimeout(() => {
      wx.navigateBack()
    }, 800)
  }
})
