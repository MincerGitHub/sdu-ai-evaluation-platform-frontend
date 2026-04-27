<template>
  <div class="page-container teacher-export-page">
    <header class="page-header">
      <h2>导出</h2>
    </header>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="export-form">
      <el-form-item label="年级" prop="grade">
        <el-select
          v-model="form.grade"
          filterable
          placeholder="请选择年级"
          style="width: min(320px, 100%)"
        >
          <el-option v-for="item in gradeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="班级">
        <el-select
          v-model="form.classId"
          :disabled="!form.grade"
          filterable
          clearable
          placeholder="不选代表全年级"
          style="width: min(320px, 100%)"
        >
          <el-option
            v-for="item in classOptions"
            :key="item.class_id"
            :label="item.label"
            :value="item.class_id"
          />
        </el-select>
        <span class="form-tip">不选代表全年级</span>
      </el-form-item>

      <el-form-item label="是否归档">
        <el-switch v-model="form.storeToArchive" />
      </el-form-item>
    </el-form>

    <section class="export-preview">
      <div class="preview-header">
        <div>
          <h3>导出预览</h3>
          <span class="preview-meta">
            共 {{ previewSummary.studentCount }} 名学生，官方总分合计 {{ formatScore(previewSummary.totalScore) }}
          </span>
        </div>
        <el-button class="btn-plain" :disabled="!form.grade" :loading="previewLoading" @click="fetchPreview">
          刷新预览
        </el-button>
      </div>
      <el-table
        :data="previewRows"
        border
        stripe
        size="small"
        v-loading="previewLoading"
        :empty-text="previewEmptyText"
      >
        <el-table-column prop="class_id" label="班级" width="100" />
        <el-table-column prop="student_account" label="学号" width="150" />
        <el-table-column prop="student_name" label="姓名" width="130" show-overflow-tooltip />
        <el-table-column prop="total_count" label="申报数" width="100" align="center" />
        <el-table-column label="官方总分" width="120" align="center">
          <template #default="{ row }">{{ formatScore(row.actual_score ?? row.total_score) }}</template>
        </el-table-column>
        <el-table-column label="原始总分" width="120" align="center">
          <template #default="{ row }">{{ formatScore(row.raw_total_score) }}</template>
        </el-table-column>
        <el-table-column label="成果额外分" width="120" align="center">
          <template #default="{ row }">{{ formatScore(row.overflow_score) }}</template>
        </el-table-column>
        <el-table-column label="平均分" width="120" align="center">
          <template #default="{ row }">{{ formatScore(row.average_score) }}</template>
        </el-table-column>
      </el-table>
    </section>

    <el-form-item>
      <el-button class="btn-main" :loading="submitting" @click="handleSubmit">提交</el-button>
      <el-button class="btn-plain" @click="handleBack">返回</el-button>
      <div v-if="taskId" class="task-id">
        <div>任务 ID：{{ taskId }}</div>
        <div v-if="taskStatus">状态：{{ taskStatus }}</div>
        <div v-if="taskError" class="task-error">失败原因：{{ taskError }}</div>
        <el-button v-if="downloadUrl" link type="primary" @click="openDownload">下载导出文件</el-button>
      </div>
    </el-form-item>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import teacherService from '@/services/teacherService'
import statisticService from '@/services/statisticService'
import classService from '@/services/classService'
import { CLASSMAP } from '@/utils/classMap'

const router = useRouter()

const formRef = ref()
const submitting = ref(false)
const taskId = ref('')
const taskStatus = ref('')
const taskError = ref('')
const downloadUrl = ref('')
const downloadFileName = ref('')
const classRows = ref(CLASSMAP)
const previewRows = ref([])
const previewLoading = ref(false)
const previewLoaded = ref(false)

const gradeOptions = computed(() => {
  const set = new Map()
  classRows.value.forEach((item) => {
    if (!set.has(item.grade)) {
      set.set(item.grade, {
        value: item.grade,
        label: `${item.grade}级`,
      })
    }
  })
  return Array.from(set.values())
})

const classOptions = computed(() => {
  if (!form.grade) return []
  return classRows.value.filter((item) => Number(item.grade) === Number(form.grade))
})

const previewSummary = computed(() => {
  const totalScore = previewRows.value.reduce((sum, row) => sum + Number(row.actual_score ?? row.total_score ?? 0), 0)
  return {
    studentCount: previewRows.value.length,
    totalScore,
  }
})

const previewEmptyText = computed(() => {
  if (!form.grade) return '请选择年级后预览导出数据'
  if (previewLoading.value) return '正在加载预览数据'
  if (previewLoaded.value) return '当前年级暂无可导出的学生统计'
  return '请选择年级后预览导出数据'
})

