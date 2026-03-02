<template>
  <div class="teacher-all-applications-page">
    <div class="page-header">
      <h2>全部申报</h2>
      <div class="toolbar">
        <el-input
          v-model.trim="filters.keyword"
          placeholder="搜索申报名称"
          clearable
          style="width: 220px"
          @keyup.enter="fetchList(1)"
        />
        <el-select
          v-model="filters.status"
          placeholder="状态筛选"
          clearable
          style="width: 140px"
        >
          <el-option label="待审核" value="pending_review" />
          <el-option label="待教师复核" value="pending_teacher" />
          <el-option label="已通过" value="approved" />
          <el-option label="已驳回" value="rejected" />
          <el-option label="已归档" value="archived" />
        </el-select>
        <el-select
          v-model="filters.class_id"
          placeholder="班级"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="item in classOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        <el-button type="primary" @click="fetchList(1)">筛选</el-button>
        <el-button @click="resetFilters">重置</el-button>
        <el-button
          type="danger"
          :disabled="selectedRows.length === 0"
          @click="handleBatchArchive"
        >
          批量归档
        </el-button>
      </div>
    </div>

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
      <el-table-column prop="project" label="项目" width="180" show-overflow-tooltip />
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
            :disabled="row.status === 'archived'"
            @click="openRecheckDialog(row)"
          >
            审核申报
          </el-button>
          <el-button
            link
            type="danger"
            :disabled="row.status === 'archived'"
            @click="archiveSingle(row)"
          >
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

    <el-dialog
      v-model="recheckDialogVisible"
      title="审核申报"
      width="560px"
      @closed="resetDialogState"
    >
      <div class="audit-dialog-body">
        <div class="audit-field">
          <div class="audit-label">申报名称</div>
          <div class="audit-value">{{ currentRow?.title || '-' }}</div>
        </div>
        <div class="audit-field">
          <div class="audit-label">项目</div>
          <div class="audit-value">{{ currentRow?.project || '-' }}</div>
        </div>
        <div class="audit-field">
          <div class="audit-label">证明材料</div>
          <div class="audit-value audit-value--multiline">
            <template v-if="attachmentList.length">
              <a
                v-for="(item, index) in attachmentList"
                :key="item.file_id || item.url || index"
                :href="getAttachmentUrl(item)"
                class="attachment-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ getAttachmentName(item, index) }}
              </a>
            </template>
            <span v-else class="audit-empty">无</span>
          </div>
        </div>
        <div class="audit-field">
          <div class="audit-label">AI 自动检测结果</div>
          <div class="audit-value">{{ resolveAiResult(currentRow) }}</div>
        </div>
        <div class="audit-field">
          <div class="audit-label">评价</div>
          <el-input
            v-model.trim="recheckForm.comment"
            maxlength="300"
            placeholder="默认空"
            show-word-limit
          />
        </div>
      </div>
      <template #footer>
        <div class="audit-footer">
          <el-button
            type="danger"
            :loading="rechecking"
            @click="submitRecheck('approved')"
          >
            通过
          </el-button>
          <el-button
            type="danger"
            plain
            :loading="rechecking"
            @click="submitRecheck('rejected')"
          >
            拒绝
          </el-button>
          <el-button
            link
            type="danger"
            :disabled="rechecking"
            @click="recheckDialogVisible = false"
          >
            返回
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import fileService from '@/services/fileService'
import statisticService from '@/services/statisticService'

const loading = ref(false)
const rechecking = ref(false)
const rows = ref([])
const selectedRows = ref([])
const classOptions = ref([])

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

const recheckDialogVisible = ref(false)
const currentRow = ref(null)
const recheckForm = reactive({
  comment: '',
})

const attachmentList = computed(() => {
  const source = currentRow.value?.attachments
  return Array.isArray(source) ? source : []
})

const statusText = (status) => {
  const map = {
    pending_ai: '待 AI 审核',
    pending_review: '待审核',
    pending_teacher: '待教师复核',
    approved: '已通过',
    rejected: '已驳回',
    archived: '已归档',
    withdrawn: '已撤回',
  }
  return map[status] || status || '-'
}

const statusTagType = (status) => {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  if (status === 'archived') return 'info'
  return 'warning'
}

const resolveAiResult = (row) => {
  if (!row) return '-'
  if (row.ai_result) return row.ai_result
  if (row.status === 'pending_ai') return '待检测'
  return '未见异常'
}

const getAttachmentUrl = (item) => {
  if (!item) return '#'
  if (item.url) return item.url
  if (item.file_id) return fileService.getFileUrl(item.file_id)
  return '#'
}

const getAttachmentName = (item, index) => {
  if (!item) return `附件${index + 1}`
  return item.name || item.filename || item.file_id || `附件${index + 1}`
}

const resetDialogState = () => {
  currentRow.value = null
  recheckForm.comment = ''
}

const loadClassOptions = async () => {
  try {
    const res = await statisticService.getClassStatistics()
    const list = Array.isArray(res?.data?.list) ? res.data.list : []
    classOptions.value = list
      .map((item) => item.class_id)
      .filter(Boolean)
      .sort((a, b) => a - b)
  } catch {
    classOptions.value = []
  }
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

const onSelectionChange = (selection) => {
  selectedRows.value = selection
}

const openRecheckDialog = (row) => {
  currentRow.value = row
  recheckForm.comment = row.comment || ''
  recheckDialogVisible.value = true
}

const submitRecheck = async (decision) => {
  if (!currentRow.value?.application_id) return
  rechecking.value = true
  try {
    await statisticService.recheckApplication(currentRow.value.application_id, {
      decision,
      comment: recheckForm.comment || null,
    })
    ElMessage.success('审核成功')
    recheckDialogVisible.value = false
    await fetchList()
  } catch (error) {
    ElMessage.error(error?.message || '审核失败')
  } finally {
    rechecking.value = false
  }
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
  await Promise.all([loadClassOptions(), fetchList(1)])
})
</script>

<style scoped>
.teacher-all-applications-page {
  padding: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.audit-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 6px;
}

.audit-field {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  align-items: start;
  column-gap: 12px;
}

.audit-label {
  line-height: 32px;
  color: #303133;
}

.audit-value {
  min-height: 32px;
  padding: 6px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  line-height: 20px;
  color: #303133;
  background: #fff;
  box-sizing: border-box;
}

.audit-value--multiline {
  min-height: 84px;
  max-height: 160px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.audit-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
</style>
