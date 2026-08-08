import request from '../utils/request'

export function getFocusList(params) {
  return request.get('/focus/list', { params })
}

export function getFocusDetail(id) {
  return request.get(`/focus/${id}`)
}

export function deleteFocus(id) {
  return request.delete(`/focus/${id}`)
}
