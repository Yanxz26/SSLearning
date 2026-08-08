// ============================================================================
// 后端地址配置
//
// 关键：真机调试时 localhost 指的是「手机自己」，不是你的电脑，
// 所以手机上会直接 ERR_CONNECTION_REFUSED（连接被拒绝，不是超时）。
// 真机必须用电脑在局域网里的 IP，且手机和电脑要连同一个 WiFi。
//
// 局域网 IP 不写死在源码里（避免把开发者私网 IP 公开到仓库）：
//   - 优先读 utils/local-config.js（该文件被 .gitignore 忽略，每人用自己的）
//   - 没有该文件（如全新 clone）时退回 localhost，开发者工具场景可正常跑
// ============================================================================
let LAN_HOST = 'localhost'
try {
  const localConfig = require('./local-config.js')
  if (localConfig && localConfig.LAN_HOST) {
    LAN_HOST = localConfig.LAN_HOST
  }
} catch (e) {
  // 没有 local-config.js 时保持 localhost（开发者工具场景）
}
const PORT = 8080

/**
 * 自动选择后端地址：
 * - 开发者工具（devtools）→ localhost，走本机回环，最快
 * - 真机 / 其他环境      → 局域网 IP
 */
function resolveBaseUrl() {
  let host = LAN_HOST
  try {
    // getSystemInfoSync().platform === 'devtools' 表示运行在开发者工具模拟器里
    const platform = wx.getSystemInfoSync().platform
    if (platform === 'devtools') host = 'localhost'
  } catch (e) {
    // 取不到就退回局域网 IP，真机场景更常见
  }
  return 'http://' + host + ':' + PORT + '/api'
}

const baseUrl = resolveBaseUrl()
console.log('[request] baseUrl =', baseUrl)

const request = (options) => {
  const { url, method = 'GET', data = {}, header = {}, timeout = 30000 } = options
  // 记录发起时刻，失败时可以算出「到底卡了多久」，用来区分「真超时」和「秒失败」
  const startedAt = Date.now()
  const tag = method + ' ' + url

  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      timeout: timeout,
      success: (res) => {
        // 200-299都视为成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 204表示无内容，返回空对象
          if (res.statusCode === 204) {
            resolve({})
          } else {
            resolve(res.data)
          }
        } else {
          console.error('[request] HTTP ' + res.statusCode + ' <- ' + tag,
            '耗时', Date.now() - startedAt, 'ms')
          reject(new Error(`HTTP status ${res.statusCode}`))
        }
      },
      fail: (err) => {
        const cost = Date.now() - startedAt
        const msg = (err && err.errMsg) || String(err)
        // 关键：小程序抛出的裸 "Error: timeout" 不带调用方信息，这里补上接口名和耗时，
        // 否则 Console 里只能看到 WAServiceMainContext 的栈，根本不知道是哪个请求超时的。
        console.error('[request] FAIL <- ' + tag, '|', msg, '| 耗时', cost, 'ms',
          '| timeout 阈值', timeout, 'ms')
        if (msg.indexOf('timeout') !== -1) {
          console.error('[request] ↑ 该请求超时，请检查后端 ' + baseUrl + url + ' 是否响应缓慢或未启动')
        }
        err.__url = tag
        err.__cost = cost
        reject(err)
      }
    })
  })
}

const get = (url, params = {}) => {
  return request({ url, method: 'GET', data: params })
}

const post = (url, data = {}) => {
  return request({ url, method: 'POST', data })
}

const put = (url, data = {}) => {
  return request({ url, method: 'PUT', data })
}

const del = (url) => {
  return request({ url, method: 'DELETE' })
}

// 服务器根地址（去掉 /api），用于拼接 /uploads/xxx 这类静态资源
const serverOrigin = baseUrl.replace(/\/api\/?$/, '')

/**
 * 把后端返回的相对图片路径拼成完整可访问地址。
 * 已经是 http/https 或本地临时文件(wxfile/http-temp)的原样返回。
 */
const resolveFileUrl = (path) => {
  if (!path) return ''
  if (/^(https?:|wxfile:|cloud:|data:)/.test(path)) return path
  return serverOrigin + (path.charAt(0) === '/' ? path : '/' + path)
}

/**
 * 上传单个文件到 /api/files/upload
 * @param {string} filePath 本地临时文件路径（wx.chooseMedia 返回的 tempFilePath）
 * @param {string} business 业务目录，默认 notes
 * @returns {Promise<{url:string,name:string,size:number}>} url 为相对路径
 */
const uploadFile = (filePath, business = 'notes') => {
  const startedAt = Date.now()
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: baseUrl + '/files/upload',
      filePath: filePath,
      name: 'file',
      formData: { business: business },
      timeout: 60000,
      success: (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.error('[uploadFile] HTTP ' + res.statusCode, filePath,
            '耗时', Date.now() - startedAt, 'ms')
          reject(new Error('HTTP status ' + res.statusCode))
          return
        }
        // uploadFile 返回的 data 是字符串，需要自己解析
        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (data && data.url) resolve(data)
          else reject(new Error((data && data.error) || '上传失败'))
        } catch (e) {
          reject(new Error('响应解析失败: ' + res.data))
        }
      },
      fail: (err) => {
        const cost = Date.now() - startedAt
        const msg = (err && err.errMsg) || String(err)
        console.error('[uploadFile] FAIL', filePath, '|', msg, '| 耗时', cost, 'ms')
        if (msg.indexOf('timeout') !== -1) {
          console.error('[uploadFile] ↑ 上传超时(60s)，多半是图片过大或 /api/files/upload 未就绪')
        }
        reject(err)
      }
    })
  })
}

/**
 * 删除服务器上的图片（传相对路径）
 */
const deleteFile = (url) => {
  return request({ url: '/files/delete?url=' + encodeURIComponent(url), method: 'DELETE' })
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  uploadFile,
  deleteFile,
  resolveFileUrl,
  baseUrl,
  serverOrigin
}
