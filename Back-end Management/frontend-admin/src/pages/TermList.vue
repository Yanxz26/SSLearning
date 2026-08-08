<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" size="default">
        <el-form-item>
          <el-button type="success" @click="handleAdd">新增学期配置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="termName" label="学期名称" width="200" />
        <el-table-column prop="startDate" label="开学日期" width="130" />
        <el-table-column prop="endDate" label="结束日期" width="130" />
        <el-table-column prop="totalWeeks" label="总周数" width="80" />
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
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑学期配置' : '新增学期配置'" width="500px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="100px">
        <el-form-item label="用户ID" prop="userId">
          <el-input-number v-model="editForm.userId" :min="1" style="width:100%" />
        </el-form-item>
        <el-form-item label="学期名称" prop="termName">
          <el-input v-model="editForm.termName" placeholder="如：2025-2026学年第二学期" />
        </el-form-item>
        <el-form-item label="开学日期" prop="startDate">
          <el-date-picker v-model="editForm.startDate" type="date" placeholder="选择开学日期" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="editForm.endDate" type="date" placeholder="选择结束日期" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="总周数" prop="totalWeeks">
          <el-input-number v-model="editForm.totalWeeks" :min="1" :max="30" style="width:100%" />
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
import { getTermList, addTerm, updateTerm, deleteTerm } from '../api/term'

const loading = ref(false)
const tableData = ref([])
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getTermList({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    if (res.code === 200) {
      tableData.value = res.data || []
      pagination.total = res.total || 0
    }
  } finally { loading.value = false }
}

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const editForm = reactive({ id: null, userId: null, termName: '', startDate: '', endDate: '', totalWeeks: 18 })
const rules = {
  userId: [{ required: true, message: '用户ID不能为空' }],
  termName: [{ required: true, message: '学期名称不能为空' }],
  startDate: [{ required: true, message: '开学日期不能为空' }],
  endDate: [{ required: true, message: '结束日期不能为空' }],
  totalWeeks: [{ required: true, message: '总周数不能为空' }]
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(editForm, { id: null, userId: null, termName: '', startDate: '', endDate: '', totalWeeks: 18 })
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
  const api = isEdit.value ? updateTerm : addTerm
  try {
    const res = await api({ ...editForm })
    if (res.code === 200) { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false; fetchData() }
    else { ElMessage.error(res.msg) }
  } catch (e) { ElMessage.error('操作失败') }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除学期配置「${row.termName}」吗？`, '删除确认', { type: 'warning' })
    .then(async () => {
      const res = await deleteTerm(row.id)
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
