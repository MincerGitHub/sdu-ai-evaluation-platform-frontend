<template>
  <div class="review-table table-wrapper">
    <!-- 工具栏：左侧待审核数量，右侧批量操作按钮 -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <span class="pending-count">待审核：{{ pendingCount }} 条</span>
      </div>
      <div class="toolbar-right">
        <el-button
          type="success"
          :disabled="selectedRows.length === 0"
          @click="emit('batch-approve', selectedRows)"
        >
          批量通过
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedRows.length === 0"
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
      <el-table-column type="selection" width="50" />
      <!-- 申报名称 -->
      <el-table-column label="申报名称" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.title }}
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
          <el-button link type="success" size="small" @click="emit('approve', row)">
            通过
          </el-button>
          <el-button link type="danger" size="small" @click="emit('reject', row)">
            驳回
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useReviewStore } from '@/stores/review'
import { APPLICATION_STATUS_META } from '@/utils/constants'

const store = useReviewStore()
defineProps({
  pendingCount: {
    type: Number,
    default: 0,
  },
})
const emit = defineEmits(['view', 'approve', 'reject', 'batch-approve', 'batch-reject'])

const selectedRows = ref([])

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
</style>
