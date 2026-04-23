<template>
  <div class="page-container teacher-archive-page">
    <div class="table-toolbar">
      <div class="toolbar-left">
        <h2>归档列表</h2>
      </div>
      <div class="toolbar-right">
        <el-button class="btn-plain" @click="fetchArchives">刷新</el-button>
        <el-select
          v-model="archiveFilters.announced"
          placeholder="公示状态"
          clearable
          style="width: 140px"
        >
          <el-option label="已公示" value="announced" />
          <el-option label="未公示" value="pending" />
        </el-select>
        <el-select
          v-model="archiveFilters.grade"
          placeholder="年级"
          clearable
          style="width: 120px"
        >
          <el-option v-for="item in gradeOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-input
          v-model.trim="archiveFilters.keyword"
          placeholder="搜索学期/年级/归档名称"
          clearable
          style="width: 220px"
        />
      </div>
    </div>

    <el-table
      :data="paginatedArchives"
      border
      stripe
      v-loading="loadingArchives"
      empty-text="暂无归档记录"
      :height="archiveTableHeight"
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

    <div class="table-toolbar">
      <div class="toolbar-left">
        <h2>公示管理</h2>
      </div>
      <div class="toolbar-right">
        <el-button class="btn-main" @click="openCreateDialog(null)">新建公示</el-button>
        <el-date-picker
          v-model="announcementFilters.dateRange"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          unlink-panels
          clearable
          style="width: 260px"
        />
        <el-select
          v-model="announcementFilters.status"
          placeholder="状态"
          clearable
          style="width: 120px"
        >
          <el-option label="进行中" value="active" />
          <el-option label="已关闭" value="closed" />
        </el-select>
        <el-select
          v-model="announcementFilters.grade"
          placeholder="年级"
          clearable
          style="width: 120px"
        >
          <el-option v-for="item in gradeOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-input
          v-model.trim="announcementFilters.keyword"
          placeholder="搜索标题/年级/班级"
          clearable
          style="width: 220px"
        />
      </div>
    </div>

    <el-table
      :data="paginatedAnnouncements"
      border
      stripe
      v-loading="loadingAnnouncements"
      empty-text="暂无公示记录"
      :height="announcementTableHeight"
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
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button
            link
            :type="isAnnouncementActive(row) ? 'warning' : 'success'"
            @click="isAnnouncementActive(row) ? handleClose(row) : handleReopen(row)"
          >
            {{ isAnnouncementActive(row) ? '关闭' : '启用' }}
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :width="dialogWidth"
      class="announcement-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-width="dialogLabelWidth"
        :label-position="dialogLabelPosition"
      >
        <el-form-item label="公示标题" prop="title">
          <el-input
            v-model.trim="form.title"
            maxlength="50"
            show-word-limit
            placeholder="请输入公示标题"
          />
        </el-form-item>
        <el-form-item label="归档记录" prop="archive_id">
          <el-select
            v-model="form.archive_id"
            filterable
            clearable
            placeholder="请选择归档记录"
            style="width: 100%"
          >
            <el-option
              v-for="item in archiveOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select
            v-model="form.grade"
            clearable
            placeholder="请选择年级"
            style="width: 100%"
          >
            <el-option v-for="item in gradeOptions" :key="item" :label="`${item}级`" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级范围">
          <el-select
            v-model="form.classIds"
            multiple
            filterable
            clearable
            collapse-tags
            collapse-tags-tooltip
            placeholder="不选默认全年级"
            style="width: 100%"
          >
            <el-option
              v-for="item in classOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startAt">
          <el-date-picker
            v-model="form.startAt"
            type="datetime"
            placeholder="请选择开始时间"
            style="width: 100%"
            :disabled-date="disableStartDate"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endAt">
          <el-date-picker
            v-model="form.endAt"
            type="datetime"
            placeholder="请选择结束时间"
            style="width: 100%"
            :disabled-date="disableEndDate"
            :disabled-time="disableEndTime"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer-row">
          <el-button class="btn-plain" @click="closeDialog">返回</el-button>
          <el-button class="btn-main" :loading="saving" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import archiveService from '@/services/archiveService'
