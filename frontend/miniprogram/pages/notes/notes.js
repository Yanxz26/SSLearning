const app = getApp()
const { get, del, resolveFileUrl } = require('../../utils/request.js')
const syncManager = require('../../utils/syncManager.js')

/**
 * 把 notes[i].images（逗号分隔字符串）解析成 { urls: [], covers: [] }。
 * covers 是 urls 转成完整可访问地址，仅用于列表缩略图。
 */
function normalizeNote(n) {
  if (!n) return n
  let urls = []
  if (Array.isArray(n.images)) {
    urls = n.images.filter(Boolean)
  } else if (typeof n.images === 'string' && n.images) {
    urls = n.images.split(',').map(s => s.trim()).filter(Boolean)
  }
  return {
    ...n,
    tags: typeof n.tags === 'string'
      ? n.tags.split(',').map(s => s.trim()).filter(Boolean)
      : (n.tags || []),
    images: urls,
    cover: urls.length > 0 ? resolveFileUrl(urls[0]) : '',
    _key: (n.id != null && n.id !== '') ? ('id_' + n.id) : ('tmp_' + (n.tempId || ('k_' + Math.random())))
  }
}

/**
 * 合并服务端数据 + 本地乐观数据。
 * - 服务端有 id 的为权威来源
 * - 本地只有 tempId（还没同步成功）的保留，避免新建后被服务端返回覆盖丢笔记
 */
function mergeNotes(serverList, localList) {
  const seen = {}
  const merged = []

  const list = Array.isArray(serverList) ? serverList.slice() : []
  if (Array.isArray(localList)) {
    localList.forEach(ln => {
      if (!ln) return
      // 已同步成功（idMapping 有 tempId -> serverId）的本地临时项必须丢弃，
      // 否则会和 serverList 中同 serverId 的项按不同 key 算成两条重复。
      if (ln.tempId && syncManager && typeof syncManager.getServerIdByTempId === 'function'
          && syncManager.getServerIdByTempId('NOTE', ln.tempId)) {
        return
      }
      // 只追加"还没同步到服务端"的（id 为空/null 且有 tempId）
      if ((ln.id == null || ln.id === '') && ln.tempId) list.push(ln)
    })
  }

  list.forEach(n => {
    if (!n) return
    let key
    if (n.id != null && n.id !== '') {
      key = 'id_' + n.id
    } else if (n.tempId) {
      key = 'tmp_' + n.tempId
    } else {
      // 没有任何唯一标识的脏数据，跳过
      return
    }
    if (seen[key]) return
    seen[key] = true
    merged.push(normalizeNote(n))
  })
  return merged
}

/**
 * 错题数据规整：images 数组化、首张图拼成 cover。
 */
function normalizeWrong(w) {
  if (!w) return w
  let urls = []
  if (Array.isArray(w.images)) {
    urls = w.images.filter(Boolean)
  } else if (typeof w.images === 'string' && w.images) {
    urls = w.images.split(',').map(s => s.trim()).filter(Boolean)
  }
  return {
    ...w,
    images: urls,
    cover: urls.length > 0 ? resolveFileUrl(urls[0]) : '',
    _key: (w.id != null && w.id !== '') ? ('id_' + w.id) : ('tmp_' + (w.tempId || ('k_' + Math.random())))
  }
}

/**
 * 错题合并：服务端（按 id 权威） + 本地只有 tempId 的（乐观数据）
 * 错题 mock 数据没有 id 也没 tempId，会被丢弃（避免干扰真实列表）
 */
function mergeWrong(serverList, localList) {
  const seen = {}
  const merged = []

  const list = Array.isArray(serverList) ? serverList.slice() : []
  if (Array.isArray(localList)) {
    localList.forEach(lw => {
      if (!lw) return
      // 已同步成功（idMapping 有 tempId -> serverId）的本地临时项必须丢弃，
      // 否则会和 serverList 中同 serverId 的项按不同 key 算成两条重复。
      // 注意：reconcileLocalCache 在当前 SyncResult 实现下不会触发（无 entityType 字段），
      // 所以 dedupe 必须在这里兜底。
      if (lw.tempId && syncManager && typeof syncManager.getServerIdByTempId === 'function'
          && syncManager.getServerIdByTempId('WRONG_QUESTION', lw.tempId)) {
        return
      }
      if ((lw.id == null || lw.id === '') && lw.tempId) list.push(lw)
    })
  }

  list.forEach(w => {
    if (!w) return
    let key
    if (w.id != null && w.id !== '') {
      key = 'id_' + w.id
    } else if (w.tempId) {
      key = 'tmp_' + w.tempId
    } else {
      return
    }
    if (seen[key]) return
    seen[key] = true
    merged.push(normalizeWrong(w))
  })
  return merged
}

