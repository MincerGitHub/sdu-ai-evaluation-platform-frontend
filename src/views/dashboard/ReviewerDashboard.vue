<template>
  <div class="page-container">
    <header class="page-header">
      <h2>审核员首页</h2>
    </header>

    <p class="welcome">欢迎回来，{{ user?.name || '同学' }}！</p>

    <el-row :gutter="12">
      <el-col :xs="24" :sm="8">
        <el-card>待审核总数：{{ pendingCount }}</el-card>
      </el-col>
      <el-col :xs="24" :sm="16">
        <el-card>
          <div class="title">分类待审核</div>
          <div v-if="!categorySummary.length" class="empty">暂无数据</div>
          <div v-else class="summary-list">
            <span v-for="item in categorySummary" :key="`${item.category}-${item.category_name}`">
              {{ item.category_name || item.category }}：{{ item.pending_count || 0 }}
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="history-card">
      <template #header>最近审核历史（5条）</template>
      <el-table :data="historyRows" size="small" border stripe empty-text="暂无审核历史">
        <el-table-column prop="title" label="申报名称" min-width="240" show-overflow-tooltip />
        <el-table-column prop="result" label="结果" width="120" />
        <el-table-column label="时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.reviewed_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import reviewService from '@/services/reviewService'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const pendingCount = ref(0)
const categorySummary = ref([])
const historyRows = ref([])

const formatDateTime = (value) => {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleString('zh-CN', { hour12: false })
}

const fetchSummary = async () => {
  try {
    const [countRes, summaryRes, historyRes] = await Promise.all([
      reviewService.getPendingCount(),
      reviewService.getCategorySummary(),
      reviewService.getHistory({ page: 1, size: 5 }),
    ])
    pendingCount.value = Number(countRes?.data?.pending_count || 0)
    categorySummary.value = Array.isArray(summaryRes?.data?.categories) ? summaryRes.data.categories : []
    historyRows.value = Array.isArray(historyRes?.data?.list) ? historyRes.data.list : []
  } catch (error) {
    ElMessage.error(error?.message || '获取审核概览失败')
  }
}

onMounted(fetchSummary)
</script>

<style scoped>
.welcome {
  margin: 0 0 12px;
  color: #303133;
}

.title {
  margin-bottom: 8px;
  color: #606266;
}

.summary-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.empty {
  color: #909399;
}

.history-card {
  margin-top: 12px;
}
</style>
