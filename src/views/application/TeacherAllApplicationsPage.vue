<template>
  <div class="teacher-all-applications-page page-container">
    <header class="page-header">
      <h2>全部申报</h2>
    </header>

    <div class="table-toolbar">
      <div class="toolbar-left">
        <!-- 待教师复核统计等 -->
      </div>
      <div class="toolbar-right">
        <el-button
          class="btn-danger"
          type="danger"
          :disabled="selectedRows.length === 0"
          @click="handleBatchArchive"
        >
          批量归档
        </el-button>
        <el-button class="btn-plain" @click="resetFilters">重置</el-button>
        <el-button class="btn-main" @click="fetchList(1)">筛选</el-button>
        <el-select v-model="filters.class_id" placeholder="班级" clearable style="width: 160px">
          <el-option
            v-for="item in classOptions"
            :key="item.class_id"
            :label="item.label"
            :value="item.class_id"
          />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态筛选" clearable style="width: 160px">
          <el-option label="待AI评价" value="pending_ai" />
          <el-option label="AI异常" value="ai_abnormal" />
          <el-option label="待审核" value="pending_review" />
          <el-option label="已通过" value="approved" />
          <el-option label="已驳回" value="rejected" />
          <el-option label="已归档" value="archived" />
        </el-select>
        <el-input
          v-model.trim="filters.keyword"
          placeholder="搜索申报名称"
          clearable
          style="width: 220px"
          @keyup.enter="fetchList(1)"
        />
      </div>
    </div>

    <div class="table-block">
      <el-table
        :data="rows"
        border
        stripe
        v-loading="loading"
        empty-text="暂无申报数据"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="class_id" label="班级" width="100" />
        <el-table-column prop="student_account" label="学号" width="140" />
        <el-table-column prop="title" label="申报名称" min-width="220" show-overflow-tooltip />
        <el-table-column prop="student_name" label="学生姓名" width="140" show-overflow-tooltip />
        <el-table-column label="评审规则" min-width="360" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="rule-reference" :title="reviewRule(row)">
              {{ reviewRule(row) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="130">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="openReviewDetail(row)"
            >
              审核申报
            </el-button>
            <el-button link type="danger" :disabled="row.status === 'archived'" @click="archiveSingle(row)">
              归档
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="prev, pager, next, total"
          :current-page="pagination.page"
          :page-size="pagination.size"
          :total="pagination.total"
          @current-change="fetchList"
        />
      </div>
    </div>

    <ReviewDetailDialog
      ref="reviewDetailDialogRef"
      :on-fetch-detail="fetchDetailForTeacher"
      :on-submit-decision="submitTeacherDecision"
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import applicationService from '@/services/applicationService'
import statisticService from '@/services/statisticService'
import classService from '@/services/classService'
import { APPLICATION_STATUS_META } from '@/utils/constants'
import ReviewDetailDialog from '@/components/review/ReviewDetailDialog.vue'
import { CLASSMAP } from '@/utils/classMap'
import { formatAwardRuleByUid } from '@/utils/dealAwardUid'

const loading = ref(false)
const rows = ref([])
const selectedRows = ref([])
const classOptions = ref(CLASSMAP)

const filters = reactive({
  keyword: '',
  status: '',
  class_id: '',
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

const reviewDetailDialogRef = ref(null)

const statusText = (status) => {
  const meta = APPLICATION_STATUS_META[status]
  return meta?.label || status || '-'
}

const statusTagType = (status) => {
  const meta = APPLICATION_STATUS_META[status]
  return meta?.tagType || 'info'
}

const fetchList = async (page = pagination.page) => {
  loading.value = true
  pagination.page = page
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
    }
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.status) params.status = filters.status
    if (filters.class_id) params.class_id = filters.class_id

    const res = await statisticService.getAllApplications(params)
    const data = res?.data || {}
    rows.value = Array.isArray(data.list) ? data.list : []
    pagination.total = Number(data.total || 0)
    pagination.page = Number(data.page || pagination.page)
    pagination.size = Number(data.size || pagination.size)
  } catch (error) {
    ElMessage.error(error?.message || '获取全部申报失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = async () => {
  filters.keyword = ''
  filters.status = ''
  filters.class_id = ''
  await fetchList(1)
}

const loadClasses = async () => {
  try {
    const rows = await classService.getClasses()
    if (rows.length) classOptions.value = rows
  } catch {
    classOptions.value = CLASSMAP
  }
}

const reviewRule = (row) => {
  return row?.award_rule?.rule_name || row?.award_rule_name || formatAwardRuleByUid(row?.award_uid) || row?.project
}

const onSelectionChange = (selection) => {
  selectedRows.value = selection
}

const openReviewDetail = (row) => {
  if (!row?.application_id) return
  reviewDetailDialogRef.value?.open(row.application_id, row)
}

const fetchDetailForTeacher = async (applicationId, row) => {
  const res = await applicationService.getDetail(applicationId)
  const detail = res?.data || {}
  return {
    success: true,
    data: {
      ...detail,
      student: detail.student || {
        id: row?.student_id || null,
        name: row?.student_name || '',
        account: row?.student_account || '',
        class_id: row?.class_id || null,
        email: row?.student_email || '',
      },
    },
  }
}

const submitTeacherDecision = async (applicationId, payload, detail) => {
  const res = await statisticService.recheckApplication(applicationId, {
    ...payload,
    score: detail?.score ?? undefined,
  })
  await fetchList()
  return { success: true, data: res?.data || {} }
}

const archiveIds = async (ids) => {
  await statisticService.archiveApplications({ application_ids: ids })
  ElMessage.success('归档成功')
  selectedRows.value = []
  await fetchList()
}

const archiveSingle = async (row) => {
  try {
    await ElMessageBox.confirm(`确认归档「${row.title}」？`, '归档确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await archiveIds([row.application_id])
  } catch {
    // 用户取消
  }
}

const handleBatchArchive = async () => {
  const ids = selectedRows.value.map((item) => item.application_id)
  if (!ids.length) return
  try {
    await ElMessageBox.confirm(`确认批量归档 ${ids.length} 条申报？`, '批量归档', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await archiveIds(ids)
  } catch {
    // 用户取消
  }
}

onMounted(async () => {
  await loadClasses()
  await fetchList(1)
})
</script>

<style scoped>
.teacher-all-applications-page {
  width: 100%;
  box-sizing: border-box;
}

/* 对话框样式保留 */
.dialog-descriptions {
  margin-bottom: 4px;
}

.dialog-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dialog-form-block {
  margin-top: 8px;
}

.audit-attachments {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attachment-link {
  color: #409eff;
  text-decoration: none;
}

.attachment-link:hover {
  text-decoration: underline;
}

.audit-empty {
  color: #909399;
}

.rule-reference {
  display: block;
  overflow: hidden;
  color: #606266;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
