<template>
  <div class="table-wrapper">
    <div class="table-toolbar">
      <div class="toolbar-left">
        <!-- 学生页暂时无左侧内容，预留给【计分】模块 -->
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right" />
      </div>
    </div>
    <el-table
      :data="applications"
      v-loading="loading"
      border
      stripe
      row-key="application_id"
    >
      <el-table-column prop="title" label="申报名称" min-width="220" show-overflow-tooltip />
      <el-table-column label="评审规则" min-width="360" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="rule-reference" :title="reviewRule(row)">
            {{ reviewRule(row) || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="分数" width="100" align="center">
        <template #default="{ row }">
          {{ row.score ?? '—' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="230" fixed="right" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="emit('view', row)">
            查看
          </el-button>
          <el-button
            size="small"
            type="primary"
            plain
            :disabled="!isEditable(row)"
            :loading="row._editLoading"
            @click="handleEdit(row)"
          >
            修改
          </el-button>
          <el-button size="small" type="danger" plain :disabled="!isEditable(row)" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ElMessageBox, ElMessage } from 'element-plus'
import { useApplicationStore } from '@/stores/application'
import applicationService from '@/services/applicationService'
import { computed } from 'vue'
import { APPLICATION_STATUS_META, APPLICATION_STATUSES } from '@/utils/constants'
import { formatAwardRuleByUid } from '@/utils/dealAwardUid'

const store = useApplicationStore()
const applications = computed(() => store.applications)
const loading = computed(() => store.loading)

const emit = defineEmits(['edit', 'view'])

// 状态可编辑：仅待AI评价/待审核
const editableStatuses = [
  APPLICATION_STATUSES.PENDING_AI,
  APPLICATION_STATUSES.AI_ABNORMAL,
  APPLICATION_STATUSES.PENDING_REVIEW,
]
function isEditable(row) {
  return editableStatuses.includes(row.status)
}

// 统一状态标签
function statusLabel(status) {
  const meta = APPLICATION_STATUS_META[status]
  return meta?.label || status || '-'
}
function statusTagType(status) {
  const meta = APPLICATION_STATUS_META[status]
  return meta?.tagType || 'info'
}

function reviewRule(row) {
  return row?.award_rule?.rule_name || row?.award_rule_name || formatAwardRuleByUid(row?.award_uid)
}

// 删除
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.title}」吗？此操作不可撤销。`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    console.log('Deleting application:', row)
    const result = await store.deleteApplication(row.application_id)
    if (result.success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(result.error ?? '删除失败')
    }
  } catch {
    // 用户取消
  }
}

// 编辑：先获取完整数据再 emit
async function handleEdit(row) {
  try {
    row._editLoading = true
    const res = await applicationService.getDetail(row.application_id)
    const detail = res.data ?? res
    // 保留 application_id 字段供后续更新使用
    detail.application_id = row.application_id
    emit('edit', detail)
  } catch {
    ElMessage.error('获取申报详情失败，请重试')
  } finally {
    row._editLoading = false
  }
}
</script>

<style scoped>
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

.rule-reference {
  display: block;
  overflow: hidden;
  color: #606266;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
