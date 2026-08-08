<template>
  <el-container class="layout-container">
    <!-- 顶部栏 -->
    <el-header class="layout-header">
      <div class="header-left">
        <span class="header-title">📚 学习小程序管理平台</span>
      </div>
      <div class="header-right">
        <span class="user-info">管理员：admin</span>
        <el-button type="danger" size="small" @click="handleLogout" plain>退出登录</el-button>
      </div>
    </el-header>
    <el-container>
      <!-- 左侧导航 -->
      <el-aside class="layout-aside" width="220px">
        <el-menu
          :default-active="activeMenu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/user">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/course">
            <el-icon><Reading /></el-icon>
            <span>课程管理</span>
          </el-menu-item>
          <el-menu-item index="/focus">
            <el-icon><Timer /></el-icon>
            <span>番茄专注记录</span>
          </el-menu-item>
          <el-menu-item index="/note">
            <el-icon><Document /></el-icon>
            <span>笔记管理</span>
          </el-menu-item>
          <el-menu-item index="/wrong">
            <el-icon><EditPen /></el-icon>
            <span>错题管理</span>
          </el-menu-item>
          <el-menu-item index="/todo">
            <el-icon><List /></el-icon>
            <span>待办任务管理</span>
          </el-menu-item>
          <el-menu-item index="/term">
            <el-icon><Setting /></el-icon>
            <span>学期配置管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <!-- 右侧内容区 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { logout } from '../api/auth'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => {
  return route.path
})

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await logout()
    } catch (e) {
      // ignore
    }
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-header {
  background-color: #1f2d3d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
}

.header-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  color: #bfcbd9;
  font-size: 14px;
}

.layout-aside {
  background-color: #304156;
  overflow-y: auto;
}

.el-menu {
  border-right: none;
}

.layout-main {
  background-color: #f0f2f5;
  padding: 24px;
  overflow-y: auto;
}
</style>
