<template>
  <div class="page-container">
    <header class="page-header">
      <h2>教师首页</h2>
    </header>

    <p class="welcome">欢迎，{{ user?.name || '老师' }}</p>

    <el-row :gutter="12" class="metrics">
      <el-col :xs="12" :sm="4">
        <el-card>申报总数：{{ statistics.total_count || 0 }}</el-card>
      </el-col>
      <el-col :xs="12" :sm="4">
        <el-card>待人工审核：{{ pendingReviewCount }}</el-card>
      </el-col>
      <el-col :xs="12" :sm="4">
        <el-card>已通过：{{ statistics.status_summary?.approved || 0 }}</el-card>
      </el-col>
      <el-col :xs="12" :sm="4">
        <el-card>已驳回：{{ statistics.status_summary?.rejected || 0 }}</el-card>
      </el-col>
      <el-col :xs="12" :sm="4">
        <el-card>总分：{{ statistics.total_score || 0 }}</el-card>
      </el-col>
    </el-row>

    <el-card class="ai-card">
      <template #header>AI 审核概览（最近 50 条）</template>
      <div class="ai-list">
        <span>通过：{{ aiSummary.pass }}</span>
        <span>异常：{{ aiSummary.abnormal }}</span>
        <span>处理中：{{ aiSummary.processing }}</span>
        <span>失败：{{ aiSummary.failed }}</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import teacherService from '@/services/teacherService'
import aiAuditService from '@/services/aiAuditService'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const statistics = reactive({
  total_count: 0,
  status_summary: {},
  total_score: 0,
})

const aiSummary = reactive({
  pass: 0,
  abnormal: 0,
  processing: 0,
  failed: 0,
})

const pendingReviewCount = computed(
  () => Number(statistics.status_summary?.pending_review || 0) + Number(statistics.status_summary?.ai_abnormal || 0)
)

const fetchData = async () => {
  try {
    const [statisticsRes, logsRes] = await Promise.all([
      teacherService.getStatistics(),
      aiAuditService.getLogs({ page: 1, size: 50 }),
    ])

    const statisticsData = statisticsRes?.data || {}
    statistics.total_count = Number(statisticsData.total_count || 0)
    statistics.status_summary = statisticsData.status_summary || {}
    statistics.total_score = Number(statisticsData.total_score || 0)

    aiSummary.pass = 0
    aiSummary.abnormal = 0
    aiSummary.processing = 0
    aiSummary.failed = 0

    const logs = Array.isArray(logsRes?.data?.list) ? logsRes.data.list : []
    logs.forEach((item) => {
      if (item?.result === 'pass') aiSummary.pass += 1
      else if (item?.result === 'abnormal') aiSummary.abnormal += 1
      else if (item?.status === 'failed' || item?.error_message) aiSummary.failed += 1
      else aiSummary.processing += 1
    })
  } catch (error) {
    ElMessage.error(error?.message || '获取教师首页数据失败')
  }
}

onMounted(fetchData)
</script>

<style scoped>
.welcome {
  margin: 0 0 12px;
  color: #303133;
}

.metrics {
  margin-bottom: 12px;
}

.ai-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #606266;
}
</style>
