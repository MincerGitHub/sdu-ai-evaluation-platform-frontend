<template>
  <div class="page-container">
    <header class="page-header">
      <h2>学生首页</h2>
    </header>

    <div class="dashboard-headline">
      <p class="welcome">欢迎回来，{{ user?.name || '同学' }}！</p>
      <el-button class="btn-main" @click="openAutoFill">AI 自动填报</el-button>
    </div>

    <el-row :gutter="12" class="metrics">
      <el-col :xs="12" :sm="6">
        <el-card>申报总数：{{ totalCount }}</el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>待处理：{{ pendingCount }}</el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>已通过：{{ approvedCount }}</el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>官方总分：{{ totalScore }}</el-card>
      </el-col>
    </el-row>

    <ScoreBoard :score-summary="scoreSummary" />
    <AIAutoFillDialog ref="autoFillDialogRef" @success="handleAutoFillSuccess" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import applicationService from '@/services/applicationService'
import ScoreBoard from '@/components/score/ScoreBoard.vue'
import AIAutoFillDialog from '@/components/application/AIAutoFillDialog.vue'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const router = useRouter()

const totalCount = ref(0)
const pendingCount = ref(0)
const approvedCount = ref(0)
const totalScore = ref(0)
const summaryData = ref({})
const autoFillDialogRef = ref(null)

const scoreSummary = computed(() => summaryData.value?.score_summary || null)

const fetchSummary = async () => {
  try {
    const res = await applicationService.getCategorySummary()
    const data = res?.data || {}
    summaryData.value = data
    const categories = Array.isArray(data.categories) ? data.categories : []
    totalCount.value = categories.reduce((sum, item) => sum + Number(item?.count || 0), 0)
    pendingCount.value = categories.reduce((sum, item) => sum + Number(item?.pending || 0), 0)
    approvedCount.value = categories.reduce((sum, item) => sum + Number(item?.approved || 0), 0)
    totalScore.value = Number(data.actual_score ?? data.total_score ?? 0)
  } catch (error) {
    ElMessage.error(error?.message || '获取统计概览失败')
  }
}

onMounted(fetchSummary)

function openAutoFill() {
  autoFillDialogRef.value?.open()
}

async function handleAutoFillSuccess(data) {
  await fetchSummary()
  if (data?.category && data?.sub_type) {
    router.push({ name: 'StudentApplication', params: { category: data.category, subType: data.sub_type } })
  }
}
</script>

<style scoped>
.dashboard-headline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.welcome {
  margin: 0;
  color: #303133;
}

.metrics :deep(.el-card__body) {
  padding: 14px;
  font-size: 14px;
}
</style>
