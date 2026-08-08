<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.userId" placeholder="输入用户ID" clearable />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="searchForm.title" placeholder="模糊搜索" clearable />
        </el-form-item>
        <el-form-item label="完成状态">
          <el-select v-model="searchForm.completed" placeholder="全部" clearable style="width:120px">
            <el-option :value="false" label="未完成" />
            <el-option :value="true" label="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增任务</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="title" label="标题" width="180" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ (row.description || '').substring(0, 60) }}</template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="80" />
        <el-table-column prop="deadline" label="截止时间" width="140" />
        <el-table-column prop="completed" label="完成" width="70">
          <template #default="{ row }">
            <el-tag :type="row.completed ? 'success' : 'info'">{{ row.completed ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="row.priority >= 3 ? 'danger' : row.priority >= 2 ? 'warning' : 'info'">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remindEnabled" label="提醒" width="70">
          <template #default="{ row }">{{ row.remindEnabled ? '开' : '关' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑任务' : '新增任务'" width="600px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="90px">
        <el-form-item label="用户ID" prop="userId">
          <el-input-number v-model="editForm.userId" :min="1" style="width:200px" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="分类">
              <el-select v-model="editForm.category" style="width:100%">
                <el-option value="作业" label="作业" />
                <el-option value="考试" label="考试" />
                <el-option value="复习" label="复习" />
                <el-option value="其他" label="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级">
              <el-input-number v-model="editForm.priority" :min="1" :max="5" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="截止时间">
          <el-date-picker v-model="editForm.deadline" type="datetime" placeholder="选择截止时间" style="width:100%" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="完成状态">
              <el-switch v-model="editForm.completed" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开启提醒">
              <el-switch v-model="editForm.remindEnabled" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { getTodoList, addTodo, updateTodo, deleteTodo } from '../api/todo'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ userId: '', title: '', completed: undefined })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getTodoList({
      userId: searchForm.userId || undefined,
      title: searchForm.title || undefined,
      completed: searchForm.completed,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    if (res.code === 200) {
      tableData.value = res.data || []
      pagination.total = res.total || 0
    }
  } finally { loading.value = false }
}

const handleSearch = () => { pagination.pageNum = 1; fetchData() }
const handleReset = () => { searchForm.userId = ''; searchForm.title = ''; searchForm.completed = undefined; handleSearch() }

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const editForm = reactive({
  id: null, userId: null, title: '', description: '', category: '作业',
  deadline: '', completed: false, remindEnabled: false, remindTime: '', priority: 1
})
const rules = {
  userId: [{ required: true, message: '用户ID不能为空' }],
  title: [{ required: true, message: '标题不能为空' }]
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(editForm, {
    id: null, userId: null, title: '', description: '', category: '作业',
    deadline: '', completed: false, remindEnabled: false, remindTime: '', priority: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(editForm, { ...row })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  const api = isEdit.value ? updateTodo : addTodo
  try {
    const res = await api({ ...editForm })
    if (res.code === 200) { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false; fetchData() }
    else { ElMessage.error(res.msg) }
  } catch (e) { ElMessage.error('操作失败') }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除任务「${row.title}」吗？`, '删除确认', { type: 'warning' })
    .then(async () => {
      const res = await deleteTodo(row.id)
      if (res.code === 200) { ElMessage.success('删除成功'); fetchData() }
      else { ElMessage.error(res.msg) }
    }).catch(() => {})
}

onMounted(() => { fetchData() })
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 16px; }
.search-card, .table-card { border-radius: 8px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
