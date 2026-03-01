<template>
  <div class="appeal-page">
    <el-card v-if="!isCreateMode" class="appeal-list-card">
      <template #header>
        <div class="card-header">
          <span>我的申诉</span>
          <el-button type="primary" @click="enterCreateMode">+ 新建</el-button>
        </div>
      </template>

      <el-table :data="appealList" v-loading="loading" empty-text="暂无申诉记录">
        <el-table-column prop="content" label="内容" min-width="420" />
        <el-table-column label="申诉状态" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row)" size="small">
              {{ getStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="查看 删除" width="160">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">查看</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-else class="appeal-create-card">
      <template #header>
        <div class="card-header">
          <span>新建申诉</span>
        </div>
      </template>

      <el-form :model="form" label-width="100px">
        <el-form-item label="公示" required>
          <el-select v-model="form.announcementId" placeholder="请选择公示" style="width: 100%">
            <el-option
              v-for="item in announcementOptions"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="申诉内容" required>
          <el-input
            v-model.trim="form.content"
            type="textarea"
            :rows="6"
            maxlength="2000"
            show-word-limit
            placeholder="请描述申诉理由和诉求"
          />
        </el-form-item>

        <el-form-item label="证明材料">
          <el-upload
            :http-request="handleUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <el-button>+ 上传文件</el-button>
          </el-upload>
          <div class="upload-tip">支持图片/PDF，单个文件不超过 10MB（mock 环境仅模拟上传）</div>

          <div v-if="attachments.length" class="attachment-list">
            <div v-for="item in attachments" :key="item.file_id" class="attachment-item">
              <a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.name }}</a>
              <el-button link type="danger" @click="removeAttachment(item.file_id)">删除</el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submitAppeal">提交</el-button>
          <el-button @click="cancelCreate">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog v-model="detailVisible" title="申诉详情" width="680px">
      <div v-if="currentAppeal" class="detail-wrap">
        <div class="detail-row">
          <span class="label">公示：</span>
          <span>{{ getAnnouncementTitle(currentAppeal.announcement_id) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">状态：</span>
          <span>{{ getStatusText(currentAppeal) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">内容：</span>
          <span>{{ currentAppeal.content || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">证明材料：</span>
          <span v-if="!normalizeAttachments(currentAppeal).length">无</span>
          <div v-else class="detail-attachment-list">
            <a
              v-for="(item, index) in normalizeAttachments(currentAppeal)"
              :key="item.file_id || item.url || index"
              :href="getAttachmentUrl(item)"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ getAttachmentName(item, index) }}
            </a>
          </div>
        </div>
        <div class="detail-row" v-if="currentAppeal.result_comment">
          <span class="label">处理备注：</span>
          <span>{{ currentAppeal.result_comment }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import appealService from '@/services/appealService'
import archiveService from '@/services/archiveService'
import fileService from '@/services/fileService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const isCreateMode = ref(false)

const appealList = ref([])

const detailVisible = ref(false)
const currentAppeal = ref(null)

const announcementOptions = ref([])
const attachments = ref([])
const form = reactive({
  announcementId: null,
  content: '',
})

const currentUserId = computed(() => authStore.user?.id || null)

const syncModeFromRoute = () => {
  isCreateMode.value = route.query.mode === 'create'
}

watch(() => route.query.mode, syncModeFromRoute)

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

const getAnnouncementTitle = (announcementId) => {
  const hit = announcementOptions.value.find((item) => item.id === Number(announcementId))
  return hit?.title || `公示 #${announcementId || '-'}`
}

const normalizeAttachments = (appeal) => {
  const source = appeal?.attachments
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

const resetCreateForm = () => {
  form.content = ''
  attachments.value = []
  if (announcementOptions.value.length) {
    form.announcementId = announcementOptions.value[0].id
  } else {
    form.announcementId = null
  }
}

const loadAnnouncements = async () => {
  try {
    const res = await archiveService.getAnnouncements()
    const list = Array.isArray(res.data) ? res.data : []
    announcementOptions.value = list.map((item) => ({
      id: item.id,
      title: item.title,
    }))
    if (!form.announcementId && announcementOptions.value.length) {
      form.announcementId = announcementOptions.value[0].id
    }
  } catch (error) {
    ElMessage.error(error?.message || '获取公示列表失败')
  }
}

const loadAppeals = async () => {
  loading.value = true
  try {
    const params = { page: 1, size: 100 }
    if (currentUserId.value) {
      params.student_id = currentUserId.value
    }
    const res = await appealService.getList(params)
    const payload = res.data

    let list = []
    if (Array.isArray(payload)) {
      list = payload
    } else if (payload && Array.isArray(payload.list)) {
      list = payload.list
    }

    // 兼容后端未按 student_id 过滤时的情况
    if (currentUserId.value && list.some((item) => item.student_id !== undefined)) {
      list = list.filter((item) => item.student_id === Number(currentUserId.value))
    }

    appealList.value = list
  } catch (error) {
    ElMessage.error(error?.message || '获取申诉列表失败')
  } finally {
    loading.value = false
  }
}

const updateQueryMode = async (mode) => {
  const query = { ...route.query }
  if (mode) query.mode = mode
  else delete query.mode
  await router.replace({ path: route.path, query })
}

const enterCreateMode = async () => {
  if (!announcementOptions.value.length) {
    await loadAnnouncements()
  }
  if (!form.announcementId && announcementOptions.value.length) {
    form.announcementId = announcementOptions.value[0].id
  }
  await updateQueryMode('create')
}

const cancelCreate = async () => {
  resetCreateForm()
  await updateQueryMode(undefined)
}

const beforeUpload = (file) => {
  const isWithinSize = file.size / 1024 / 1024 < 10
  if (!isWithinSize) {
    ElMessage.warning('文件大小不能超过 10MB')
    return false
  }
  return true
}

const handleUpload = async ({ file }) => {
  try {
    const res = await fileService.upload(file)
    const data = res.data || {}
    const fileId = data.file_id
    if (!fileId) throw new Error('上传返回缺少 file_id')

    attachments.value.push({
      file_id: fileId,
      name: file.name,
      url: fileService.getFileUrl(fileId),
    })
    ElMessage.success('文件上传成功')
  } catch (error) {
    ElMessage.error(error?.message || '文件上传失败')
  }
}

const removeAttachment = (fileId) => {
  attachments.value = attachments.value.filter((item) => item.file_id !== fileId)
}

const submitAppeal = async () => {
  if (!form.announcementId) {
    ElMessage.warning('请选择公示')
    return
  }
  if (!form.content) {
    ElMessage.warning('请填写申诉内容')
    return
  }

  submitting.value = true
  try {
    await appealService.create({
      announcement_id: form.announcementId,
      content: form.content,
      attachments: attachments.value.map((item) => ({ file_id: item.file_id })),
    })
    ElMessage.success('申诉提交成功')
    await loadAppeals()
    await cancelCreate()
  } catch (error) {
    ElMessage.error(error?.message || '申诉提交失败')
  } finally {
    submitting.value = false
  }
}

const openDetail = (row) => {
  currentAppeal.value = row
  detailVisible.value = true
}

const handleDelete = () => {
  ElMessage.info('当前版本暂不支持删除申诉')
}

onMounted(async () => {
  syncModeFromRoute()
  await Promise.all([loadAppeals(), loadAnnouncements()])
})
</script>

<style scoped>
.appeal-page {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.attachment-list {
  margin-top: 12px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  background: #f7f9fc;
  border-radius: 6px;
}

.attachment-item a {
  color: #409eff;
  text-decoration: none;
}

.attachment-item a:hover {
  text-decoration: underline;
}

.detail-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.6;
}

.label {
  min-width: 72px;
  color: #606266;
}

.detail-attachment-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-attachment-list a {
  color: #409eff;
  text-decoration: none;
}

.detail-attachment-list a:hover {
  text-decoration: underline;
}
</style>
