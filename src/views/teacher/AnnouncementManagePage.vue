<template>
  <div class="teacher-archive-page">
    <h2 class="page-title">归档</h2>

    <el-card class="archive-card">
      <div class="section-header">
        <h3>归档列表</h3>
        <el-button class="refresh-button" @click="fetchArchives">刷新</el-button>
      </div>

      <el-table
        :data="archives"
        border
        v-loading="loadingArchives"
        empty-text="暂无归档记录"
      >
        <el-table-column prop="term" label="学期" min-width="140" />
        <el-table-column prop="grade" label="年级" width="120" />
        <el-table-column label="时间戳" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row?.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="公示状态" width="140">
          <template #default="{ row }">
            <el-tag :type="row?.is_announced ? 'success' : 'info'" size="small">
              {{ row?.is_announced ? '已公示' : '未公示' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下载" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
          </template>
        </el-table-column>
        <el-table-column label="公示" width="120">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :disabled="row?.is_announced"
              @click="openCreateDialog(row)"
            >
              发布
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="section-header section-spacing">
        <h3>公示管理</h3>
        <el-button class="submit-button" @click="openCreateDialog(null)">新建公示</el-button>
      </div>

      <el-table
        :data="filteredAnnouncements"
        border
        v-loading="loadingAnnouncements"
        empty-text="暂无公示记录"
      >
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="范围" min-width="180">
          <template #default="{ row }">
            {{ formatScope(row) }}
          </template>
        </el-table-column>
        <el-table-column label="时间范围" min-width="220">
          <template #default="{ row }">
            {{ formatRange(row?.start_at, row?.end_at) }}
          </template>
        </el-table-column>
        <el-table-column label="归档" min-width="120">
          <template #default="{ row }">
            {{ row?.archive_id || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getAnnouncementTagType(row)" size="small">
              {{ getAnnouncementStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
            <el-button
              link
              type="warning"
              :disabled="isAnnouncementClosed(row)"
              @click="handleClose(row)"
            >
              关闭
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="720px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="公示标题" prop="title">
          <el-input v-model.trim="form.title" maxlength="50" show-word-limit placeholder="请输入公示标题" />
        </el-form-item>
        <el-form-item label="归档绑定" prop="archive_id">
          <el-select v-model="form.archive_id" placeholder="请选择归档记录" style="width: 100%" filterable>
            <el-option
              v-for="item in archiveOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="适用年级" prop="grade">
          <el-select
            v-model="form.grade"
            filterable
            allow-create
            default-first-option
            placeholder="请输入年级"
            style="width: min(320px, 100%)"
          >
            <el-option v-for="item in gradeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用班级">
          <el-select
            v-model="form.classIds"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="不选表示全年级"
            style="width: min(420px, 100%)"
          >
            <el-option v-for="item in classOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startAt">
          <el-date-picker
            v-model="form.startAt"
            type="datetime"
            placeholder="请选择开始时间"
            :disabled-date="disableStartDate"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endAt">
          <el-date-picker
            v-model="form.endAt"
            type="datetime"
            placeholder="请选择结束时间"
            :disabled-date="disableEndDate"
            :disabled-time="disableEndTime"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="展示字段" prop="showFields">
          <el-select
            v-model="form.showFields"
            multiple
            filterable
            placeholder="请选择展示字段"
            style="width: 100%"
          >
            <el-option v-for="item in showFieldOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeDialog">返回</el-button>
        <el-button class="submit-button" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import archiveService from '@/services/archiveService'
import announcementService from '@/services/announcementService'

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id || null)

const archives = ref([])
const announcements = ref([])
const loadingArchives = ref(false)
const loadingAnnouncements = ref(false)

const dialogVisible = ref(false)
const dialogMode = ref('create')
const saving = ref(false)
const formRef = ref(null)
const editingId = ref(null)

const form = reactive({
  title: '',
  archive_id: '',
  grade: '',
  classIds: [],
  startAt: null,
  endAt: null,
  showFields: [],
})

const rules = {
  title: [{ required: true, message: '请输入公示标题', trigger: 'blur' }],
  archive_id: [{ required: true, message: '请选择归档记录', trigger: 'change' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'change' }],
  startAt: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endAt: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  showFields: [{ type: 'array', required: true, message: '请选择展示字段', trigger: 'change' }],
}

const gradeOptions = ref([])
const classOptions = ref([])

const showFieldOptions = [
  { label: '姓名', value: 'name' },
  { label: '班级', value: 'class' },
  { label: '分数', value: 'score' },
  { label: '排名', value: 'rank' },
]

const dialogTitle = computed(() => (dialogMode.value === 'edit' ? '编辑公示' : '新建公示'))

const archiveOptions = computed(() =>
  archives.value.map((item) => ({
    label: item.archive_name || item.archive_id,
    value: item.archive_id,
  }))
)

const filteredAnnouncements = computed(() => {
  const list = announcements.value
  if (!currentUserId.value) return list
  return list.filter((item) => {
    if (item?.created_by) return item.created_by === currentUserId.value
    if (item?.teacher_id) return item.teacher_id === currentUserId.value
    return true
  })
})

const normalizeListData = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.list)) return data.list
  return []
}

const fetchArchives = async () => {
  loadingArchives.value = true
  try {
    const res = await archiveService.getExports()
    archives.value = normalizeListData(res?.data)
  } catch (error) {
    archives.value = []
    ElMessage.error(error?.message || '获取归档列表失败')
  } finally {
    loadingArchives.value = false
  }
}

const fetchAnnouncements = async () => {
  loadingAnnouncements.value = true
  try {
    const res = await announcementService.getAnnouncements()
    announcements.value = normalizeListData(res?.data)
  } catch (error) {
    announcements.value = []
    ElMessage.error(error?.message || '获取公示列表失败')
  } finally {
    loadingAnnouncements.value = false
  }
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', { hour12: false })
}

const formatRange = (startAt, endAt) => {
  if (!startAt && !endAt) return '-'
  return `${formatDateTime(startAt)} ~ ${formatDateTime(endAt)}`
}

const formatScope = (row) => {
  const scope = row?.scope || {}
  const grade = scope.grade ?? row?.grade
  const classIds = scope.class_ids || row?.class_ids
  const gradeText = grade ? `${grade}级` : '-'
  const classText = Array.isArray(classIds) && classIds.length ? `${classIds.join(',')}班` : '全年级'
  return `${gradeText} / ${classText}`
}

const isAnnouncementClosed = (row) => {
  if (!row) return false
  if (row.status && ['closed', 'inactive', 'ended'].includes(row.status)) return true
  if (row.end_at) {
    const endTime = new Date(row.end_at).getTime()
    return Number.isFinite(endTime) && endTime < Date.now()
  }
  return false
}

const getAnnouncementStatusText = (row) => {
  if (!row) return '-'
  if (row.status) return row.status
  return isAnnouncementClosed(row) ? '已结束' : '进行中'
}

const getAnnouncementTagType = (row) => {
  if (isAnnouncementClosed(row)) return 'info'
  return 'success'
}

const normalizeNumber = (value) => {
  const num = Number(value)
  if (!Number.isInteger(num) || num <= 0) return null
  return num
}

const normalizeClassIds = (values) => {
  if (!Array.isArray(values)) return []
  const result = []
  values.forEach((item) => {
    const num = normalizeNumber(item)
    if (num && !result.includes(num)) result.push(num)
  })
  return result
}

const resolveDateRange = () => {
  const startDate = form.startAt ? new Date(form.startAt) : null
  const endDate = form.endAt ? new Date(form.endAt) : null
  if (!startDate || !endDate) return { startAt: null, endAt: null }
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { startAt: null, endAt: null }
  }
  return { startAt: startDate.toISOString(), endAt: endDate.toISOString() }
}


const disableStartDate = (time) => {
  if (!form.endAt) return false
  const endDate = new Date(form.endAt)
  if (Number.isNaN(endDate.getTime())) return false
  return time.getTime() > endDate.getTime()
}

const disableEndDate = (time) => {
  if (!form.startAt) return false
  const startDate = new Date(form.startAt)
  if (Number.isNaN(startDate.getTime())) return false
  return time.getTime() <= startDate.getTime()
}

const disableEndTime = (date) => {
  if (!form.startAt || !date) return {}
  const startDate = new Date(form.startAt)
  if (Number.isNaN(startDate.getTime())) return {}

  const sameDay =
    date.getFullYear() === startDate.getFullYear() &&
    date.getMonth() === startDate.getMonth() &&
    date.getDate() === startDate.getDate()

  if (!sameDay) return {}

  const startHour = startDate.getHours()
  const startMinute = startDate.getMinutes()
  const startSecond = startDate.getSeconds()

  return {
    disabledHours: () => Array.from({ length: startHour + 1 }, (_, i) => i),
    disabledMinutes: (hour) => {
      if (hour !== startHour) return []
      return Array.from({ length: startMinute + 1 }, (_, i) => i)
    },
    disabledSeconds: (hour, minute) => {
      if (hour !== startHour || minute !== startMinute) return []
      return Array.from({ length: startSecond + 1 }, (_, i) => i)
    },
  }
}

const resetForm = () => {
  form.title = ''
  form.archive_id = ''
  form.grade = ''
  form.classIds = []
  form.startAt = null
  form.endAt = null
  form.showFields = []
  editingId.value = null
}

const openCreateDialog = (archive) => {
  dialogMode.value = 'create'
  resetForm()
  if (archive) {
    form.archive_id = String(archive.archive_id)
    if (archive.grade) form.grade = String(archive.grade)
    if (Array.isArray(archive.class_ids)) {
      form.classIds = archive.class_ids.map((id) => String(id))
    }
    if (archive.archive_name) form.title = `${archive.archive_name}公示`
  }
  dialogVisible.value = true
}

const openEditDialog = (announcement) => {
  if (!announcement) return
  dialogMode.value = 'edit'
  resetForm()
  editingId.value = announcement.id || announcement.announcement_id || null
  form.title = announcement.title || ''
  form.archive_id = announcement.archive_id || ''
  const scope = announcement.scope || {}
  const grade = scope.grade ?? announcement.grade
  form.grade = grade ? String(grade) : ''
  const classIds = scope.class_ids || announcement.class_ids
  form.classIds = Array.isArray(classIds) ? classIds.map((id) => String(id)) : []
  form.startAt = announcement.start_at ? new Date(announcement.start_at) : null
  form.endAt = announcement.end_at ? new Date(announcement.end_at) : null
  form.showFields = Array.isArray(announcement.show_fields) ? [...announcement.show_fields] : []
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
}

const buildPayload = () => {
  const title = form.title.trim()
  if (!title) {
    ElMessage.error('请输入公示标题')
    return null
  }

  const grade = normalizeNumber(form.grade)
  if (!grade) {
    ElMessage.error('年级不合法')
    return null
  }

  const classIds = normalizeClassIds(form.classIds)
  const { startAt, endAt } = resolveDateRange()
  if (!startAt || !endAt) {
    ElMessage.error('请设置开始与结束时间')
    return null
  }

  if (new Date(startAt).getTime() >= new Date(endAt).getTime()) {
    ElMessage.error('结束时间需晚于开始时间')
    return null
  }

  if (!Array.isArray(form.showFields) || !form.showFields.length) {
    ElMessage.error('请选择展示字段')
    return null
  }

  return {
    title,
    archive_id: form.archive_id,
    scope: {
      grade,
      ...(classIds.length ? { class_ids: classIds } : {}),
    },
    start_at: startAt,
    end_at: endAt,
    show_fields: [...form.showFields],
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  const payload = buildPayload()
  if (!payload) return

  saving.value = true
  try {
    if (dialogMode.value === 'edit' && editingId.value) {
      await announcementService.updateAnnouncement(editingId.value, payload)
    } else {
      await announcementService.createAnnouncement(payload)
    }
    ElMessage.success(dialogMode.value === 'edit' ? '公示已更新' : '公示已发布')
    dialogVisible.value = false
    await fetchAnnouncements()
    await fetchArchives()
  } catch (error) {
    ElMessage.error(error?.message || '操作失败')
  } finally {
    saving.value = false
  }
}

const handleDownload = (archive) => {
  if (!archive) return
  const url = archive.download_url || archiveService.getDownloadUrl(archive.archive_id)
  if (!url) {
    ElMessage.warning('下载地址不可用')
    return
  }
  window.open(url, '_blank', 'noopener')
}

const handleClose = async (announcement) => {
  const targetId = announcement?.id || announcement?.announcement_id
  if (!targetId) return
  try {
    await ElMessageBox.confirm('确定关闭该公示吗？', '提示', { type: 'warning' })
    await announcementService.closeAnnouncement(targetId)
    ElMessage.success('公示已关闭')
    await fetchAnnouncements()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '关闭失败')
    }
  }
}

