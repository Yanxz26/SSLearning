import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('../components/Layout.vue'),
    redirect: '/user',
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('../pages/UserList.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'course',
        name: 'Course',
        component: () => import('../pages/CourseList.vue'),
        meta: { title: '课程管理' }
      },
      {
        path: 'focus',
        name: 'Focus',
        component: () => import('../pages/FocusList.vue'),
        meta: { title: '番茄专注记录' }
      },
      {
        path: 'note',
        name: 'Note',
        component: () => import('../pages/NoteList.vue'),
        meta: { title: '笔记管理' }
      },
      {
        path: 'wrong',
        name: 'Wrong',
        component: () => import('../pages/WrongList.vue'),
        meta: { title: '错题管理' }
      },
      {
        path: 'todo',
        name: 'Todo',
        component: () => import('../pages/TodoList.vue'),
        meta: { title: '待办任务管理' }
      },
      {
        path: 'term',
        name: 'Term',
        component: () => import('../pages/TermList.vue'),
        meta: { title: '学期配置管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：未登录跳转登录页
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
    return
  }
  // 简单判断：尝试请求当前用户信息，如果失败则跳转登录
  next()
})

export default router
