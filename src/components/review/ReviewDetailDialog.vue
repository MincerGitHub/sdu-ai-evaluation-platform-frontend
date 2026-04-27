<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="1180px"
    destroy-on-close
    top="4vh"
    @closed="handleClosed"
  >
    <div v-loading="loading">
      <template v-if="detail">
        <el-descriptions :column="3" border class="dialog-descriptions">
          <el-descriptions-item label="学生姓名">{{ detail.student?.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ detail.student?.account || '-' }}</el-descriptions-item>
          <el-descriptions-item label="班级ID">{{ detail.student?.class_id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(detail.status)" size="small">
              {{ statusLabel(detail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分数">{{ detail.score ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="发生日期">{{ detail.occurred_at || '-' }}</el-descriptions-item>
          <el-descriptions-item label="申报标题" :span="3">{{ detail.title || '-' }}</el-descriptions-item>
          <el-descriptions-item label="评审规则" :span="3">
            <div class="project-display">{{ projectDisplayText }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="参考分">{{ currentScoreInfo?.score ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="最高分">{{ currentScoreInfo?.maxScore ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="版本">{{ detail.version ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="3">{{ detail.description || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="audit-layout">
          <section class="file-pane">
            <header class="pane-header">
              <h3>证明文件查看区域</h3>
              <el-button
                v-if="currentAttachment"
                link
                type="primary"
                @click="downloadAttachment(currentAttachment)"
              >
                下载当前文件
              </el-button>
            </header>

            <div v-if="!attachments.length" class="pane-empty">暂无附件</div>

            <template v-else>
              <div class="file-tabs">
                <button
                  v-for="item in attachments"
                  :key="item.file_id"
                  type="button"
                  class="file-tab"
                  :class="{ active: selectedAttachmentId === item.file_id }"
                  @click="selectAttachment(item.file_id)"
                >
                  {{ item.name }}
                </button>
              </div>

              <div class="file-viewer">
                <div v-if="previewLoading" class="viewer-empty">文件加载中...</div>
                <div v-else-if="previewError" class="viewer-error">{{ previewError }}</div>
                <div v-else-if="previewKind === 'image'" class="viewer-image-wrap">
                  <img :src="previewUrl" class="viewer-image" alt="attachment preview" />
                </div>
                <iframe
                  v-else-if="previewKind === 'pdf'"
                  :src="previewUrl"
                  class="viewer-frame"
                  title="pdf preview"
                />
                <div v-else-if="previewKind === 'docx'" class="viewer-docx">
                  <article class="docx-content" v-html="docxHtml" />
                </div>
                <div v-else class="viewer-empty">
                  <p>当前文件格式暂不支持在线预览</p>
                  <p>文件类型：{{ currentAttachment?.content_type || 'unknown' }}</p>
                </div>
              </div>
            </template>
          </section>

          <aside class="ai-pane">
            <header class="pane-header">
              <h3>AI评审结果</h3>
            </header>

            <div v-if="aiLoading" class="pane-empty">AI 报告加载中...</div>
            <div v-else-if="aiError" class="ai-error">{{ aiError }}</div>
            <div v-else-if="aiReport" class="ai-report">
              <div class="ai-result-line">
                <el-tag :type="aiResultTag(aiReport.result)" effect="dark">
                  {{ aiResultLabel(aiReport.result) }}
                </el-tag>
                <span class="ai-status-text">{{ aiStatusLabel(aiReport.status) }}</span>
              </div>

              <div class="ai-kv-grid">
                <div class="ai-kv-item">服务商：{{ aiReport.provider || '-' }}</div>
                <div class="ai-kv-item">审核时间：{{ formatDateTime(aiReport.audited_at) }}</div>
                <div class="ai-kv-item">AI评分：{{ aiReport.score ?? '-' }}</div>
                <div class="ai-kv-item">总分：{{ aiReport.total_score ?? '-' }}</div>
              </div>

              <el-divider />

              <div class="ai-section">
                <div class="section-title">身份一致性</div>
                <el-tag :type="aiReport.identity_check?.matched ? 'success' : 'warning'" size="small">
                  {{ aiReport.identity_check?.matched ? '姓名匹配' : '姓名未匹配' }}
                </el-tag>
                <div class="section-subtext">期望姓名：{{ aiReport.identity_check?.expected_name || '-' }}</div>
                <div class="section-subtext">
                  匹配范围：{{ joinText(aiReport.identity_check?.expected_candidates) }}
                </div>
                <div class="section-subtext">
                  OCR疑似姓名：{{ joinText(aiReport.identity_check?.recognized_name_candidates) }}
                </div>
              </div>

              <div class="ai-section">
                <div class="section-title">内容一致性</div>
                <el-tag :type="aiReport.consistency_check?.matched ? 'success' : 'danger'" size="small">
                  {{ aiReport.consistency_check?.matched ? '整体一致' : '存在异常' }}
                </el-tag>
                <div class="section-subtext">
                  标题校验：{{ checkStatusText(aiReport.consistency_check?.title_check?.status) }}
                </div>
                <div class="section-subtext">
                  级别校验：{{ checkStatusText(aiReport.consistency_check?.level_check?.status) }}
                </div>
                <div class="section-subtext">
                  印章校验：{{ checkStatusText(aiReport.consistency_check?.seal_check?.status) }}
                </div>
                <div class="section-subtext">
                  签字校验：{{ checkStatusText(aiReport.consistency_check?.signature_check?.status) }}
                </div>
              </div>

              <div class="ai-section">
                <div class="section-title">风险点</div>
                <div v-if="Array.isArray(aiReport.risk_points) && aiReport.risk_points.length" class="risk-list">
                  <el-tag
                    v-for="(item, idx) in aiReport.risk_points"
                    :key="`${item}-${idx}`"
                    type="warning"
                    size="small"
                  >
                    {{ item }}
                  </el-tag>
                </div>
                <div v-else class="section-subtext">未识别到风险点</div>
              </div>

              <div v-if="Array.isArray(aiReport.score_breakdown) && aiReport.score_breakdown.length" class="ai-section">
                <div class="section-title">评分拆解</div>
                <el-table :data="aiReport.score_breakdown" size="small" border>
                  <el-table-column prop="rule_name" label="规则" min-width="130" show-overflow-tooltip />
                  <el-table-column prop="score" label="分值" width="72" />
                  <el-table-column prop="max_score" label="上限" width="72" />
                </el-table>
              </div>

              <div v-if="aiReport.ocr_text" class="ai-section">
                <div class="section-title">OCR 摘要</div>
                <div class="ocr-text">{{ aiReport.ocr_text }}</div>
              </div>

              <div v-if="aiReport.error_message" class="ai-section">
                <div class="section-title">错误信息</div>
                <div class="ai-error">{{ aiReport.error_message }}</div>
              </div>
            </div>
            <div v-else class="pane-empty">暂无 AI 报告</div>
          </aside>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="dialog-section">
        <el-form v-if="showDecisionActions" :model="form" label-width="80px" class="dialog-form-block">
          <el-form-item label="审核意见">
            <el-input
              v-model="form.comment"
              type="textarea"
              :rows="2"
              placeholder="请输入审核意见"
            />
          </el-form-item>
        </el-form>
        <div class="dialog-footer-actions">
          <el-button text @click="visible = false">返回</el-button>
          <template v-if="showDecisionActions">
            <el-button type="success" :loading="submitting" :disabled="!canApproveCurrent" @click="handleDecision('approved')">通过</el-button>
            <el-button type="danger" plain :loading="submitting" :disabled="!canRejectCurrent" @click="handleDecision('rejected')">驳回</el-button>
          </template>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useReviewStore } from '@/stores/review'
import { getScoreInfoByUid, findCascaderPathByUid, getCascaderOptions } from '@/utils/dealAwardUid'
import fileService from '@/services/fileService'
import aiAuditService from '@/services/aiAuditService'
import { APPLICATION_STATUS_META } from '@/utils/constants'

const props = defineProps({
  onFetchDetail: {
    type: Function,
    default: null,
  },
  onSubmitDecision: {
    type: Function,
    default: null,
  },
  showDecisionActions: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['submitted'])

const store = useReviewStore()

const visible = ref(false)
const loading = ref(false)
const submitting = ref(false)
const detail = ref(null)
const form = ref({ comment: '' })

const currentScoreInfo = ref(null)
const cascaderOptions = ref([])
const awardPath = ref([])
const projectDisplayText = ref('-')

const attachments = ref([])
const selectedAttachmentId = ref('')
const previewLoading = ref(false)
const previewError = ref('')
const previewKind = ref('none')
const previewUrl = ref('')
const docxHtml = ref('')

const aiLoading = ref(false)
const aiError = ref('')
const aiReport = ref(null)
let mammothModulePromise = null

const dialogTitle = computed(() => {
  const base = props.showDecisionActions ? '审核详情' : '申报详情'
  return detail.value ? `${base} #${detail.value.application_id || detail.value.id}` : base
})
const showDecisionActions = computed(() => props.showDecisionActions)
const canApproveCurrent = computed(() => {
  return ['pending_review', 'ai_abnormal', 'approved', 'rejected'].includes(detail.value?.status)
})
const canRejectCurrent = computed(() => {
  return ['pending_review', 'ai_abnormal', 'approved', 'rejected', 'archived'].includes(detail.value?.status)
})

const currentAttachment = computed(() =>
  attachments.value.find((item) => item.file_id === selectedAttachmentId.value) || null
)

function aiResultLabel(result) {
  if (result === 'pass') return '通过'
  if (result === 'abnormal') return '异常'
  if (result === 'error') return '失败'
  return result || '-'
}

function aiResultTag(result) {
  if (result === 'pass') return 'success'
  if (result === 'abnormal') return 'warning'
  if (result === 'error') return 'danger'
  return 'info'
}

function aiStatusLabel(status) {
  const map = {
    queued: '排队中',
    running: '运行中',
    completed: '已完成',
    failed: '失败',
  }
  return map[status] || status || '-'
}

function checkStatusText(status) {
  const map = {
    matched: '匹配',
    mismatch: '不匹配',
    pass: '通过',
    failed: '失败',
    unknown: '未知',
    skipped: '不校验',
  }
  return map[status] || status || '-'
}

function joinText(value) {
  return Array.isArray(value) && value.length ? value.join('、') : '-'
}

function formatDateTime(value) {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleString('zh-CN', { hour12: false })
}

function normalizeDetailResult(result) {
  if (result?.success === false) {
    return { success: false, error: result.error || '获取详情失败' }
  }
  if (result?.success === true) {
    return { success: true, data: result.data || {} }
  }
  return { success: true, data: result?.data || result || {} }
}

function withStudentContext(payload, context) {
  if (!payload || payload.student) return payload
  if (!context) return payload
  return {
    ...payload,
    student: {
      id: context.student_id || null,
      name: context.student_name || '',
      account: context.student_account || '',
      class_id: context.class_id || null,
      email: context.student_email || '',
    },
  }
}

function getFileExt(filename = '') {
  const idx = filename.lastIndexOf('.')
  if (idx < 0) return ''
  return filename.slice(idx + 1).toLowerCase()
}

function inferPreviewKind(file) {
  const type = String(file?.content_type || '').toLowerCase()
  const ext = getFileExt(file?.name || file?.filename || '')
  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) return 'image'
  if (type.includes('pdf') || ext === 'pdf') return 'pdf'
  if (type.includes('wordprocessingml') || ext === 'docx') return 'docx'
  return 'unsupported'
}

function cleanupPreviewUrl() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}

function resetPreviewState() {
  previewLoading.value = false
  previewError.value = ''
  previewKind.value = 'none'
  docxHtml.value = ''
  cleanupPreviewUrl()
}

function resolveProjectLabelsByPath(path = [], options = []) {
  if (!Array.isArray(path) || !path.length) return []
  const labels = []
  let cursor = options
  for (const value of path) {
    const node = Array.isArray(cursor) ? cursor.find((item) => item?.value === value) : null
    if (!node) break
    labels.push(node.label || node.value)
    cursor = node.children || []
  }
  return labels
}

function resolveProjectDisplay(payload, contextRow) {
  const directCandidates = [
    payload?.award_rule?.rule_name,
    payload?.award_rule_name,
    contextRow?.award_rule?.rule_name,
    contextRow?.award_rule_name,
    payload?.project_name,
    payload?.project,
    payload?.award_name,
    contextRow?.project,
  ]
  for (const candidate of directCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate
    }
  }
  if (payload?.award_uid != null) {
    const path = findCascaderPathByUid(payload.category, payload.sub_type, payload.award_uid)
    const labels = resolveProjectLabelsByPath(path, cascaderOptions.value)
    if (labels.length) return labels.join(' / ')
    return String(payload.award_uid)
  }
  return '-'
}

async function resolveAttachments(rawList = []) {
  const mapped = []
  for (const item of rawList) {
    if (!item?.file_id) continue
    let metadata = item
    if (!item.filename || !item.content_type) {
      try {
        const metaRes = await fileService.getFile(item.file_id)
        metadata = { ...(item || {}), ...(metaRes?.data || {}) }
      } catch {
        metadata = item
      }
    }
    mapped.push({
      file_id: item.file_id,
      name: metadata.filename || item.filename || item.file_id,
      filename: metadata.filename || item.filename || item.file_id,
      content_type: metadata.content_type || item.content_type || '',
      size: metadata.size || item.size || 0,
    })
  }
  return mapped
}

async function loadAttachmentPreview(file) {
  resetPreviewState()
  if (!file?.file_id) return

  const kind = inferPreviewKind(file)
  previewKind.value = kind
  if (kind === 'unsupported') return

  previewLoading.value = true
  try {
    if (kind === 'image' || kind === 'pdf') {
      const blob = await fileService.getFileBlob(file.file_id)
      previewUrl.value = URL.createObjectURL(blob)
    } else if (kind === 'docx') {
      if (!mammothModulePromise) {
        mammothModulePromise = import('mammoth/mammoth.browser')
      }
      const mammothModule = await mammothModulePromise
      const mammoth = mammothModule?.default || mammothModule
      const buffer = await fileService.getFileArrayBuffer(file.file_id)
      const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
      docxHtml.value = result?.value || '<p>文档无可展示内容</p>'
    }
  } catch (error) {
    previewError.value = error?.message || '文件预览加载失败'
  } finally {
    previewLoading.value = false
  }
}

async function selectAttachment(fileId) {
  selectedAttachmentId.value = fileId
  const selected = attachments.value.find((item) => item.file_id === fileId)
  await loadAttachmentPreview(selected)
}

function downloadAttachment(file) {
  if (!file?.file_id) return
  fileService.downloadFile(file.file_id, file.name).catch((error) => {
    ElMessage.error(error?.message || '附件下载失败')
  })
}

async function fetchAiReport(applicationId) {
  aiLoading.value = true
  aiError.value = ''
  aiReport.value = null
  try {
    const aiRes = await aiAuditService.getReport(applicationId)
    aiReport.value = aiRes?.data || null
  } catch (error) {
    if (error?.response?.status === 403) {
      aiError.value = '当前角色暂无权限查看 AI 审核报告'
    } else if (error?.response?.status === 404) {
      aiError.value = '当前申报暂无 AI 审核报告'
    } else {
      aiError.value = error?.message || '获取 AI 审核报告失败'
    }
  } finally {
    aiLoading.value = false
  }
}

async function open(applicationId, contextRow = null) {
  visible.value = true
  loading.value = true
  form.value = { comment: '' }
  detail.value = null
  currentScoreInfo.value = null
  projectDisplayText.value = '-'
  attachments.value = []
  selectedAttachmentId.value = ''
  aiLoading.value = false
  aiError.value = ''
  aiReport.value = null
  resetPreviewState()

  try {
    const detailResultRaw = props.onFetchDetail
      ? await props.onFetchDetail(applicationId, contextRow)
      : await store.fetchDetail(applicationId)
    const detailResult = normalizeDetailResult(detailResultRaw)
    if (!detailResult.success) {
      ElMessage.error(detailResult.error || '获取详情失败')
      return
    }

    detail.value = withStudentContext(detailResult.data, contextRow)
    form.value.comment = detail.value.comment || ''

    cascaderOptions.value = getCascaderOptions(detail.value.category, detail.value.sub_type)
    if (detail.value.award_uid != null) {
      awardPath.value = findCascaderPathByUid(detail.value.category, detail.value.sub_type, detail.value.award_uid)
      currentScoreInfo.value = getScoreInfoByUid(detail.value.award_uid)
    } else {
      awardPath.value = []
      currentScoreInfo.value = null
    }
    projectDisplayText.value = resolveProjectDisplay(detail.value, contextRow)

    attachments.value = await resolveAttachments(detail.value.attachments || [])
    if (attachments.value.length) {
      await selectAttachment(attachments.value[0].file_id)
    }

    await fetchAiReport(applicationId)
  } catch (error) {
    ElMessage.error(error?.message || '获取详情失败')
  } finally {
    loading.value = false
  }
}

async function handleDecision(decision) {
  if (!detail.value?.application_id) return
  if (decision === 'approved' && !canApproveCurrent.value) {
    ElMessage.info('当前状态不能重复通过')
    return
  }
  if (decision === 'rejected' && !canRejectCurrent.value) {
    ElMessage.info('当前状态不能驳回')
    return
  }

  const payload = {
    decision,
    comment: form.value.comment || null,
  }

  submitting.value = true
  try {
    let result
    if (props.onSubmitDecision) {
      result = await props.onSubmitDecision(detail.value.application_id, payload, detail.value)
    } else {
      result = await store.submitDecision(detail.value.application_id, payload)
    }
    const normalized = normalizeDetailResult(result)
    if (normalized.success) {
      ElMessage.success(decision === 'approved' ? '审核通过' : '已驳回')
      emit('submitted', {
        application_id: detail.value.application_id,
        decision,
        payload: normalized.data,
      })
      visible.value = false
    } else {
      ElMessage.error(normalized.error || '操作失败')
    }
  } catch (error) {
    ElMessage.error(error?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

function statusTagType(status) {
  const meta = APPLICATION_STATUS_META[status]
  return meta?.tagType || 'info'
}

function statusLabel(status) {
  const meta = APPLICATION_STATUS_META[status]
  return meta?.label || status || '-'
}

function handleClosed() {
  detail.value = null
  attachments.value = []
  selectedAttachmentId.value = ''
  aiReport.value = null
  aiError.value = ''
  projectDisplayText.value = '-'
  resetPreviewState()
}

defineExpose({ open })
</script>

<style scoped>
.project-display {
  line-height: 1.6;
  color: #303133;
}

.audit-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(320px, 1fr);
  gap: 16px;
  margin-top: 14px;
}

.file-pane,
.ai-pane {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  min-height: 460px;
  overflow: hidden;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #f0f2f5;
  background: linear-gradient(180deg, #fff7f7 0%, #ffffff 100%);
}

.pane-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #9c0c13;
}

.file-tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  padding: 10px 12px;
  overflow-x: auto;
  border-bottom: 1px solid #f0f2f5;
}

.file-tab {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #606266;
  border-radius: 14px;
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
  white-space: nowrap;
}

.file-tab.active {
  border-color: #9c0c13;
  color: #9c0c13;
  background: #fff1f1;
}

.file-viewer {
  height: 430px;
  background: #fafafa;
  display: flex;
}

.viewer-empty,
.viewer-error {
  margin: auto;
  color: #909399;
  font-size: 13px;
}

.viewer-error {
  color: #f56c6c;
}

.viewer-image-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  background: #111;
}

.viewer-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.viewer-frame {
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
}

.viewer-docx {
  width: 100%;
  height: 100%;
  overflow: auto;
  background: #fff;
  padding: 12px 14px;
  box-sizing: border-box;
}

.docx-content :deep(p) {
  margin: 0 0 8px;
  line-height: 1.6;
  color: #303133;
}

.docx-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.docx-content :deep(td),
.docx-content :deep(th) {
  border: 1px solid #ebeef5;
  padding: 6px 8px;
}

.ai-pane {
  padding-bottom: 12px;
}

.pane-empty {
  padding: 16px 14px;
  color: #909399;
}

.ai-error {
  color: #f56c6c;
  padding: 12px 14px;
}

.ai-report {
  padding: 10px 14px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-result-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-status-text {
  color: #606266;
  font-size: 13px;
}

.ai-kv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 8px;
  font-size: 13px;
  color: #303133;
}

.ai-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #9c0c13;
}

.section-subtext {
  font-size: 13px;
  color: #606266;
}

.risk-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ocr-text {
  max-height: 100px;
  overflow: auto;
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
  background: #f7f8fa;
  border-radius: 6px;
  padding: 8px;
}

@media (max-width: 1200px) {
  .audit-layout {
    grid-template-columns: 1fr;
  }
}
</style>
