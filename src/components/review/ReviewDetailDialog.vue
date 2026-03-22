<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="600px" destroy-on-close>
    <div v-loading="loading">
      <template v-if="detail">
        <el-descriptions :column="2" border class="dialog-descriptions">
          <el-descriptions-item label="学生姓名">{{ detail.student?.name }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ detail.student?.account }}</el-descriptions-item>
          <el-descriptions-item label="班级ID">{{ detail.student?.class_id }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(detail.status)" size="small">
              {{ statusLabel(detail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申报标题" :span="2">{{ detail.title }}</el-descriptions-item>
          <el-descriptions-item label="申报项目" :span="2">
            <el-cascader v-model="awardPath" :options="cascaderOptions"
              :props="{ checkStrictly: false, emitPath: true }" clearable style="width: 100%"
              placeholder="请选择申报项目" @change="handleAwardChange" />
          </el-descriptions-item>
          <el-descriptions-item label="分数">{{ detail.score }}</el-descriptions-item>
          <el-descriptions-item label="发生日期">{{ detail.occurred_at }}</el-descriptions-item>
          <el-descriptions-item label="参考分">{{ currentScoreInfo?.score ?? '—' }}</el-descriptions-item>
          <el-descriptions-item label="最高分">{{ currentScoreInfo?.maxScore ?? '—' }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ detail.description }}</el-descriptions-item>
          <el-descriptions-item label="附件" :span="2">
            <div v-if="!attachments.length">无</div>
            <ul v-else>
              <li v-for="file in attachments" :key="file.file_id">
                <a :href="file.url" target="_blank" download>{{ file.name }}</a>
              </li>
            </ul>
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </div>

    <template #footer>
      <div class="dialog-section">
        <el-form :model="form" label-width="80px" class="dialog-form-block">
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
          <el-button type="success" @click="handleDecision('approved')">通过</el-button>
          <el-button type="danger" plain @click="handleDecision('rejected')">驳回</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useReviewStore } from '@/stores/review'
import { getScoreInfoByUid, findCascaderPathByUid, getCascaderOptions } from '@/utils/dealAwardUid'
import fileService from '@/services/fileService'
import { APPLICATION_STATUS_META } from '@/utils/constants'

const store = useReviewStore()

const visible = ref(false)
const loading = ref(false)
const detail = ref(null)
const decisionMode = ref('') // 'approved' | 'rejected' | ''

const form = ref({
    comment: ''
})

const dialogTitle = computed(() => detail.value ? `审核详情 #${detail.value.id}` : '审核详情')

// 申报项目路径
const awardPathLabel = ref('')
const currentScoreInfo = ref(null)

// 附件列表
const attachments = ref([])

const cascaderOptions = ref([])
const awardPath = ref([])

async function open(applicationId) {
    visible.value = true
    loading.value = true
    form.value = { comment: '' }
    decisionMode.value = ''
    detail.value = null
    awardPathLabel.value = ''
    currentScoreInfo.value = null
    attachments.value = []
    try {
        const result = await store.fetchDetail(applicationId)
        if (result.success) {
            detail.value = result.data
            form.value.comment = detail.value.comment || ''
            // 加载 cascader options
            cascaderOptions.value = getCascaderOptions(detail.value.category, detail.value.sub_type)
            // 设置初始路径
            if (detail.value.award_uid != null) {
                awardPath.value = findCascaderPathByUid(detail.value.category, detail.value.sub_type, detail.value.award_uid)
                currentScoreInfo.value = getScoreInfoByUid(detail.value.award_uid)
            }
            // 处理附件
            const resolvedFiles = []
            for (const a of detail.value.attachments || []) {
                try {
                    const res = await fileService.getFile(a.file_id)
                    const fileInfo = res.data ?? res
                    resolvedFiles.push({
                        name: fileInfo.filename || a.file_id,
                        url: fileService.getFileUrl(a.file_id),
                        file_id: a.file_id,
                    })
                } catch {
                    resolvedFiles.push({
                        name: a.file_id,
                        url: fileService.getFileUrl(a.file_id),
                        file_id: a.file_id,
                    })
                }
            }
            attachments.value = resolvedFiles
        } else {
            ElMessage.error(result.error || '获取详情失败')
        }
    } finally {
        loading.value = false
    }
}

async function handleDecision(decision) {
    if (decision === 'rejected') {
        decisionMode.value = 'rejected'
    } else {
        decisionMode.value = ''
    }

    const payload = {
        decision,
        comment: form.value.comment || null
    }

    const result = await store.submitDecision(detail.value.id, payload)
    if (result.success) {
        ElMessage.success(decision === 'approved' ? '审核通过' : '已驳回')
        visible.value = false
    } else {
        ElMessage.error(result.error || '操作失败')
    }
}

function handleAwardChange(val) {
    if (!val || val.length === 0) {
        currentScoreInfo.value = null
        return
    }
    const leafVal = val[val.length - 1]
    currentScoreInfo.value = getScoreInfoByUid(leafVal)
}

function statusTagType(status) {
    const meta = APPLICATION_STATUS_META[status]
    return meta?.tagType || 'info'
}

function statusLabel(status) {
    const meta = APPLICATION_STATUS_META[status]
    return meta?.label || status || '-'
}

defineExpose({ open })
</script>

<style scoped>
/* 占位，防止潜在旧引用 */
.decision-area {
  margin-top: 16px;
}
</style>