import announcementService from '@/services/announcementService'
import { CLASSMAP } from '@/utils/classMap'

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
})

const rules = {
  title: [{ required: true, message: '请输入公示标题', trigger: 'blur' }],
  archive_id: [{ required: true, message: '请选择归档记录', trigger: 'change' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  startAt: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endAt: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
}

const archiveFilters = reactive({
  keyword: '',
  grade: '',
  announced: '',
})

const announcementFilters = reactive({
  keyword: '',
  grade: '',
  status: '',
  dateRange: [],
})

const archivePagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

const announcementPagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

const windowWidth = ref(typeof window === 'undefined' ? 1200 : window.innerWidth)
const windowHeight = ref(typeof window === 'undefined' ? 900 : window.innerHeight)

const updateWindowSize = () => {
  if (typeof window === 'undefined') return
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

const dialogTitle = computed(() => (dialogMode.value === 'edit' ? '编辑公示' : '新建公示'))
const dialogWidth = computed(() => {
  if (windowWidth.value < 640) return '94vw'
  if (windowWidth.value < 900) return '88vw'
  return '720px'
})
const dialogLabelWidth = computed(() => (windowWidth.value < 640 ? '90px' : '110px'))
const dialogLabelPosition = computed(() => (windowWidth.value < 640 ? 'top' : 'left'))

const archiveTableHeight = computed(() =>
  Math.max(260, Math.min(420, Math.round(windowHeight.value * 0.32)))
)
const announcementTableHeight = computed(() =>
  Math.max(300, Math.min(520, Math.round(windowHeight.value * 0.4)))
)

const archiveOptions = computed(() =>
  archives.value.map((item) => ({
    label: item.archive_name || item.archive_id,
    value: item.archive_id,
  }))
)

const gradeOptions = computed(() => {
  const set = new Set()
  CLASSMAP.forEach((item) => {
    if (item?.grade) set.add(String(item.grade))
  })
  archives.value.forEach((item) => {
    if (item?.grade) set.add(String(item.grade))
  })
  announcements.value.forEach((item) => {
    const scopeGrade = item?.scope?.grade ?? item?.grade
    if (scopeGrade) set.add(String(scopeGrade))
  })
  return Array.from(set).sort((a, b) => Number(a) - Number(b))
})

const classOptions = computed(() => {
  if (!form.grade) {
    return CLASSMAP.map((item) => ({
      label: item.label,
      value: String(item.class_id),
      grade: String(item.grade),
    }))
  }

  return CLASSMAP
    .filter((item) => String(item.grade) === String(form.grade))
    .map((item) => ({
      label: item.label,
      value: String(item.class_id),
      grade: String(item.grade),
    }))
})

const filteredAnnouncements = computed(() => {
  const list = announcements.value
  const keyword = announcementFilters.keyword.trim().toLowerCase()
  const gradeFilter = announcementFilters.grade
  const statusFilter = announcementFilters.status
  const [rangeStart, rangeEnd] = Array.isArray(announcementFilters.dateRange)
    ? announcementFilters.dateRange
    : []

  return list.filter((item) => {
    const scope = item?.scope || {}
    const rowGrade = scope.grade ?? item?.grade
    const rowClassIds = scope.class_ids || item?.class_ids || []

    if (gradeFilter && String(rowGrade) !== String(gradeFilter)) return false

    if (statusFilter) {
      const active = isAnnouncementActive(item)
      if (statusFilter === 'active' && !active) return false
      if (statusFilter === 'closed' && active) return false
    }

    if (rangeStart && rangeEnd) {
      const startTime = new Date(rangeStart).getTime()
      const endTime = new Date(rangeEnd).getTime()
      const rowStart = item?.start_at ? new Date(item.start_at).getTime() : null
      const rowEnd = item?.end_at ? new Date(item.end_at).getTime() : null
      if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return true
      if (!Number.isFinite(rowStart) || !Number.isFinite(rowEnd)) return false
      if (rowEnd < startTime || rowStart > endTime) return false
    }

    if (keyword) {
      const fields = [
        item?.title,
        item?.archive_id,
        rowGrade ? `${rowGrade}` : '',
        Array.isArray(rowClassIds) ? rowClassIds.join(',') : '',
      ]
      const haystack = fields.filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(keyword)) return false
    }

    return true
  })
})

const filteredArchives = computed(() => {
  const keyword = archiveFilters.keyword.trim().toLowerCase()
  return archives.value.filter((item) => {
    if (archiveFilters.grade && String(item?.grade) !== String(archiveFilters.grade)) return false
    if (archiveFilters.announced) {
      const isAnnounced = Boolean(item?.is_announced)
      if (archiveFilters.announced === 'announced' && !isAnnounced) return false
      if (archiveFilters.announced === 'pending' && isAnnounced) return false
    }
    if (keyword) {
      const fields = [item?.archive_name, item?.archive_id, item?.term, item?.grade]
      const haystack = fields.filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(keyword)) return false
    }
    return true
  })
})

const paginatedArchives = computed(() => {
  const start = (archivePagination.page - 1) * archivePagination.size
  return filteredArchives.value.slice(start, start + archivePagination.size)
})

const paginatedAnnouncements = computed(() => {
  const start = (announcementPagination.page - 1) * announcementPagination.size
  return filteredAnnouncements.value.slice(start, start + announcementPagination.size)
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

const isAnnouncementActive = (row) => String(row?.status || '').toLowerCase() === 'active'

const getAnnouncementStatusText = (row) => {
  if (!row) return '-'
  return isAnnouncementActive(row) ? '进行中' : '已关闭'
}

const getAnnouncementTagType = (row) => (isAnnouncementActive(row) ? 'success' : 'info')

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

  if (!form.archive_id) {
    ElMessage.error('请选择归档记录')
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
    ElMessage.error('结束时间必须晚于开始时间')
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
    await Promise.all([fetchAnnouncements(), fetchArchives()])
  } catch (error) {
    ElMessage.error(error?.message || '操作失败')
  } finally {
    saving.value = false
  }
}

const handleDownload = (archive) => {
  if (!archive) return
  const archiveId = archive.archive_id
  if (!archiveId) {
    ElMessage.warning('下载地址不可用')
    return
  }
  archiveService.downloadArchiveFile(archiveId, archive.archive_name).catch((error) => {
    ElMessage.error(error?.message || '下载归档文件失败')
  })
}

const handleClose = async (announcement) => {
  const targetId = announcement?.id || announcement?.announcement_id
  if (!targetId) return
  try {
    await ElMessageBox.confirm('确认关闭该公示吗？', '提示', { type: 'warning' })
    await announcementService.closeAnnouncement(targetId)
    ElMessage.success('公示已关闭')
    await fetchAnnouncements()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '关闭失败')
    }
  }
}

