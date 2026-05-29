<template>
  <el-dialog
    v-model="visible"
    title="AI 自动填报"
    width="720px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <div class="auto-fill-dialog">
      <el-alert
        v-if="job"
        :title="statusLabel"
        :type="statusType"
        :closable="false"
        show-icon
        class="status-alert"
      />

      <el-form ref="uploadFormRef" label-width="92px" label-position="left">
        <el-form-item label="证明附件">
          <el-upload
            v-model:file-list="fileList"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.docx"
            multiple
          >
            <el-button type="primary" plain>选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 pdf/jpg/jpeg/png/webp/docx，单文件不超过 25MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <div v-if="isRunning" class="running-block">
        <el-progress :percentage="progressPercent" :indeterminate="progressPercent < 100" />
      </div>

      <div v-if="failedMessage" class="failed-block">
        <el-alert :title="failedMessage" type="error" :closable="false" show-icon />
      </div>

      <el-form
        v-if="phase === 'preview'"
        ref="previewFormRef"
        :model="form"
        :rules="rules"
        label-width="92px"
        label-position="left"
        class="preview-form"
      >
        <div v-if="previewWarnings.length" class="warning-list">
          <el-tag v-for="(item, index) in previewWarnings" :key="`${item}-${index}`" type="warning" size="small">
            {{ item }}
          </el-tag>
        </div>

        <el-row :gutter="12">
          <el-col :xs="24" :sm="12">
            <el-form-item label="大类" prop="category">
              <el-select v-model="form.category" placeholder="请选择大类" style="width: 100%" @change="handleCategoryChange">
                <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="小类" prop="sub_type">
              <el-select v-model="form.sub_type" placeholder="请选择小类" style="width: 100%" @change="handleSubTypeChange">
                <el-option v-for="item in subTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="选择项目" prop="award_path">
          <el-cascader
            v-model="form.award_path"
            :options="cascaderOptions"
            :props="{ checkStrictly: false, emitPath: true }"
            clearable
            style="width: 100%"
            placeholder="请选择申报项目"
            @change="handleAwardChange"
          />
        </el-form-item>

        <el-form-item label="申报名称" prop="title">
          <el-input v-model="form.title" type="textarea" :rows="2" placeholder="请输入申报名称" />
        </el-form-item>

        <el-row :gutter="12">
          <el-col :xs="24" :sm="12">
            <el-form-item label="发生日期" prop="occurred_at">
              <el-date-picker
                v-model="form.occurred_at"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="分数" prop="score">
              <el-input-number
                v-model="form.score"
                :min="0"
                :max="currentMaxScore"
                :precision="2"
                :step="0.5"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div v-if="currentScoreInfo" class="score-hint">
          参考分：{{ currentScoreInfo.score }}　最高分：{{ currentScoreInfo.maxScore }}
        </div>

        <el-form-item label="申报说明" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入申报说明" />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer-row">
        <el-button text @click="handleCancel">取消</el-button>
        <el-button v-if="phase !== 'preview'" type="primary" :loading="starting" @click="startAutoFill">
          AI 识别
        </el-button>
        <el-button v-else type="primary" :loading="confirming" @click="confirmPreview">
          确认提交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import applicationService from '@/services/applicationService'
import fileService from '@/services/fileService'
import {
  findCascaderPathByUid,
  getCascaderOptions,
  getCategoryOptions,
  getScoreInfoByUid,
  getSubTypeOptions,
} from '@/utils/dealAwardUid'

const emit = defineEmits(['success'])

const visible = ref(false)
const phase = ref('idle')
const starting = ref(false)
const confirming = ref(false)
const job = ref(null)
const fileList = ref([])
const previewFormRef = ref(null)
const previewApplied = ref(false)
let pollTimer = null

const SUPPORTED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp', 'docx'])
const MAX_UPLOAD_SIZE_MB = 25

const defaultForm = () => ({
  category: '',
  sub_type: '',
  award_path: [],
  award_uid: null,
  title: '',
  description: '',
  occurred_at: '',
  score: null,
})

const form = reactive(defaultForm())
const currentScoreInfo = ref(null)
const categoryOptions = getCategoryOptions()

