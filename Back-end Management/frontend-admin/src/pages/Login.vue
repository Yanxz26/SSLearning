<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">📚 学习小程序管理平台</h2>
      <p class="login-subtitle">大学生智能学习辅助系统 - 后台管理</p>
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-position="top"
        size="large"
      >
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入管理员账号"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <p class="login-hint">请输入管理员账号和密码</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '../api/auth'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await login(loginForm.username, loginForm.password)
    if (res.code === 200) {
      ElMessage.success('登录成功')
      router.push('/user')
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } catch (e) {
    ElMessage.error('登录失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  background: #ffffff;
  border-radius: 12px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.login-title {
  text-align: center;
  margin-bottom: 8px;
  font-size: 24px;
  color: #303133;
}

.login-subtitle {
  text-align: center;
  margin-bottom: 36px;
  font-size: 14px;
  color: #909399;
}

.login-hint {
  text-align: center;
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 16px;
}
</style>
