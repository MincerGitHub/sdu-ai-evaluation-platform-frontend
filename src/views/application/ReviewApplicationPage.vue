<template>
  <div class="review-page page-container">
    <header class="page-header">
      <h2>{{ pageTitle }}</h2>
    </header>
    <div v-if="isManageReviewPage" class="review-filter-bar">
      <div class="filter-left">
        <span class="filter-label">状态筛选</span>
        <el-segmented v-model="statusFilter" :options="statusOptions" />
      </div>
    </div>
    <ReviewTable
      :pending-count="pendingCount"
      :count-label="isManageReviewPage ? '记录' : '待审核'"
      @view="handleView"
      @approve="handleApprove"
      @reject="handleReject"
      @batch-approve="handleBatchApprove"
      @batch-reject="handleBatchReject"
    />
    <ReviewDetailDialog ref="detailDialogRef" @submitted="store.fetchPendingCount()" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useReviewStore } from '@/stores/review'
import { useAuthStore } from '@/stores/auth'
import ReviewTable from '@/components/review/ReviewTable.vue'
import ReviewDetailDialog from '@/components/review/ReviewDetailDialog.vue'

// ---------- 路由参数 ----------
const route = useRoute()
const category = computed(() => route.params.category)
const subType = computed(() => route.params.subType)

// ---------- 页面标题映射 ----------
const TITLE_MAP = {
    physical_mental: {
        basic: '身心素养 · 基础性评价 · 审核',
        achievement: '身心素养 · 成果性评价 · 审核',
    },
    art: {
        basic: '文艺素养 · 基础性评价 · 审核',
        achievement: '文艺素养 · 成果性评价 · 审核',
    },
    labor: {
        basic: '劳动素养 · 基础性评价 · 审核',
        achievement: '劳动素养 · 成果性评价 · 审核',
    },
    innovation: {
        basic: '创新素养 · 基础素养 · 审核',
        achievement: '创新素养 · 突破提升 · 审核',
    },
}

const authStore = useAuthStore()
const store = useReviewStore()
const statusFilter = ref('')
const isManageReviewPage = computed(() => {
    return authStore.isTeacher || authStore.isAdmin || route.path.startsWith('/teacher') || route.path.startsWith('/admin')
})
const statusOptions = [
    { label: '全部', value: '' },
    { label: '待AI', value: 'pending_ai' },
    { label: 'AI异常', value: 'ai_abnormal' },
    { label: '待人工', value: 'pending_review' },
    { label: '已通过', value: 'approved' },
    { label: '已驳回', value: 'rejected' },
    { label: '已归档', value: 'archived' },
]

const pageTitle = computed(() => {
    const base = TITLE_MAP[category.value]?.[subType.value] ?? '审核'
    const roleLabel = isManageReviewPage.value ? '（教师复核）' : '（审核员）'
    return base + roleLabel
})

// 待审核数量（使用 store 中的统计字段或列表长度，可以按你的 store 实现调整）
const pendingCount = computed(() => store.pendingCount ?? store.pendingList.length)

// ---------- 弹窗 Ref ----------
const detailDialogRef = ref(null)

// ---------- 事件处理 ----------
function handleView(row) {
    detailDialogRef.value?.open(row.application_id)
}

async function handleApprove(row) {
    try {
        await ElMessageBox.confirm(`确认通过「${row.student_name}」的申报？`, '确认通过', {
            confirmButtonText: '通过',
            cancelButtonText: '取消',
            type: 'success',
        })
        const result = await store.submitDecision(row.application_id, { decision: 'approved' })
        if (result.success) {
            ElMessage.success('审核通过')
        } else {
            ElMessage.error(result.error || '操作失败')
        }
    } catch { /* 用户取消 */ }
}

async function handleReject(row) {
    try {
        const { value: comment } = await ElMessageBox.prompt(
            `确认驳回「${row.student_name}」的申报？`,
            '驳回申报',
            {
                confirmButtonText: '驳回',
                cancelButtonText: '取消',
                type: 'warning',
                inputType: 'textarea',
                inputPlaceholder: '审核意见（选填）',
            }
        )
        const result = await store.submitDecision(row.application_id, {
            decision: 'rejected',
            comment: comment || null,
        })
        if (result.success) {
            ElMessage.success('已驳回')
        } else {
            ElMessage.error(result.error || '操作失败')
        }
    } catch { /* 用户取消 */ }
}

async function handleBatchApprove(rows) {
    const ids = rows.map((r) => r.application_id)
    try {
        await ElMessageBox.confirm(`确认批量通过 ${ids.length} 条申报？`, '批量通过', {
            confirmButtonText: '全部通过',
            cancelButtonText: '取消',
            type: 'success',
        })
        const result = await store.batchDecision({
            application_ids: ids,
            decision: 'approved',
        })
        if (result.success) {
            ElMessage.success(`批量通过 ${result.data?.success_count ?? ids.length} 条`)
        } else {
            ElMessage.error(result.error || '批量操作失败')
        }
    } catch { /* 用户取消 */ }
}

async function handleBatchReject(rows) {
    const ids = rows.map((r) => r.application_id)
    try {
        const { value: comment } = await ElMessageBox.prompt(
            `确认批量驳回 ${ids.length} 条申报？`,
            '批量驳回',
            {
                confirmButtonText: '全部驳回',
                cancelButtonText: '取消',
                type: 'warning',
                inputType: 'textarea',
                inputPlaceholder: '审核意见（选填）',
            }
        )
        const result = await store.batchDecision({
            application_ids: ids,
            decision: 'rejected',
            comment: comment || null,
        })
        if (result.success) {
            ElMessage.success(`批量驳回 ${result.data?.success_count ?? ids.length} 条`)
        } else {
            ElMessage.error(result.error || '批量操作失败')
        }
    } catch { /* 用户取消 */ }
}

// ---------- 初始化与路由监听 ----------
function initPage() {
    store.setCategory(category.value, subType.value)
    store.setStatus(statusFilter.value)
    store.fetchPendingByCategory()
    store.fetchPendingCount()
}

onMounted(initPage)
watch([category, subType, statusFilter], initPage)
</script>

<style scoped>
.review-filter-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 10px 0 14px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-label {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
}
</style>
