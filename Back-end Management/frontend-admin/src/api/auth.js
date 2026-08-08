import request from '../utils/request'

export function login(username, password) {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)
  return request.post('/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
}

export function logout() {
  return request.post('/logout')
}

export function getCurrentUser() {
  return request.get('/current-user')
}