const rules = {
  category: [{ required: true, message: '请选择大类', trigger: 'change' }],
  sub_type: [{ required: true, message: '请选择小类', trigger: 'change' }],
  award_path: [{ required: true, message: '请选择申报项目', trigger: 'change' }],
  title: [{ required: true, message: '请输入申报名称', trigger: 'blur' }],
  occurred_at: [{ required: true, message: '请选择发生日期', trigger: 'change' }],
  description: [{ required: true, message: '请输入申报说明', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分数', trigger: 'blur' }],
}

const subTypeOptions = computed(() => getSubTypeOptions(form.category))
const cascaderOptions = computed(() => getCascaderOptions(form.category, form.sub_type))
const currentMaxScore = computed(() => {
  const maxScore = currentScoreInfo.value?.maxScore
  return typeof maxScore === 'number' ? maxScore : 9999
})
const isRunning = computed(() => ['queued', 'ocr_running', 'llm_running'].includes(job.value?.status))
const failedMessage = computed(() => (job.value?.status === 'failed' ? job.value?.error_message || 'AI 自动填报失败' : ''))
const previewWarnings = computed(() => {
  const preview = job.value?.preview || {}
  const warnings = Array.isArray(preview.warnings) ? preview.warnings : []
  const needs = Array.isArray(preview.needs_user_input) ? preview.needs_user_input : []
  return [...warnings, ...needs.map((item) => `需要补充：${fieldLabel(item)}`)]
})
const progressPercent = computed(() => {
  const status = job.value?.status
  if (status === 'ocr_running') return 45
  if (status === 'llm_running') return 75
  if (status === 'completed') return 100
  return 20
})
const statusLabel = computed(() => {
  const map = {
    queued: '排队中',
    ocr_running: 'OCR 分析中',
    llm_running: '大模型识别中',
    completed: '已生成预览，请确认后提交',
    failed: '生成失败',
    canceled: '已取消',
    confirmed: '已提交',
  }
  return map[job.value?.status] || '准备自动填报'
})
const statusType = computed(() => {
  if (job.value?.status === 'failed') return 'error'
  if (job.value?.status === 'completed') return 'success'
  if (job.value?.status === 'canceled') return 'info'
  return 'info'
})

function open() {
  visible.value = true
}

function handleClosed() {
  stopPolling()
  phase.value = 'idle'
  job.value = null
  fileList.value = []
  previewApplied.value = false
  currentScoreInfo.value = null
  Object.assign(form, defaultForm())
}

function handleFileChange(file) {
  const ext = String(file?.name || '').split('.').pop()?.toLowerCase() || ''
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    ElMessage.warning('仅支持 pdf/jpg/jpeg/png/webp/docx')
    fileList.value = fileList.value.filter((item) => (item.uid || item.file_id) !== (file.uid || file.file_id))
    return
  }
  if ((file.size || 0) > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    ElMessage.warning(`文件大小不能超过 ${MAX_UPLOAD_SIZE_MB}MB`)
    fileList.value = fileList.value.filter((item) => (item.uid || item.file_id) !== (file.uid || file.file_id))
    return
  }
  file._uploaded = false
}

function handleFileRemove(file) {
  fileList.value = fileList.value.filter((item) => (item.uid || item.file_id) !== (file.uid || file.file_id))
}

async function uploadNewFiles() {
  const attachments = []
  for (const file of fileList.value) {
    if (file._uploaded && file.file_id) {
      attachments.push({ file_id: file.file_id })
      continue
    }
    if (!file.raw) continue
    const res = await fileService.upload(file.raw)
    const data = res?.data || {}
    file._uploaded = true
    file.file_id = data.file_id
    file.name = data.filename || file.name
    attachments.push({ file_id: data.file_id })
  }
  return attachments
}

async function startAutoFill() {
  if (!fileList.value.length) {
    ElMessage.warning('请先选择证明附件')
    return
  }
  starting.value = true
  previewApplied.value = false
  try {
    const attachments = await uploadNewFiles()
    if (!attachments.length) {
      ElMessage.warning('请先选择证明附件')
      return
    }
    const res = await applicationService.createAutoFillJob({ attachments })
    handleJobUpdate(res?.data || {})
    if (isRunning.value) startPolling()
  } catch (error) {
    ElMessage.error(error?.message || 'AI 自动填报任务创建失败')
  } finally {
    starting.value = false
  }
}

function startPolling() {
  stopPolling()
  pollTimer = window.setInterval(fetchJob, 1800)
}

function stopPolling() {
  if (pollTimer) {
    window.clearInterval(pollTimer)
    pollTimer = null
  }
}

async function fetchJob() {
  if (!job.value?.job_id) return
  try {
    const res = await applicationService.getAutoFillJob(job.value.job_id)
    handleJobUpdate(res?.data || {})
  } catch (error) {
    stopPolling()
    ElMessage.error(error?.message || '获取 AI 自动填报任务失败')
  }
}

function handleJobUpdate(data) {
  job.value = data
  const status = data?.status
  if (['queued', 'ocr_running', 'llm_running'].includes(status)) {
    phase.value = 'running'
    return
  }
  stopPolling()
  if (status === 'completed') {
    phase.value = 'preview'
    applyPreview(data.preview || {})
  } else if (status === 'failed') {
    phase.value = 'failed'
  } else if (status === 'confirmed') {
    phase.value = 'done'
  }
}

function applyPreview(preview) {
  if (previewApplied.value) return
  form.category = preview.category || ''
  form.sub_type = preview.sub_type || ''
  form.award_uid = preview.award_uid ?? null
  form.award_path = preview.award_uid ? findCascaderPathByUid(form.category, form.sub_type, preview.award_uid) : []
  form.title = preview.title || ''
  form.description = preview.description || ''
  form.occurred_at = preview.occurred_at || ''
  form.score = preview.score ?? null
  currentScoreInfo.value = preview.award_uid ? getScoreInfoByUid(preview.award_uid) : null
  previewApplied.value = true
}

function handleCategoryChange() {
  form.sub_type = ''
  clearAward()
}

function handleSubTypeChange() {
  clearAward()
}

function clearAward() {
  form.award_uid = null
  form.award_path = []
  currentScoreInfo.value = null
  form.score = null
}

function handleAwardChange(pathValue) {
  if (!pathValue || !pathValue.length) {
    clearAward()
    return
  }
  const leafVal = pathValue[pathValue.length - 1]
  form.award_uid = leafVal
  currentScoreInfo.value = getScoreInfoByUid(leafVal)
  if (currentScoreInfo.value && currentScoreInfo.value.score === currentScoreInfo.value.maxScore) {
    form.score = currentScoreInfo.value.score
  }
}

async function confirmPreview() {
  await previewFormRef.value?.validate(async (valid) => {
    if (!valid) return
    if (!job.value?.job_id || !form.award_uid) return
    confirming.value = true
    try {
      const attachments = await uploadNewFiles()
      const res = await applicationService.confirmAutoFillJob(job.value.job_id, {
        award_uid: form.award_uid,
        title: form.title,
        description: form.description,
        occurred_at: form.occurred_at,
        attachments,
        category: form.category,
        sub_type: form.sub_type,
        score: form.score,
      })
      ElMessage.success('自动填报已提交')
      visible.value = false
      emit('success', res?.data || {})
    } catch (error) {
      ElMessage.error(error?.message || '自动填报提交失败')
    } finally {
      confirming.value = false
    }
  })
}

async function handleCancel() {
  const jobId = job.value?.job_id
  visible.value = false
  if (jobId && isRunning.value) {
    applicationService.cancelAutoFillJob(jobId).catch(() => {})
  }
}

function fieldLabel(value) {
  const map = {
    award_uid: '申报项目',
    occurred_at: '发生日期',
    score: '分数',
  }
  return map[value] || value
}

onBeforeUnmount(stopPolling)

defineExpose({ open })
</script>

<style scoped>
.auto-fill-dialog {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-alert {
  margin-bottom: 2px;
}

.running-block,
.failed-block {
  margin: 4px 0 2px;
}

.preview-form {
  margin-top: 4px;
}

.warning-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.score-hint {
  margin: -8px 0 12px 92px;
  color: #909399;
  font-size: 12px;
}
</style>