const handleDelete = async (announcement) => {
  const targetId = announcement?.id || announcement?.announcement_id
  if (!targetId) return
  try {
    await ElMessageBox.confirm('删除后不可恢复，确认删除吗？', '提示', { type: 'warning' })
    await announcementService.deleteAnnouncement(targetId)
    ElMessage.success('公示已删除')
    await fetchAnnouncements()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '删除失败')
    }
  }
}

watch(
  () => form.archive_id,
  (next) => {
    if (!next) return
    const archive = archives.value.find((item) => String(item.archive_id) === String(next))
    if (!archive) return
    if (!form.grade && archive.grade) form.grade = String(archive.grade)
    if (!form.classIds.length && Array.isArray(archive.class_ids)) {
      form.classIds = archive.class_ids.map((id) => String(id))
    }
  }
)

onMounted(() => {
  fetchArchives()
  fetchAnnouncements()
})
</script>

<style scoped>
.teacher-archive-page {
  width: 100%;
  min-height: 70vh;
  font-size: clamp(16px, 1.4vw, 20px);
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 0 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.page-title {
  margin: 16px 0 24px 60px;
  font-size: clamp(24px, 2.2vw, 32px);
  font-weight: 700;
  flex-shrink: 0;
}

.archive-card {
  flex: 1;
  width: 100%;
  border: none;
  box-shadow: none;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.archive-card :deep(.el-card__body) {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  padding: 16px 24px 12px 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dcdfe6;
}

.section-header h3 {
  margin: 0;
  font-size: clamp(18px, 1.4vw, 22px);
  font-weight: 700;
}

.section-spacing {
  margin-top: 24px;
  border-top: 1px solid #dcdfe6;
}

.teacher-archive-page :deep(.el-table) {
  font-size: clamp(14px, 1.1vw, 18px);
}

.teacher-archive-page :deep(.el-table th) {
  background-color: #f5f7fa;
}

.teacher-archive-page :deep(.el-button) {
  font-size: clamp(14px, 1.1vw, 18px);
}

.submit-button {
  background-color: #b71c1c;
  border-color: #b71c1c;
  color: #fff;
}

.submit-button:hover {
  background-color: #a31818;
  border-color: #a31818;
}

.refresh-button {
  color: #b71c1c;
}

@media (max-width: 900px) {
  .teacher-archive-page {
    max-width: 100%;
    padding: 0 8px;
  }

  .page-title {
    margin: 12px 0 20px 24px;
  }

  .section-header {
    padding: 12px 16px;
  }
}

@media (max-width: 640px) {
  .page-title {
    margin: 12px 0 16px 16px;
  }

  .section-header {
    padding: 12px 12px;
  }
}
</style>
