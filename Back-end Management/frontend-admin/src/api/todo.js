import request from '../utils/request'

export function getTodoList(params) {
  return request.get('/todo/list', { params })
}

export function addTodo(data) {
  return request.post('/todo/add', data)
}

export function updateTodo(data) {
  return request.put('/todo/update', data)
}

export function deleteTodo(id) {
  return request.delete(`/todo/${id}`)
}
