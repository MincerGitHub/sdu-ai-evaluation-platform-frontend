<template>
  <div class="review-table table-wrapper">
    <!-- 工具栏：左侧待审核数量，右侧批量操作按钮 -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <span class="pending-count">{{ countLabel }}：{{ pendingCount }} 条</span>
      </div>
      <div class="toolbar-right">
        <el-button
          type="success"
          :disabled="!canBatchApprove"
          @click="emit('batch-approve', selectedRows)"
        >
          批量通过
        </el-button>
        <el-button
          type="danger"
          :disabled="!canBatchReject"
          @click="emit('batch-reject', selectedRows)"
        >
          批量驳回
        </el-button>
      </div>
    </div>

    <el-table
      :data="store.pendingList"
      v-loading="store.loading"
      border
      stripe
      @selection-change="onSelectionChange"
    >
      <!-- 多选列保留 -->
      <el-table-column type="selection" width="50" :selectable="canSelect" />
      <el-table-column label="申报名称" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.title }}
        </template>
      </el-table-column>
      <el-table-column label="学生姓名" width="140" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.student_name || row.student?.name || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="评审规则" min-width="360" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="rule-reference" :title="referenceRule(row)">
            {{ referenceRule(row) || '-' }}
          </span>
        </template>
      </el-table-column>
      <!-- 状态，与 ApplicationTable 一致的样式 -->
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 分数 -->
      <el-table-column prop="score" label="分数" width="100" align="center">
        <template #default="{ row }">
          {{ row.score ?? '—' }}
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column label="操作" width="220" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="emit('view', row)">
            查看
          </el-button>
          <el-button link type="success" size="small" :disabled="!canApprove(row)" @click="emit('approve', row)">
            通过
          </el-button>
          <el-button link type="danger" size="small" :disabled="!canReject(row)" @click="emit('reject', row)">
            驳回
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useReviewStore } from '@/stores/review'
import { APPLICATION_STATUS_META } from '@/utils/constants'
import { formatAwardRuleByUid } from '@/utils/dealAwardUid'

const store = useReviewStore()
defineProps({
  pendingCount: {
    type: Number,
    default: 0,
  },
  countLabel: {
    type: String,
    default: '待审核',
  },
})
const emit = defineEmits(['view', 'approve', 'reject', 'batch-approve', 'batch-reject'])

const selectedRows = ref([])
const canBatchApprove = computed(() => selectedRows.value.length > 0 && selectedRows.value.every(canApprove))
const canBatchReject = computed(() => selectedRows.value.length > 0 && selectedRows.value.every(canReject))

function onSelectionChange(rows) {
  selectedRows.value = rows
}

// 统一使用 APPLICATION_STATUS_META
function statusTagType(status) {
  const meta = APPLICATION_STATUS_META[status]
  return meta?.tagType || 'info'
}

function statusLabel(status) {
  const meta = APPLICATION_STATUS_META[status]
  return meta?.label || status || '-'
}

function referenceRule(row) {
  return row?.award_rule?.rule_name || row?.award_rule_name || formatAwardRuleByUid(row?.award_uid)
}

function canApprove(row) {
  return ['pending_review', 'ai_abnormal', 'approved', 'rejected'].includes(row?.status)
}

function canReject(row) {
  return ['pending_review', 'ai_abnormal', 'approved', 'rejected', 'archived'].includes(row?.status)
}

function canSelect(row) {
  return canApprove(row) || canReject(row)
}
</script>

<style scoped>
.review-table {
  width: 100%;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pending-count {
  font-size: 14px;
  color: #606266;
}

.rule-reference {
  display: block;
  overflow: hidden;
  color: #606266;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
