import request from '../utils/request'

export function getNoteList(params) {
  return request.get('/note/list', { params })
}

export function addNote(data) {
  return request.post('/note/add', data)
}

export function updateNote(data) {
  return request.put('/note/update', data)
}

export function deleteNote(id) {
  return request.delete(`/note/${id}`)
}
