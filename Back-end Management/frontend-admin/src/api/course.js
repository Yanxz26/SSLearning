import request from '../utils/request'

export function getCourseList(params) {
  return request.get('/course/list', { params })
}

export function addCourse(data) {
  return request.post('/course/add', data)
}

export function updateCourse(data) {
  return request.put('/course/update', data)
}

export function deleteCourse(id) {
  return request.delete(`/course/${id}`)
}
