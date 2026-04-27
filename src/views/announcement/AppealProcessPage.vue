<template>
  <div class="page-container appeal-process-page">
    <header class="page-header">
      <h2>申诉列表</h2>
    </header>

    <div class="table-toolbar">
      <div class="toolbar-left">
        <!-- 待处理统计等 -->
      </div>
      <div class="toolbar-right">
        <el-button class="btn-main" @click="exportList">导出</el-button>
        <el-button class="btn-plain" @click="refreshList">刷新</el-button>
        <el-input
          v-model.trim="studentNameFilter"
          placeholder="按学生姓名/学号搜索"
          clearable
          style="width: 220px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button class="btn-plain" @click="handleSearch">搜索</el-button>
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
      </div>
    </div>

    <div class="table-block">
      <el-table
        :data="store.list"
        border
        stripe
        v-loading="store.loading"
        empty-text="暂无申诉记录"
      >
        <el-table-column prop="student_name" label="学生" width="120" />
        <el-table-column prop="content" label="申诉内容" min-width="420" show-overflow-tooltip />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row)" size="small">{{ getStatusText(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210">
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
            <el-button
              link
              type="danger"
              :disabled="row.status !== 'pending'"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="store.total"
          :page-size="store.query.size"
          :current-page="store.query.page"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <el-dialog v-model="processDialogVisible" title="处理申诉" width="760px">
      <div v-if="selectedAppeal" class="dialog-section">
        <el-descriptions :column="1" border class="dialog-descriptions">
          <el-descriptions-item label="学生">
            {{ selectedAppeal.student_name || `学生${selectedAppeal.student_id || ''}` }}
          </el-descriptions-item>
          <el-descriptions-item label="匿名">
            {{ selectedAppeal.is_anonymous ? '是' : '否' }}
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

        <el-form class="process-form dialog-form-block" label-width="90px">
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

          <el-form-item label="分数处理">
            <div class="score-action">
              <el-select v-model="processForm.score_action" style="width: 220px">
                <el-option label="不改分" value="none" />
                <el-option label="取消某申报得分" value="cancel_application" />
                <el-option label="调整某申报分数" value="adjust_score" />
              </el-select>
              <el-select
                v-if="processForm.score_action !== 'none'"
                v-model="processForm.application_id"
                filterable
                remote
                clearable
                reserve-keyword
                :remote-method="searchApplicationOptions"
                :loading="applicationOptionLoading"
                placeholder="搜索关联申报名称"
                style="width: 360px"
              >
                <el-option
                  v-for="item in applicationOptions"
                  :key="item.application_id"
                  :label="formatApplicationOption(item)"
                  :value="item.application_id"
                />
              </el-select>
              <el-input-number
                v-if="processForm.score_action === 'adjust_score'"
                v-model="processForm.score"
                :min="0"
                :step="0.5"
                :precision="2"
                controls-position="right"
                placeholder="调整后分数"
                style="width: 180px"
              />
            </div>
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
        <div class="dialog-footer-row">
          <el-button class="btn-plain" @click="closeProcessDialog">返回</el-button>
          <el-button
            class="btn-main"
            type="success"
            :loading="store.processing"
            :disabled="selectedAppeal?.status === 'processed'"
            @click="submitDecision('approved')"
          >
            通过
          </el-button>
          <el-button
            class="btn-danger"
            type="danger"
            :loading="store.processing"
            :disabled="selectedAppeal?.status === 'processed'"
            @click="submitDecision('rejected')"
          >
            拒绝
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppealStore } from '@/stores/appeal'
import appealService from '@/services/appealService'
import fileService from '@/services/fileService'

const store = useAppealStore()
const statusFilter = ref('')
const studentNameFilter = ref('')
const processDialogVisible = ref(false)
const selectedAppeal = ref(null)
const applicationOptions = ref([])
const applicationOptionLoading = ref(false)

const processForm = reactive({
  result_comment: '',
  sendEmail: false,
  emailTo: '',
  score_action: 'none',
  application_id: null,
  score: null,
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
  if (row.is_anonymous) return ''
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
  processForm.score_action = row?.score_action || 'none'
  processForm.application_id = row?.application_id || null
  processForm.score = row?.adjusted_score ?? null
  processDialogVisible.value = true
  searchApplicationOptions(row?.student_name || '')
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
  if (result === 'approved' && processForm.score_action !== 'none' && !processForm.application_id) {
    ElMessage.warning('请填写要处理的申报ID')
    return
  }
  if (result === 'approved' && processForm.score_action === 'adjust_score' && processForm.score == null) {
    ElMessage.warning('请填写调整后的分数')
    return
  }

  const response = await store.processAppeal(
    selectedAppeal.value.id,
    {
      result,
      result_comment: processForm.result_comment || null,
      score_action: result === 'approved' ? processForm.score_action : 'none',
      application_id:
        result === 'approved' && processForm.score_action !== 'none'
          ? processForm.application_id
          : selectedAppeal.value.application_id || null,
      score:
        result === 'approved' && processForm.score_action === 'adjust_score'
          ? processForm.score
          : null,
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
    student_name: studentNameFilter.value || '',
    page: 1,
  })
}

const handleSearch = () => {
  store.fetchAppeals({
    status: statusFilter.value || '',
    student_name: studentNameFilter.value || '',
    page: 1,
  })
}

const refreshList = () => {
  return store.fetchAppeals({
    status: statusFilter.value || '',
    student_name: studentNameFilter.value || '',
  })
}

const handleDelete = async (row) => {
  if (!row?.id) return
  if (row.status !== 'pending') {
    ElMessage.info('已处理申诉需要保留处理记录，不能删除')
    return
  }
  try {
    await ElMessageBox.confirm('确认删除这条未处理申诉？此操作不可恢复。', '删除申诉', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await appealService.deleteAppeal(row.id)
    ElMessage.success('申诉已删除')
    await refreshList()
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(error?.message || '删除申诉失败')
  }
}

const searchApplicationOptions = async (keyword = '') => {
  applicationOptionLoading.value = true
  try {
    const res = await appealService.searchApplicationOptions({
      appeal_id: selectedAppeal.value?.id || undefined,
      announcement_id: selectedAppeal.value?.announcement_id || undefined,
      keyword: keyword || undefined,
      limit: 30,
    })
    applicationOptions.value = Array.isArray(res?.data) ? res.data : []
  } catch (error) {
    applicationOptions.value = []
    ElMessage.error(error?.message || '搜索申报失败')
  } finally {
    applicationOptionLoading.value = false
  }
}

const formatApplicationOption = (item) => {
  if (!item) return ''
  const score = item.score == null ? '-' : item.score
  return `${item.student_name || '-'} ${item.student_account || ''} / ${item.title || '-'} / ${score}分`
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

.score-action {
  width: 100%;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