const handleReopen = async (announcement) => {
  const targetId = announcement?.id || announcement?.announcement_id
  if (!targetId) return
  try {
    await ElMessageBox.confirm('确认启用该公示吗？', '提示', { type: 'warning' })
    await announcementService.reopenAnnouncement(targetId)
    ElMessage.success('公示已启用')
    await fetchAnnouncements()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '启用失败')
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

watch(
  archiveFilters,
  () => {
    archivePagination.page = 1
  },
  { deep: true }
)

watch(
  announcementFilters,
  () => {
    announcementPagination.page = 1
  },
  { deep: true }
)

watch(
  () => filteredArchives.value.length,
  (total) => {
    archivePagination.total = total
    const maxPage = Math.max(1, Math.ceil(total / archivePagination.size))
    if (archivePagination.page > maxPage) archivePagination.page = 1
  },
  { immediate: true }
)

watch(
  () => filteredAnnouncements.value.length,
  (total) => {
    announcementPagination.total = total
    const maxPage = Math.max(1, Math.ceil(total / announcementPagination.size))
    if (announcementPagination.page > maxPage) announcementPagination.page = 1
  },
  { immediate: true }
)

onMounted(() => {
  updateWindowSize()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateWindowSize)
  }
  fetchArchives()
  fetchAnnouncements()
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateWindowSize)
  }
})
</script>

<style scoped>
</style>
