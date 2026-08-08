const syncManager = require('./utils/syncManager.js')

App({
  onLaunch: function () {
    console.log('App Launch')

    // 启动弱网补偿同步管理器
    // - 注册网络状态变化监听（onNetworkStatusChange）
    // - 启动时尝试把上次未同步的写操作清空
    syncManager.init()

    // 已暂时禁用自动登录/注册 —— 之前调 /users/openid/{openId} 触发 500
    // 改为让用户在调试控制台手动设置 userId：
    //   getApp().globalData.setUserInfo({ id: 1, nickName: '你的名字' })
    // 业务页面的 getUserId() 会从这里取值
  },

  onShow: function () {
    console.log('App Show')
    syncManager.flush()
  },

  onHide: function () {
    console.log('App Hide')
  },

  globalData: {
    userInfo: null,
    // 统一从 request.js 取，避免这里写死 localhost 导致真机连不上后端
    // （真机的 localhost 是手机自己，会 ERR_CONNECTION_REFUSED）
    baseUrl: require('./utils/request.js').baseUrl,

    /**
     * 写入当前登录用户，syncManager 会从这里读取 userId
     * 调试用法（控制台）：
     *   getApp().globalData.setUserInfo({ id: 1, nickName: '...' })
     */
    setUserInfo: function (user) {
      this.userInfo = user
      try {
        wx.setStorageSync('user_info', user)
      } catch (e) {
        console.error('保存 user_info 失败:', e)
      }
      syncManager.flush()
    },

    /**
     * 获取当前用户 ID（同步）。
     * 数据库已有数据归属 user_id=3，作为默认 fallback。
     * 若以后接入真实登录，只需调用 setUserInfo({ id: X, ... }) 覆盖即可。
     */
    getUserId: function () {
      if (this.userInfo && this.userInfo.id) return this.userInfo.id
      try {
        const cached = wx.getStorageSync('user_info')
        if (cached) {
          const u = typeof cached === 'string' ? JSON.parse(cached) : cached
          if (u && u.id) return u.id
        }
      } catch (e) { /* ignore */ }
      return 3
    }
  }
})
