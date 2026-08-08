<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.userId" placeholder="输入用户ID" clearable />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="date" label="记录日期" width="120" />
        <el-table-column prop="focusDuration" label="专注时长(秒)" width="120" />
        <el-table-column prop="breakDuration" label="休息时长(秒)" width="120" />
        <el-table-column prop="startTime" label="开始时间" width="170" />
        <el-table-column prop="endTime" label="结束时间" width="170" />
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFocusList, deleteFocus } from '../api/focus'

const loading = ref(false)
const tableData = ref([])
const dateRange = ref([])
const searchForm = reactive({ userId: '' })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getFocusList({
      userId: searchForm.userId || undefined,
      startDate: dateRange.value?.[0] || undefined,
      endDate: dateRange.value?.[1] || undefined,
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
const handleReset = () => { searchForm.userId = ''; dateRange.value = []; handleSearch() }

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除 ${row.date} 的专注记录吗？`, '删除确认', { type: 'warning' })
    .then(async () => {
      const res = await deleteFocus(row.id)
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
