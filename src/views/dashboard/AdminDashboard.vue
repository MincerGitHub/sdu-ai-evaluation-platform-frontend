<template>
  <div class="page-container admin-dashboard-page">
    <header class="page-header">
      <h2>管理员首页</h2>
    </header>

    <el-row :gutter="12" class="metrics">
      <el-col :xs="12" :sm="6">
        <el-card>服务状态：{{ healthStatus }}</el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>系统配置项：{{ configCount }}</el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>奖项字典：{{ awardCount }}</el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>系统日志总数：{{ logTotal }}</el-card>
      </el-col>
    </el-row>

    <el-card class="section-card">
      <template #header>最近系统日志（10条）</template>
      <el-table :data="logs" size="small" border stripe>
        <el-table-column prop="action" label="动作" min-width="180" show-overflow-tooltip />
        <el-table-column prop="target_type" label="目标类型" width="120" />
        <el-table-column prop="target_id" label="目标ID" min-width="120" show-overflow-tooltip />
        <el-table-column label="时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import systemService from '@/services/systemService'

const health = ref({})
const configs = ref({})
const awardDicts = ref([])
const logs = ref([])
const logTotal = ref(0)

const healthStatus = computed(() => health.value?.status || 'unknown')
const configCount = computed(() => Object.keys(configs.value || {}).length)
const awardCount = computed(() => awardDicts.value.length)

const formatDateTime = (value) => {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleString('zh-CN', { hour12: false })
}

const fetchDashboard = async () => {
  try {
    const [healthRes, configRes, awardRes, logRes] = await Promise.all([
      systemService.getApiHealth(),
      systemService.getConfigs(),
      systemService.getAwardDicts(),
      systemService.getLogs({ page: 1, size: 10 }),
    ])

    health.value = healthRes?.data || {}
    configs.value = configRes?.data || {}
    awardDicts.value = Array.isArray(awardRes?.data) ? awardRes.data : []
    logs.value = Array.isArray(logRes?.data?.list) ? logRes.data.list : []
    logTotal.value = Number(logRes?.data?.total || 0)
  } catch (error) {
    ElMessage.error(error?.message || '获取管理员首页数据失败')
  }
}

onMounted(fetchDashboard)
</script>

<style scoped>
.metrics {
  margin-bottom: 12px;
}

.section-card {
  margin-top: 12px;
}
</style>
