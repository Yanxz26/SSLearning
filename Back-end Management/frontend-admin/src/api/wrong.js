import request from '../utils/request'

export function getWrongList(params) {
  return request.get('/wrong/list', { params })
}

export function addWrong(data) {
  return request.post('/wrong/add', data)
}

export function updateWrong(data) {
  return request.put('/wrong/update', data)
}

export function deleteWrong(id) {
  return request.delete(`/wrong/${id}`)
}
