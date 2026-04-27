<template>
  <div class="page-container class-management-page">
    <header class="page-header">
      <h2>班级管理</h2>
    </header>

    <el-card class="section-card">
      <template #header>{{ editingClassId ? '修改班级' : '创建班级' }}</template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
        <el-row :gutter="12">
          <el-col v-if="editingClassId" :xs="24" :sm="8">
            <el-form-item label="班级编号" prop="class_id">
              <el-input-number
                v-model="form.class_id"
                :min="1"
                :precision="0"
                :disabled="Boolean(editingClassId)"
                controls-position="right"
                class="full-width"
              />
            </el-form-item>
          </el-col>
          <el-col v-else :xs="24" :sm="8">
            <el-form-item label="班级编号">
              <el-input :model-value="nextClassIdText" disabled />
              <div class="form-tip">创建时自动分配最小可用编号，从 1 开始。</div>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="年级" prop="grade">
              <el-input-number v-model="form.grade" :min="2000" :max="2100" :precision="0" controls-position="right" class="full-width" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="名称" prop="name">
              <el-input v-model.trim="form.name" placeholder="如 2025级 501班" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="启用">
              <el-switch v-model="form.is_active" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="16">
            <el-form-item label=" ">
              <el-button type="primary" :loading="saving" @click="saveClass">
                {{ editingClassId ? '保存修改' : '创建班级' }}
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="section-card">
      <template #header>班级列表</template>
      <el-table :data="rows" v-loading="loading" border stripe empty-text="暂无班级">
        <el-table-column prop="class_id" label="班级编号" width="120" />
        <el-table-column prop="grade" label="年级" width="120" />
        <el-table-column prop="name" label="名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'" size="small">
              {{ row.is_active ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="毕业年级" width="120">
          <template #default="{ row }">{{ row.is_graduating ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="editClass(row)">修改</el-button>
            <el-button link type="danger" @click="removeClass(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import classService from '@/services/classService'

const rows = ref([])
const loading = ref(false)
const saving = ref(false)
const editingClassId = ref(null)
const formRef = ref(null)

const form = reactive({
  class_id: null,
  grade: new Date().getFullYear(),
  name: '',
  is_active: true,
})

const rules = {
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }],
  name: [{ max: 64, message: '名称不能超过64个字符', trigger: 'blur' }],
}

const nextClassIdText = computed(() => {
  const used = new Set(rows.value.map((item) => Number(item.class_id)).filter((value) => Number.isInteger(value) && value > 0))
  let next = 1
  while (used.has(next)) next += 1
  return `系统将分配：${next}`
})

const loadClasses = async () => {
  loading.value = true
  try {
    rows.value = await classService.getClasses()
  } catch (error) {
    ElMessage.error(error?.message || '获取班级失败')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  editingClassId.value = null
  Object.assign(form, {
    class_id: null,
    grade: new Date().getFullYear(),
    name: '',
    is_active: true,
  })
  formRef.value?.clearValidate()
}

const editClass = (row) => {
  editingClassId.value = row.class_id
  Object.assign(form, {
    class_id: row.class_id,
    grade: row.grade,
    name: row.name || row.label || '',
    is_active: Boolean(row.is_active),
  })
  formRef.value?.clearValidate()
}

const saveClass = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  saving.value = true
  try {
    const payload = {
      grade: form.grade,
      name: form.name || null,
      is_active: form.is_active,
    }
    if (editingClassId.value) {
      await classService.updateClass(editingClassId.value, {
        grade: payload.grade,
        name: payload.name,
        is_active: payload.is_active,
      })
      ElMessage.success('班级已更新')
    } else {
      await classService.createClass({
        ...payload,
        class_id: null,
      })
      ElMessage.success('班级已创建')
    }
    resetForm()
    await loadClasses()
  } catch (error) {
    ElMessage.error(error?.message || '保存班级失败')
  } finally {
    saving.value = false
  }
}

const removeClass = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除「${row.name || row.label}」？`, '删除班级', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await classService.deleteClass(row.class_id)
    ElMessage.success('班级已删除')
    await loadClasses()
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(error?.message || '删除班级失败')
  }
}

onMounted(loadClasses)
</script>

<style scoped>
.class-management-page {
  width: 100%;
}

.section-card + .section-card {
  margin-top: 16px;
}

.full-width {
  width: 100%;
}

.form-tip {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}
</style>
