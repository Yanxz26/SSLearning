import request from '../utils/request'

export function getTermList(params) {
  return request.get('/term/list', { params })
}

export function addTerm(data) {
  return request.post('/term/add', data)
}

export function updateTerm(data) {
  return request.put('/term/update', data)
}

export function deleteTerm(id) {
  return request.delete(`/term/${id}`)
}
