<template>
  <div class="appeal-process-page">
    <div class="page-header">
      <h2>申诉列表</h2>
      <div class="header-actions">
        <el-select
          v-model="statusFilter"
          placeholder="状态筛选"
          clearable
          style="width: 160px"
          @change="handleStatusChange"
        >
          <el-option label="待处理" value="pending" />
          <el-option label="已处理" value="processed" />
        </el-select>
        <el-button @click="refreshList">刷新</el-button>
        <el-button @click="exportList">导出</el-button>
      </div>
    </div>

    <el-table
      :data="store.list"
      border
      stripe
      v-loading="store.loading"
      empty-text="暂无申诉记录"
    >
      <el-table-column prop="student_name" label="学生" width="120" />
      <el-table-column prop="content" label="申诉内容" min-width="420" show-overflow-tooltip />
      <el-table-column label="证明材料" width="120">
        <template #default="{ row }">
          <span v-if="!normalizeAttachments(row).length">无</span>
          <el-button v-else link type="primary" @click="openProcess(row)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row)" size="small">{{ getStatusText(row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button
            v-if="row.status !== 'processed'"
            link
            type="primary"
            @click="openProcess(row)"
          >
            处理申诉
          </el-button>
          <el-button v-else link type="info" @click="openProcess(row)">查看结果</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="store.total"
        :page-size="store.query.size"
        :current-page="store.query.page"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog v-model="processDialogVisible" title="处理申诉" width="760px">
      <div v-if="selectedAppeal" class="dialog-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="学生">
            {{ selectedAppeal.student_name || `学生${selectedAppeal.student_id || ''}` }}
          </el-descriptions-item>
          <el-descriptions-item label="申诉内容">
            {{ selectedAppeal.content || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="证明材料">
            <div class="attachment-wrap">
              <span v-if="!normalizeAttachments(selectedAppeal).length">无</span>
              <a
                v-for="(item, index) in normalizeAttachments(selectedAppeal)"
                :key="item.file_id || item.url || index"
                :href="getAttachmentUrl(item)"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ getAttachmentName(item, index) }}
              </a>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <el-form class="process-form" label-width="90px">
          <el-form-item label="评价">
            <el-input
              v-model.trim="processForm.result_comment"
              type="textarea"
              :rows="3"
              maxlength="500"
              show-word-limit
              placeholder="可填写处理说明"
            />
          </el-form-item>

          <el-form-item label="邮件">
            <div class="mail-config">
              <div class="mail-config-row">
                <el-switch v-model="processForm.sendEmail" />
                <span class="mail-tip">发邮件时带上评价</span>
              </div>
              <el-input
                v-if="processForm.sendEmail"
                v-model.trim="processForm.emailTo"
                placeholder="学生邮箱地址"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="closeProcessDialog">返回</el-button>
        <el-button
          type="success"
          :loading="store.processing"
          :disabled="selectedAppeal?.status === 'processed'"
          @click="submitDecision('approved')"
        >
          通过
        </el-button>
        <el-button
          type="danger"
          :loading="store.processing"
          :disabled="selectedAppeal?.status === 'processed'"
          @click="submitDecision('rejected')"
        >
          拒绝
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppealStore } from '@/stores/appeal'
import fileService from '@/services/fileService'

const store = useAppealStore()
const statusFilter = ref('')
const processDialogVisible = ref(false)
const selectedAppeal = ref(null)

const processForm = reactive({
  result_comment: '',
  sendEmail: false,
  emailTo: '',
})

const getStatusText = (row) => {
  if (!row) return '-'
  if (row.status === 'pending') return '待处理'
  if (row.status === 'processed') {
    if (row.result === 'approved' || row.result === 'accepted') return '已通过'
    if (row.result === 'rejected') return '已驳回'
    return '已处理'
  }
  return row.status || '-'
}

const getStatusTagType = (row) => {
  if (!row) return 'info'
  if (row.status === 'pending') return 'warning'
  if (row.status === 'processed') {
    if (row.result === 'approved' || row.result === 'accepted') return 'success'
    if (row.result === 'rejected') return 'danger'
    return 'info'
  }
  return 'info'
}

const normalizeAttachments = (row) => {
  const source = row?.attachments
  if (!Array.isArray(source)) return []
  return source
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

const resolveStudentEmail = (row) => {
  if (!row) return ''
  if (row.student_email) return row.student_email
  if (row.email) return row.email
  if (row.student_id) return `student${row.student_id}@example.com`
  return ''
}

const openProcess = (row) => {
  selectedAppeal.value = row
  processForm.result_comment = row?.result_comment || ''
  processForm.sendEmail = false
  processForm.emailTo = resolveStudentEmail(row)
  processDialogVisible.value = true
}

const closeProcessDialog = () => {
  processDialogVisible.value = false
  selectedAppeal.value = null
}

const submitDecision = async (result) => {
  if (!selectedAppeal.value) return

  if (processForm.sendEmail && !processForm.emailTo) {
    ElMessage.warning('请填写邮件接收地址')
    return
  }

  const response = await store.processAppeal(
    selectedAppeal.value.id,
    {
      result,
      result_comment: processForm.result_comment || null,
    },
    {
      sendEmail: processForm.sendEmail,
      to: processForm.emailTo,
    }
  )

  if (!response.success) {
    ElMessage.error(response.error || '处理申诉失败')
    return
  }

  ElMessage.success(result === 'approved' ? '申诉已通过' : '申诉已驳回')
  closeProcessDialog()
}

const handlePageChange = (nextPage) => {
  store.fetchAppeals({ page: nextPage })
}

const handleStatusChange = () => {
  store.fetchAppeals({
    status: statusFilter.value || '',
    page: 1,
  })
}

const refreshList = () => {
  store.fetchAppeals()
}

const csvEscape = (value) => {
  const text = String(value ?? '')
  const escaped = text.replace(/"/g, '""')
  return `"${escaped}"`
}

const exportList = () => {
  const headers = ['ID', '学生', '申诉内容', '状态', '处理结果', '处理备注', '创建时间', '处理时间']
  const rows = store.list.map((item) => [
    item.id,
    item.student_name || `学生${item.student_id || ''}`,
    item.content || '',
    getStatusText(item),
    item.result || '',
    item.result_comment || '',
    item.created_at || '',
    item.processed_at || '',
  ])
  const csvText = [headers, ...rows]
    .map((row) => row.map((cell) => csvEscape(cell)).join(','))
    .join('\n')
  const blob = new Blob(['\ufeff' + csvText], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `appeals-${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  store.fetchAppeals()
})
</script>

<style scoped>
.appeal-process-page {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.attachment-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.attachment-wrap a {
  color: #409eff;
  text-decoration: none;
}

.attachment-wrap a:hover {
  text-decoration: underline;
}

.process-form {
  margin-top: 8px;
}

.mail-config {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mail-config-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mail-tip {
  color: #606266;
}
</style>
