<template>
  <div class="teacher-export-page">
    <h2 class="page-title">导出</h2>

    <el-card class="export-card">
      <!-- 表单区域 -->
      <el-form ref="formRef" :model="form" :rules="rules" label-width="6em" class="export-form">
        <el-form-item label="年级" prop="grade" class="form-row table-row">
          <el-select
            v-model="form.grade"
            filterable
            allow-create
            default-first-option
            placeholder="请选择年级"
            style="width: min(320px, 100%)"
          >
            <el-option v-for="item in gradeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="班级" class="form-row table-row">
          <el-select
            v-model="form.classIds"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="多选，含“全部”"
            style="width: min(320px, 100%)"
          >
            <el-option label="全部" value="all" />
          </el-select>
          <span class="form-tip">不选或选“全部”代表全年级</span>
        </el-form-item>

        <el-form-item label="状态" class="form-row table-row">
          <el-radio-group v-model="form.status" :disabled="form.onlyArchived">
            <el-radio value="approved">通过</el-radio>
            <el-radio value="rejected">拒绝</el-radio>
            <el-radio value="pending_review">待审核</el-radio>
            <el-radio value="archived">已归档</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否归档" class="form-row table-row">
          <el-switch v-model="form.onlyArchived" @change="handleArchivedToggle" />
        </el-form-item>
      </el-form>
      <div class="actions-section">
        <div class="actions">
          <el-button class="submit-button" :loading="submitting" @click="handleSubmit">提交</el-button>
          <el-button class="back-button" @click="handleBack">返回</el-button>
        </div>
        <div v-if="taskId" class="task-id">任务 ID：{{ taskId }}</div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import teacherService from '@/services/teacherService'

const router = useRouter()

const formRef = ref()
const submitting = ref(false)
const taskId = ref('')

const gradeOptions = ref([])

const form = reactive({
  grade: null,
  classIds: ['all'],
  status: 'approved',
  onlyArchived: false,
})

const previousStatus = ref(form.status)

const rules = {
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
}

const handleBack = () => {
  router.back()
}

const handleArchivedToggle = (value) => {
  if (value) {
    previousStatus.value = form.status
    form.status = 'archived'
    return
  }

  form.status = previousStatus.value || 'approved'
}

const normalizeClassId = (raw) => {
  if (!raw || raw === 'all') return null
  const n = Number(raw)
  if (!Number.isInteger(n) || n <= 0) return null
  return n
}

const handleSubmit = async () => {
  taskId.value = ''
  if (!formRef.value) return

  try {
    submitting.value = true
    await formRef.value.validate()

    const grade = Number(form.grade)
    if (!Number.isInteger(grade) || grade <= 0) {
      ElMessage.error('年级不合法')
      return
    }

    const selectedClassIds = Array.isArray(form.classIds) ? form.classIds : []
    const classId =
      selectedClassIds.includes('all') || selectedClassIds.length !== 1
        ? null
        : normalizeClassId(selectedClassIds[0])

    const status = form.onlyArchived ? 'archived' : form.status

    const payload = {
      scope: 'applications',
      format: 'xlsx',
      filters: {
        grade,
        ...(classId ? { class_id: classId } : {}),
        ...(status ? { status } : {}),
      },
    }

    const res = await teacherService.createExport(payload)
    const createdTaskId = res?.data?.task_id
    if (!createdTaskId) {
      ElMessage.error('导出任务创建失败')
      return
    }

    taskId.value = createdTaskId
    ElMessage.success('导出任务已创建')
  } catch (e) {
    ElMessage.error(e?.message || '请求失败')
  } finally {
    submitting.value = false
  }
}
</script>
<style scoped>
.teacher-export-page {
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

.export-card {
  flex: 1;
  width: 100%;
  border: none;
  box-shadow: none;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.export-card :deep(.el-card__body) {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.export-form {
  border: 1px solid #dcdfe6;
  flex: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.form-row {
  margin: 0;
  padding: 0 24px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  flex: 1;
  box-sizing: border-box;
}

.export-form .form-row:last-of-type {
  border-bottom: none;
}

.table-row {
  border-left: none;
  border-right: none;
  background-color: #ffffff;
}

.export-form :deep(.el-form-item__label) {
  text-align: left;
  font-size: clamp(16px, 1.2vw, 20px);
}

.form-tip {
  margin-left: 12px;
  color: #909399;
  font-size: clamp(12px, 1vw, 16px);
}

.teacher-export-page :deep(.el-input__inner),
.teacher-export-page :deep(.el-select__wrapper),
.teacher-export-page :deep(.el-radio__label),
.teacher-export-page :deep(.el-switch__label) {
  font-size: clamp(16px, 1.2vw, 20px);
}

.teacher-export-page :deep(.el-button) {
  font-size: clamp(16px, 1.2vw, 22px);
  padding: 10px 22px;
}

.actions-section {
  padding: 20px 16px 20px 60px;
  background-color: transparent;
  flex-shrink: 0;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
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

.back-button {
  background-color: #fff;
  border-color: #fff;
  color: #b71c1c;
}

.back-button:hover {
  background-color: #f2f2f2;
}

.teacher-export-page :deep(.el-radio.is-checked .el-radio__label) {
  color: #b71c1c;
}

.teacher-export-page :deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: #b71c1c;
  background-color: #b71c1c;
}

.teacher-export-page :deep(.el-switch.is-checked .el-switch__core) {
  border-color: #b71c1c;
  background-color: #b71c1c;
}

.task-id {
  margin-top: 12px;
  color: #606266;
  font-size: clamp(14px, 1.1vw, 18px);
}

@media (max-width: 900px) {
  .teacher-export-page {
    max-width: 100%;
    padding: 0 8px;
  }

  .page-title {
    margin: 12px 0 20px 24px;
  }

  .form-row {
    padding: 0 16px;
  }

  .actions-section {
    padding: 16px 12px 16px 24px;
  }
}

@media (max-width: 640px) {
  .page-title {
    margin: 12px 0 16px 16px;
  }

  .form-row {
    padding: 12px 12px;
  }

  .actions-section {
    padding: 12px 12px 16px 16px;
  }
}
</style>
