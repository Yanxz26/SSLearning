<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.userId" placeholder="输入用户ID" clearable />
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input v-model="searchForm.name" placeholder="模糊搜索" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增课程</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="name" label="课程名称" width="150" />
        <el-table-column prop="teacher" label="教师" width="100" />
        <el-table-column prop="room" label="教室" width="100" />
        <el-table-column prop="dayOfWeek" label="星期" width="70">
          <template #default="{ row }">周{{ ['一','二','三','四','五','六','日'][row.dayOfWeek-1] || row.dayOfWeek }}</template>
        </el-table-column>
        <el-table-column prop="timeSlot" label="节次" width="70" />
        <el-table-column prop="color" label="颜色" width="80">
          <template #default="{ row }">
            <div :style="{ width:'24px',height:'24px',background:row.color,borderRadius:'4px' }" />
          </template>
        </el-table-column>
        <el-table-column prop="remindEnabled" label="提醒" width="70">
          <template #default="{ row }">{{ row.remindEnabled ? '开' : '关' }}</template>
        </el-table-column>
        <el-table-column prop="remindMinutes" label="提前(分)" width="80" />
        <el-table-column prop="startWeek" label="起始周" width="80" />
        <el-table-column prop="endWeek" label="结束周" width="80" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
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
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑课程' : '新增课程'" width="560px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用户ID" prop="userId">
              <el-input-number v-model="editForm.userId" :min="1" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程名称" prop="name">
              <el-input v-model="editForm.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="教师">
              <el-input v-model="editForm.teacher" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="教室">
              <el-input v-model="editForm.room" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="星期">
              <el-select v-model="editForm.dayOfWeek" style="width:100%">
                <el-option v-for="d in 7" :key="d" :value="d" :label="'周' + ['一','二','三','四','五','六','日'][d-1]" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="节次">
              <el-input-number v-model="editForm.timeSlot" :min="1" :max="15" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="起始周">
              <el-input-number v-model="editForm.startWeek" :min="1" :max="30" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束周">
              <el-input-number v-model="editForm.endWeek" :min="1" :max="30" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="颜色">
              <el-color-picker v-model="editForm.color" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提前提醒(分)">
              <el-input-number v-model="editForm.remindMinutes" :min="0" :max="60" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="开启提醒">
          <el-switch v-model="editForm.remindEnabled" />
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
import { getCourseList, addCourse, updateCourse, deleteCourse } from '../api/course'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ userId: '', name: '' })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCourseList({
      userId: searchForm.userId || undefined,
      name: searchForm.name || undefined,
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

const handleSearch = () => { pagination.pageNum = 1; fetchData() }
const handleReset = () => { searchForm.userId = ''; searchForm.name = ''; handleSearch() }

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const editForm = reactive({
  id: null, userId: null, name: '', teacher: '', room: '',
  dayOfWeek: 1, timeSlot: 1, color: '#42b9ff', remindEnabled: false,
  remindMinutes: 10, startWeek: 1, endWeek: 18
})
const rules = {
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '课程名称不能为空', trigger: 'blur' }]
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(editForm, {
    id: null, userId: null, name: '', teacher: '', room: '',
    dayOfWeek: 1, timeSlot: 1, color: '#42b9ff', remindEnabled: false,
    remindMinutes: 10, startWeek: 1, endWeek: 18
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
  const api = isEdit.value ? updateCourse : addCourse
  try {
    const res = await api({ ...editForm })
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.msg)
    }
  } catch (e) { ElMessage.error('操作失败') }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除课程「${row.name}」吗？`, '删除确认', { type: 'warning' })
    .then(async () => {
      const res = await deleteCourse(row.id)
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
