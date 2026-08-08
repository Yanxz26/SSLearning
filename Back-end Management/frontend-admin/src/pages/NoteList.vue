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
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增笔记</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="title" label="标题" width="180" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ (row.content || '').substring(0, 100) }}</template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" width="150" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column prop="updatedAt" label="更新时间" width="170" />
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
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑笔记' : '新增笔记'" width="600px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="80px">
        <el-form-item label="用户ID" prop="userId">
          <el-input-number v-model="editForm.userId" :min="1" style="width:200px" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="editForm.content" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="editForm.tags" placeholder="多个标签用逗号分隔" />
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
import { getNoteList, addNote, updateNote, deleteNote } from '../api/note'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ userId: '', title: '' })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getNoteList({
      userId: searchForm.userId || undefined,
      title: searchForm.title || undefined,
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
const handleReset = () => { searchForm.userId = ''; searchForm.title = ''; handleSearch() }

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const editForm = reactive({ id: null, userId: null, title: '', content: '', tags: '' })
const rules = {
  userId: [{ required: true, message: '用户ID不能为空' }],
  title: [{ required: true, message: '标题不能为空' }]
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(editForm, { id: null, userId: null, title: '', content: '', tags: '' })
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
  const api = isEdit.value ? updateNote : addNote
  try {
    const res = await api({ ...editForm })
    if (res.code === 200) { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false; fetchData() }
    else { ElMessage.error(res.msg) }
  } catch (e) { ElMessage.error('操作失败') }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除笔记「${row.title}」吗？`, '删除确认', { type: 'warning' })
    .then(async () => {
      const res = await deleteNote(row.id)
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
