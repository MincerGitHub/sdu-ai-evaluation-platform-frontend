<template>
  <el-dialog
    v-model="visible"
    :title="mode === 'create' ? '新建申报' : '修改申报'"
    width="560px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" label-position="left">
      <el-form-item label="申报名称" prop="title">
        <el-input v-model="form.title" type="textarea" :rows="2" placeholder="请输入申报名称" />
      </el-form-item>

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

      <el-form-item label="分数" prop="score">
        <div style="width: 100%">
          <el-input-number
            v-model="form.score"
            :min="0"
            :max="typeof currentMaxScore === 'number' ? currentMaxScore : 99"
            :precision="2"
            :step="0.5"
            placeholder="请输入分数"
            controls-position="right"
            style="width: 100%"
          />
          <div v-if="currentScoreInfo" class="score-hint">
            <span>参考分：{{ currentScoreInfo.score }}</span>
            <span style="margin-left: 16px">最高分：{{ currentScoreInfo.maxScore }}</span>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="发生日期" prop="occurred_at">
        <el-date-picker
          v-model="form.occurred_at"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="申报说明" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入申报说明" />
      </el-form-item>

      <el-form-item label="附件上传">
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

    <template #footer>
      <div class="dialog-footer-row">
        <el-button text @click="handleClose">返回</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useApplicationStore } from '@/stores/application'
import { getScoreInfoByUid, findCascaderPathByUid } from '@/utils/dealAwardUid'
import fileService from '@/services/fileService'

const props = defineProps({
  mode: {
    type: String,
    default: 'create',
  },
  initialData: {
    type: Object,
    default: null,
  },
  cascaderOptions: {
    type: Array,
    default: () => [],
  },
  category: {
    type: String,
    default: '',
  },
  subType: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['success'])

const store = useApplicationStore()
const loading = computed(() => store.loading)
const visible = ref(false)

const formRef = ref(null)
const fileList = ref([])
const selectedUid = ref(null)
const currentScoreInfo = ref(null)
const SUPPORTED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp', 'docx'])
const MAX_UPLOAD_SIZE_MB = 25

const defaultForm = () => ({
  title: '',
  description: '',
  occurred_at: '',
  award_path: [],
  score: null,
  version: null,
})

const form = reactive(defaultForm())

const rules = {
  title: [{ required: true, message: '请输入申报名称', trigger: 'blur' }],
  award_path: [{ required: true, message: '请选择申报项目', trigger: 'change' }],
  occurred_at: [{ required: true, message: '请选择发生日期', trigger: 'change' }],
  description: [{ required: true, message: '请输入申报说明', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分数', trigger: 'blur' }],
}

const currentMaxScore = computed(() => {
  if (!currentScoreInfo.value) return 9999
  const maxScore = currentScoreInfo.value.maxScore
  return typeof maxScore === 'number' ? maxScore : 9999
})

async function open() {
  if (props.mode === 'edit' && props.initialData) {
    const d = props.initialData
    form.title = d.title ?? ''
    form.description = d.description ?? ''
    form.occurred_at = d.occurred_at ?? ''
    form.score = d.score ?? null
    form.version = d.version ?? null

    if (d.award_uid != null) {
      form.award_path = findCascaderPathByUid(props.category, props.subType, d.award_uid)
      selectedUid.value = d.award_uid
      currentScoreInfo.value = getScoreInfoByUid(d.award_uid)
    } else {
      form.award_path = []
      selectedUid.value = null
      currentScoreInfo.value = null
    }

    const attachments = d.attachments ?? []
    const resolvedFiles = []
    for (const a of attachments) {
      try {
        const res = await fileService.getFile(a.file_id)
        const fileInfo = res.data ?? res
        resolvedFiles.push({
          name: fileInfo.filename || a.file_id,
          url: await fileService.getFileAccessUrl(a.file_id),
          file_id: a.file_id,
          status: 'success',
          _uploaded: true,
        })
      } catch {
        resolvedFiles.push({
          name: a.file_id,
          url: fileService.getFileUrl(a.file_id),
          file_id: a.file_id,
          status: 'success',
          _uploaded: true,
        })
      }
    }
    fileList.value = resolvedFiles
  }
  visible.value = true
}

function handleClose() {
  visible.value = false
}

function handleClosed() {
  formRef.value?.resetFields()
  Object.assign(form, defaultForm())
  fileList.value = []
  selectedUid.value = null
  currentScoreInfo.value = null
}

function handleAwardChange(pathValue) {
  if (!pathValue || !pathValue.length) {
    selectedUid.value = null
    currentScoreInfo.value = null
    form.score = null
    return
  }
  const leafVal = pathValue[pathValue.length - 1]
  selectedUid.value = leafVal
  const info = getScoreInfoByUid(leafVal)
  currentScoreInfo.value = info

  if (info && typeof info.score === 'number' && typeof info.maxScore === 'number' && info.score === info.maxScore) {
    form.score = info.score
  } else {
    form.score = null
  }
}

function handleFileChange(file) {
  const ext = String(file?.name || '').split('.').pop()?.toLowerCase() || ''
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    ElMessage.warning('仅支持 pdf/jpg/jpeg/png/webp/docx')
    fileList.value = fileList.value.filter((f) => (f.uid || f.file_id) !== (file.uid || file.file_id))
    return
  }
  if ((file.size || 0) > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    ElMessage.warning(`文件大小不能超过 ${MAX_UPLOAD_SIZE_MB}MB`)
    fileList.value = fileList.value.filter((f) => (f.uid || f.file_id) !== (file.uid || file.file_id))
    return
  }
  file._uploaded = false
}

function handleFileRemove(file) {
  fileList.value = fileList.value.filter((f) => (f.uid || f.file_id) !== (file.uid || file.file_id))
}

async function uploadNewFiles() {
  const attachments = []
  for (const f of fileList.value) {
    if (f._uploaded && f.file_id) {
      attachments.push({ file_id: f.file_id })
      continue
    }
    if (!f.raw) continue
    try {
      const res = await fileService.upload(f.raw)
      const data = res.data ?? res
      const fileId = data.file_id
      attachments.push({ file_id: fileId })
      f._uploaded = true
      f.file_id = fileId
    } catch (error) {
      ElMessage.error(`文件「${f.name}」上传失败`)
      throw error
    }
  }
  return attachments
}

async function handleSubmit() {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    if (selectedUid.value == null) {
      ElMessage.warning('请选择有效的申报项目')
      return
    }

    try {
      const attachments = await uploadNewFiles()
      const payload = {
        award_uid: selectedUid.value,
        title: form.title,
        description: form.description,
        occurred_at: form.occurred_at,
        score: form.score,
        attachments,
      }

      let result
      if (props.mode === 'create') {
        result = await store.createApplication(payload)
      } else {
        payload.version = form.version
        result = await store.updateApplication(props.initialData.application_id, payload)
      }

      if (result.success) {
        ElMessage.success(props.mode === 'create' ? '申报创建成功' : '申报修改成功')
        visible.value = false
        emit('success')
      } else {
        ElMessage.error(result.error || '操作失败')
      }
    } catch {
      // 错误已在上游提示
    }
  })
}

defineExpose({ open })
</script>

<style scoped>
.score-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
}
</style>
