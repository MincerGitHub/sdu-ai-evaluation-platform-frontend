<template>
  <div class="page-container system-logs-page">
    <header class="page-header">
      <h2>系统日志</h2>
    </header>

    <div class="table-toolbar">
      <div class="toolbar-left" />
      <div class="toolbar-right">
        <el-button class="btn-plain" @click="resetFilters">重置</el-button>
        <el-button class="btn-main" @click="fetchLogs(1)">筛选</el-button>
        <el-input
          v-model.trim="filters.action"
          placeholder="按 action 筛选"
          clearable
          style="width: 220px"
          @keyup.enter="fetchLogs(1)"
        />
      </div>
    </div>

    <div class="table-block">
      <el-table :data="rows" border stripe v-loading="loading" empty-text="暂无系统日志">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="action" label="动作" min-width="180" show-overflow-tooltip />
        <el-table-column prop="actor_id" label="操作人" width="100" />
        <el-table-column prop="target_type" label="目标类型" min-width="120" show-overflow-tooltip />
        <el-table-column prop="target_id" label="目标ID" min-width="140" show-overflow-tooltip />
        <el-table-column label="详情" min-width="280">
          <template #default="{ row }">
            <pre class="detail-json">{{ formatJson(row.detail) }}</pre>
          </template>
        </el-table-column>
        <el-table-column label="时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :current-page="pagination.page"
          :page-size="pagination.size"
          :total="pagination.total"
          @current-change="fetchLogs"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import systemService from '@/services/systemService'

const loading = ref(false)
const rows = ref([])

const filters = reactive({
  action: '',
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

const formatDateTime = (value) => {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleString('zh-CN', { hour12: false })
}

const formatJson = (value) => {
  try {
    return JSON.stringify(value ?? {}, null, 2)
  } catch {
    return String(value ?? '')
  }
}

const fetchLogs = async (page = pagination.page) => {
  loading.value = true
  pagination.page = page
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
    }
    if (filters.action) params.action = filters.action

    const res = await systemService.getLogs(params)
    const data = res?.data || {}
    rows.value = Array.isArray(data.list) ? data.list : []
    pagination.total = Number(data.total || 0)
    pagination.page = Number(data.page || pagination.page)
    pagination.size = Number(data.size || pagination.size)
  } catch (error) {
    rows.value = []
    ElMessage.error(error?.message || '获取系统日志失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.action = ''
  fetchLogs(1)
}

onMounted(() => {
  fetchLogs(1)
})
</script>

<style scoped>
.detail-json {
  margin: 0;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
