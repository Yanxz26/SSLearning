import request from '../utils/request'

export function getUserList(params) {
  return request.get('/user/list', { params })
}

export function getUserDetail(id) {
  return request.get(`/user/${id}`)
}

export function updateUser(data) {
  return request.put('/user/update', data)
}

export function deleteUser(id) {
  return request.delete(`/user/${id}`)
}
