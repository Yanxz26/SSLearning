import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/admin-api',
  timeout: 15000,
  withCredentials: true
})

// 响应拦截器
request.interceptors.response.use(
  response => {
    const data = response.data
    if (data.code === 401) {
      ElMessage.error('登录已过期，请重新登录')
      window.location.href = '/login'
      return Promise.reject(new Error(data.msg || '未登录'))
    }
    return data
  },
  error => {
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      window.location.href = '/login'
    } else {
      ElMessage.error('网络异常，请稍后重试')
    }
    return Promise.reject(error)
  }
)

export default request