const loadClasses = async () => {
  try {
    const rows = await classService.getClasses()
    if (rows.length) classRows.value = rows
  } catch {
    classRows.value = CLASSMAP
  }
}

const fetchPreview = async () => {
  if (!form.grade) {
    previewRows.value = []
    previewLoaded.value = false
    return
  }
  previewLoading.value = true
  try {
    const params = { grade: Number(form.grade) }
    if (form.classId) params.class_id = Number(form.classId)
    const res = await statisticService.getStudentStatistics(params)
    const payload = res?.data
    previewRows.value = Array.isArray(payload?.list) ? payload.list : Array.isArray(payload) ? payload : []
    previewLoaded.value = true
  } catch (error) {
    previewRows.value = []
    previewLoaded.value = true
    ElMessage.error(error?.message || '获取导出预览失败')
  } finally {
    previewLoading.value = false
  }
}

let previewTimer = 0

const schedulePreviewFetch = () => {
  if (previewTimer) window.clearTimeout(previewTimer)
  previewTimer = window.setTimeout(() => {
    previewTimer = 0
    fetchPreview()
  }, 80)
}

const handleGradeChange = () => {
  if (form.classId && !classOptions.value.some((item) => Number(item.class_id) === Number(form.classId))) {
    form.classId = null
  }
  previewLoaded.value = false
  schedulePreviewFetch()
}

const form = reactive({
  grade: null,
  classId: null,
  storeToArchive: false,
})

const rules = {
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
}

const handleBack = () => {
  router.back()
}

const handleSubmit = async () => {
  taskId.value = ''
  taskStatus.value = ''
  taskError.value = ''
  downloadUrl.value = ''
  downloadFileName.value = ''
  if (!formRef.value) return

  try {
    submitting.value = true
    await formRef.value.validate()

    const grade = Number(form.grade)
    if (!Number.isInteger(grade) || grade <= 0) {
      ElMessage.error('年级不合法')
      return
    }

    const classId = form.classId ? Number(form.classId) : null
    if (classId !== null && (!Number.isInteger(classId) || classId <= 0)) {
      ElMessage.error('班级不合法')
      return
    }

    const payload = {
      scope: 'teacher_statistics',
      format: 'xlsx',
      filters: {
        grade,
        ...(classId ? { class_id: classId } : {}),
      },
      store_to_archive: form.storeToArchive,
    }

    const res = await teacherService.createExport(payload)
    const createdTaskId = res?.data?.task_id
    if (!createdTaskId) {
      ElMessage.error('导出任务创建失败')
      return
    }

    taskId.value = createdTaskId
    taskStatus.value = 'queued'
    ElMessage.success('导出任务已创建')
    await pollTask(createdTaskId)
  } catch (error) {
    ElMessage.error(error?.message || '请求失败')
  } finally {
    submitting.value = false
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const pollTask = async (id) => {
  for (let i = 0; i < 30; i += 1) {
    try {
      const res = await teacherService.getExportTask(id)
      const data = res?.data || {}
      taskStatus.value = data.status || taskStatus.value || 'queued'
      taskError.value = data.error_message || ''

      if (data.status === 'completed') {
        downloadUrl.value = data.file_url || teacherService.getExportDownloadUrl(id)
        downloadFileName.value = data.file_name || `${id}.xlsx`
        ElMessage.success('导出任务已完成')
        return
      }

      if (data.status === 'failed') {
        ElMessage.error(data.error_message || '导出任务失败')
        return
      }
    } catch (error) {
      taskError.value = error?.message || '查询导出任务状态失败'
      ElMessage.error(taskError.value)
      return
    }
    await sleep(1000)
  }

  ElMessage.warning('导出任务仍在处理中，请稍后再查看')
}

const openDownload = () => {
  if (!taskId.value) return
  teacherService.downloadExportFile(taskId.value, downloadFileName.value).catch((error) => {
    ElMessage.error(error?.message || '下载导出文件失败')
  })
}

const formatScore = (value) => {
  const number = Number(value || 0)
  return Number.isInteger(number) ? String(number) : number.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
}

onMounted(async () => {
  await loadClasses()
  await fetchPreview()
})

watch(
  () => form.grade,
  () => {
    handleGradeChange()
  }
)

watch(
  () => form.classId,
  () => {
    previewLoaded.value = false
    schedulePreviewFetch()
  }
)
</script>

<style scoped>
.form-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}

.task-id {
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
}

.export-preview {
  margin: 18px 0;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.preview-header h3 {
  margin: 0 0 4px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.preview-meta {
  color: #606266;
  font-size: 13px;
}

.task-error {
  color: #f56c6c;
}
</style>
