<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.userId" placeholder="输入用户ID" clearable />
        </el-form-item>
        <el-form-item label="科目">
          <el-input v-model="searchForm.subject" placeholder="科目名称" clearable />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="搜索题干/答案" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增错题</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="subject" label="科目" width="100" />
        <el-table-column prop="question" label="题目" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ (row.question || '').substring(0, 100) }}</template>
        </el-table-column>
        <el-table-column prop="answer" label="答案" width="150" show-overflow-tooltip />
        <el-table-column prop="analysis" label="解析" width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ (row.analysis || '').substring(0, 80) }}</template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" width="150" show-overflow-tooltip />
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
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑错题' : '新增错题'" width="650px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="80px">
        <el-form-item label="用户ID" prop="userId">
          <el-input-number v-model="editForm.userId" :min="1" style="width:200px" />
        </el-form-item>
        <el-form-item label="科目" prop="subject">
          <el-input v-model="editForm.subject" placeholder="如：高等数学" />
        </el-form-item>
        <el-form-item label="题目" prop="question">
          <el-input v-model="editForm.question" type="textarea" :rows="3" placeholder="题目内容" />
        </el-form-item>
        <el-form-item label="答案" prop="answer">
          <el-input v-model="editForm.answer" type="textarea" :rows="2" placeholder="正确答案" />
        </el-form-item>
        <el-form-item label="解析">
          <el-input v-model="editForm.analysis" type="textarea" :rows="3" placeholder="解题思路和解析" />
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
import { getWrongList, addWrong, updateWrong, deleteWrong } from '../api/wrong'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ userId: '', subject: '', keyword: '' })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getWrongList({
      userId: searchForm.userId || undefined,
      subject: searchForm.subject || undefined,
      keyword: searchForm.keyword || undefined,
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
const handleReset = () => { searchForm.userId = ''; searchForm.subject = ''; searchForm.keyword = ''; handleSearch() }

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const editForm = reactive({ id: null, userId: null, subject: '', question: '', answer: '', analysis: '', tags: '' })
const rules = {
  userId: [{ required: true, message: '用户ID不能为空' }],
  subject: [{ required: true, message: '科目不能为空' }],
  question: [{ required: true, message: '题目不能为空' }],
  answer: [{ required: true, message: '答案不能为空' }]
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(editForm, { id: null, userId: null, subject: '', question: '', answer: '', analysis: '', tags: '' })
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
  const api = isEdit.value ? updateWrong : addWrong
  try {
    const res = await api({ ...editForm })
    if (res.code === 200) { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false; fetchData() }
    else { ElMessage.error(res.msg) }
  } catch (e) { ElMessage.error('操作失败') }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除「${row.subject}」的这道错题吗？`, '删除确认', { type: 'warning' })
    .then(async () => {
      const res = await deleteWrong(row.id)
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
