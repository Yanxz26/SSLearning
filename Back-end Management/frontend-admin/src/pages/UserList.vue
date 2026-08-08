<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="昵称">
          <el-input v-model="searchForm.nickName" placeholder="模糊搜索" clearable />
        </el-form-item>
        <el-form-item label="OpenID">
          <el-input v-model="searchForm.openId" placeholder="精确匹配" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="openId" label="OpenID" width="200" show-overflow-tooltip />
        <el-table-column prop="nickName" label="昵称" width="150" />
        <el-table-column prop="avatarUrl" label="头像" width="100">
          <template #default="{ row }">
            <el-avatar v-if="row.avatarUrl" :src="row.avatarUrl" :size="40" />
            <el-avatar v-else :size="40" icon="UserFilled" />
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" width="180" show-overflow-tooltip />
        <el-table-column prop="weekStartDay" label="周起始日" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑用户" width="500px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="100px">
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="editForm.nickName" />
        </el-form-item>
        <el-form-item label="头像URL" prop="avatarUrl">
          <el-input v-model="editForm.avatarUrl" placeholder="头像链接地址" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="周起始日">
          <el-select v-model="editForm.weekStartDay">
            <el-option :value="1" label="周一" />
            <el-option :value="7" label="周日" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, updateUser, deleteUser } from '../api/user'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ nickName: '', openId: '' })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      nickName: searchForm.nickName || undefined,
      openId: searchForm.openId || undefined,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    if (res.code === 200) {
      tableData.value = res.data || []
      pagination.total = res.total || 0
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

const handleReset = () => {
  searchForm.nickName = ''
  searchForm.openId = ''
  handleSearch()
}

// 编辑
const dialogVisible = ref(false)
const formRef = ref(null)
const editForm = reactive({ id: null, nickName: '', avatarUrl: '', phone: '', email: '', weekStartDay: 1 })
const rules = {
  nickName: [{ required: true, message: '昵称不能为空', trigger: 'blur' }]
}

const handleEdit = (row) => {
  Object.assign(editForm, {
    id: row.id,
    nickName: row.nickName || '',
    avatarUrl: row.avatarUrl || '',
    phone: row.phone || '',
    email: row.email || '',
    weekStartDay: row.weekStartDay || 1
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    const res = await updateUser({ ...editForm })
    if (res.code === 200) {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.msg)
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

// 删除（级联警告）
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定删除用户「${row.nickName || row.openId}」吗？此操作将同时删除该用户的全部课程、专注记录、笔记、错题、待办数据，且不可恢复！`,
    '删除确认（级联删除警告）',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    const res = await deleteUser(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功，已清空关联数据')
      fetchData()
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-card, .table-card {
  border-radius: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
