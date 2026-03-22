<template>
  <div class="page-container teacher-export-page">
    <header class="page-header">
      <h2>导出</h2>
    </header>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="export-form"
    >
      <el-form-item label="年级" prop="grade">
        <el-select
          v-model="form.grade"
          filterable
          placeholder="请选择年级"
          style="width: min(320px, 100%)"
        >
          <el-option
            v-for="item in gradeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
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
    <el-form-item>
      <el-button class="btn-main" :loading="submitting" @click="handleSubmit">
        提交
      </el-button>
      <el-button class="btn-plain" @click="handleBack">返回</el-button>
      <div v-if="taskId" class="task-id">任务 ID：{{ taskId }}</div>
    </el-form-item>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import archiveService from '@/services/archiveService'
import { CLASSMAP } from '@/utils/classMap'

const router = useRouter()

const formRef = ref()
const submitting = ref(false)
const taskId = ref('')

// 根据 CLASSMAP 生成年级/班级选项
const gradeOptions = computed(() => {
  const set = new Map()
  CLASSMAP.forEach((item) => {
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
  return CLASSMAP.filter((item) => Number(item.grade) === Number(form.grade))
})

// 表单：grade 为数字；classId 为单个 class_id（数字或 null）
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
      scope: 'applications',
      format: 'xlsx',
      filters: {
        grade,
        ...(classId ? { class_id: classId } : {}),
      },
      store_to_archive: form.storeToArchive,
    }

    const res = await archiveService.createExport(payload)
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
.form-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}

.task-id {
  color: #606266;
  font-size: 14px;
}
</style>