Page({
  data: {
    activeTab: 'notes',
    notes: [],
    wrongQuestions: [],
    searchKeyword: ''
  },

  onLoad: function () {
    this.loadNotes()
    this.loadWrongQuestions()
  },

  onShow: function () {
    this.loadNotes()
    this.loadWrongQuestions()
  },

  loadNotes: function () {
    const userId = app.globalData.getUserId()
    if (!userId) { console.warn('未登录，无法加载笔记'); return }

    // 1. 先读本地缓存，保留尚未同步成功的乐观数据
    const localNotes = wx.getStorageSync('notes') || []

    // 2. 进列表页也触发一次同步，把队列里的待办操作推上去
    //    （用户刚新建完一条笔记，立刻看到数据库结果）
    if (syncManager && typeof syncManager.flush === 'function') {
      syncManager.flush()
    }

    get('/notes/user/' + userId).then(res => {
      let serverNotes = []
      if (Array.isArray(res)) {
        serverNotes = res
      } else if (res && Array.isArray(res.data)) {
        serverNotes = res.data
      }

      // 3. 合并：服务端数据（权威） + 本地乐观数据（id 为 null 的 tempId 项）
      const merged = mergeNotes(serverNotes, localNotes)

      wx.setStorageSync('notes', merged)
      this.setData({ notes: merged })
    }).catch(err => {
      console.error('加载笔记失败，使用本地缓存:', err)
      // 网络挂了：仅展示本地（保留 tempId 乐观数据）
      this.setData({ notes: localNotes.map(normalizeNote) })
    })
  },

  loadWrongQuestions: function () {
    const userId = app.globalData.getUserId()
    if (!userId) { console.warn('未登录，无法加载错题'); return }

    const localWrong = wx.getStorageSync('wrongQuestions') || []

    if (syncManager && typeof syncManager.flush === 'function') {
      syncManager.flush()
    }

    get('/wrong-questions/user/' + userId).then(res => {
      let serverWrong = []
      if (Array.isArray(res)) {
        serverWrong = res
      } else if (res && Array.isArray(res.data)) {
        serverWrong = res.data
      }

      const merged = mergeWrong(serverWrong, localWrong)
      wx.setStorageSync('wrongQuestions', merged)
      this.setData({ wrongQuestions: merged })
    }).catch(err => {
      console.error('加载错题失败，使用本地缓存:', err)
      this.setData({ wrongQuestions: localWrong.map(normalizeWrong) })
    })
  },

  setTab: function (e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  viewNote: function (e) {
    const note = e.currentTarget.dataset.note
    wx.showModal({
      title: note.title,
      content: `内容：${note.content}\n标签：${(note.tags || []).join('、')}\n时间：${note.time || note.updatedAt || ''}`,
      showCancel: false
    })
  },

  /** 点击列表里的缩略图，全屏预览该笔记的全部图片 */
  previewNoteImage: function (e) {
    const note = this.data.notes[e.currentTarget.dataset.index]
    if (!note || !note.images || note.images.length === 0) return
    const urls = note.images.map(u => resolveFileUrl(u)).filter(Boolean)
    if (urls.length === 0) return
    wx.previewImage({ current: urls[0], urls: urls })
  },

  /** 点击列表里的缩略图，全屏预览该错题的全部图片 */
  previewWrongImage: function (e) {
    const w = this.data.wrongQuestions[e.currentTarget.dataset.index]
    if (!w || !w.images || w.images.length === 0) return
    const urls = w.images.map(u => resolveFileUrl(u)).filter(Boolean)
    if (urls.length === 0) return
    wx.previewImage({ current: urls[0], urls: urls })
  },

  viewWrong: function (e) {
    const wrong = e.currentTarget.dataset.wrong
    wx.showModal({
      title: `${wrong.subject} - 错题`,
      content: `题目：${wrong.question}\n答案：${wrong.answer}\n解析：${wrong.analysis}\n时间：${wrong.time}`,
      showCancel: false
    })
  },

  addNoteOrWrong: function () {
    if (this.data.activeTab === 'notes') {
      wx.navigateTo({ url: '/pages/note-add/note-add' })
    } else {
      wx.navigateTo({ url: '/pages/wrong-add/wrong-add' })
    }
  },

  deleteNote: function (e) {
    const note = e.currentTarget.dataset.note
    wx.showModal({
      title: '确认删除',
      content: `确定要删除笔记「${note.title}」吗？`,
      success: (res) => {
        if (!res.confirm) return

        const removeLocally = () => {
          const notes = this.data.notes.filter(n => n.id !== note.id)
          wx.setStorageSync('notes', notes)
          this.setData({ notes })
        }

        // 乐观项（尚未同步成功、id 为 null）：只删本地，并撤销队列里的 CREATE，
        // 否则 del('/notes/null') 会 400，且 CREATE 之后仍会被同步回来。
        if (!note.id || isNaN(note.id)) {
          if (note.tempId && syncManager && typeof syncManager.cancelPendingCreate === 'function') {
            syncManager.cancelPendingCreate('NOTE', note.tempId)
          }
          removeLocally()
          wx.showToast({ title: '删除成功', icon: 'success' })
          return
        }

        del('/notes/' + note.id).then(() => {
          removeLocally()
          wx.showToast({ title: '删除成功', icon: 'success' })
        }).catch(err => {
          console.error('删除笔记失败:', err)
          wx.showToast({ title: '删除失败，请重试', icon: 'none' })
        })
      }
    })
  },

    deleteWrong: function (e) {
    const wrong = e.currentTarget.dataset.wrong
    wx.showModal({
      title: '确认删除',
      content: `确定要删除这道${wrong.subject}错题吗？`,
      success: (res) => {
        if (!res.confirm) return

        const removeLocally = () => {
          const wrongQuestions = this.data.wrongQuestions.filter(w => w.id !== wrong.id)
          wx.setStorageSync('wrongQuestions', wrongQuestions)
          this.setData({ wrongQuestions })
        }

        // 乐观项（id 为 null）：只删本地 + 撤销队列 CREATE，不发 400 请求
        if (!wrong.id || isNaN(wrong.id) || typeof wrong.id !== 'number') {
          if (wrong.tempId && syncManager && typeof syncManager.cancelPendingCreate === 'function') {
            syncManager.cancelPendingCreate('WRONG_QUESTION', wrong.tempId)
          }
          removeLocally()
          wx.showToast({ title: '删除成功', icon: 'success' })
          return
        }

        removeLocally()
        del('/wrong-questions/' + wrong.id).then(() => {
          wx.showToast({ title: '删除成功', icon: 'success' })
        }).catch(err => {
          console.error('删除错题失败:', err)
          wx.showToast({ title: '删除失败，请重试', icon: 'none' })
        })
      }
    })
  },

  /**
   * 图片加载失败的兜底：微信真机上 <image> 的 HTTP 图片可能被下载域名白名单拦截，
   * 但同域下的 wx.downloadFile 在开启「不校验合法域名」时通常能过。
   * 这里自动重试下载到本地临时路径后再显示。
   */
  retryImageViaDownloadFile: function (listKey, index, url) {
    if (!url || url.startsWith('wxfile://')) return  // 已经是本地路径，不重试
    const that = this
    console.log('[notes] 图片加载失败，尝试 downloadFile:', url)
    wx.downloadFile({
      url: url,
      success: function (res) {
        if (res.statusCode === 200) {
          const key = listKey + '[' + index + '].cover'
          that.setData({ [key]: res.tempFilePath })
        }
      },
      fail: function (err) {
        console.error('[notes] downloadFile 也失败:', url, err.errMsg || err)
      }
    })
  },

  onNoteImageError: function (e) {
    this.retryImageViaDownloadFile('notes', e.currentTarget.dataset.index, e.currentTarget.dataset.src)
  },

  onWrongImageError: function (e) {
    this.retryImageViaDownloadFile('wrongQuestions', e.currentTarget.dataset.index, e.currentTarget.dataset.src)
  }
})
