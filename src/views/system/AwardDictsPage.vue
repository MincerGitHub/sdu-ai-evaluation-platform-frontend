<template>
  <div class="page-container award-dicts-page">
    <header class="page-header">
      <h2>奖项字典</h2>
    </header>

    <div class="table-toolbar">
      <div class="toolbar-left" />
      <div class="toolbar-right">
        <el-button class="btn-main" @click="openCreateDialog">新增奖项</el-button>
        <el-button class="btn-plain" @click="resetFilters">重置</el-button>
        <el-button class="btn-main" @click="fetchAwardDicts">筛选</el-button>
        <el-select v-model="filters.active" placeholder="启用状态" clearable style="width: 140px">
          <el-option label="启用" :value="true" />
          <el-option label="停用" :value="false" />
        </el-select>
        <el-input
          v-model.trim="filters.keyword"
          placeholder="搜索奖项名/类别/UID"
          clearable
          style="width: 240px"
          @keyup.enter="fetchAwardDicts"
        />
      </div>
    </div>

    <div class="table-block">
      <el-table :data="filteredRows" border stripe v-loading="loading" empty-text="暂无奖项字典">
        <el-table-column prop="award_uid" label="UID" width="110" />
        <el-table-column prop="award_name" label="奖项名称" min-width="260" show-overflow-tooltip />
        <el-table-column prop="category" label="category" width="140" />
        <el-table-column prop="sub_type" label="sub_type" width="140" />
        <el-table-column prop="score" label="分值" width="100" />
        <el-table-column prop="max_score" label="上限分" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'" size="small">
              {{ row.is_active ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="award_uid" prop="award_uid">
          <el-input-number
            v-model="form.award_uid"
            :disabled="dialogMode === 'edit'"
            :min="1"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="奖项名称" prop="award_name">
          <el-input v-model.trim="form.award_name" maxlength="255" show-word-limit />
        </el-form-item>
        <el-form-item label="category">
          <el-input v-model.trim="form.category" maxlength="32" placeholder="可选" />
        </el-form-item>
        <el-form-item label="sub_type">
          <el-input v-model.trim="form.sub_type" maxlength="64" placeholder="可选" />
        </el-form-item>
        <el-form-item label="score" prop="score">
          <el-input-number v-model="form.score" :min="0" :precision="2" :step="0.5" style="width: 100%" />
        </el-form-item>
        <el-form-item label="max_score" prop="max_score">
          <el-input-number v-model="form.max_score" :min="0" :precision="2" :step="0.5" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="dialogMode === 'edit'" label="启用状态">
          <el-switch v-model="form.is_active" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer-row">
          <el-button class="btn-plain" @click="dialogVisible = false">取消</el-button>
          <el-button class="btn-main" :loading="saving" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import systemService from '@/services/systemService'

const loading = ref(false)
const saving = ref(false)
const rows = ref([])

const filters = reactive({
  keyword: '',
  active: null,
})

const dialogVisible = ref(false)
const dialogMode = ref('create')
const editingId = ref(null)
const formRef = ref(null)

const form = reactive({
  award_uid: 1,
  award_name: '',
  category: '',
  sub_type: '',
  score: 0,
  max_score: 0,
  is_active: true,
})

const rules = {
  award_uid: [{ required: true, message: '请输入 award_uid', trigger: 'change' }],
  award_name: [{ required: true, message: '请输入奖项名称', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分值', trigger: 'change' }],
  max_score: [{ required: true, message: '请输入上限分', trigger: 'change' }],
}

const dialogTitle = computed(() => (dialogMode.value === 'edit' ? '编辑奖项' : '新增奖项'))

const filteredRows = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()
  return rows.value.filter((item) => {
    if (filters.active !== null && Boolean(item.is_active) !== Boolean(filters.active)) return false
    if (!keyword) return true
    const fields = [item.award_name, item.category, item.sub_type, item.award_uid]
    const haystack = fields.filter((v) => v !== null && v !== undefined).join(' ').toLowerCase()
    return haystack.includes(keyword)
  })
})

const resetForm = () => {
  form.award_uid = 1
  form.award_name = ''
  form.category = ''
  form.sub_type = ''
  form.score = 0
  form.max_score = 0
  form.is_active = true
  editingId.value = null
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  dialogMode.value = 'edit'
  editingId.value = row.id
  form.award_uid = row.award_uid
  form.award_name = row.award_name || ''
  form.category = row.category || ''
  form.sub_type = row.sub_type || ''
  form.score = Number(row.score || 0)
  form.max_score = Number(row.max_score || 0)
  form.is_active = Boolean(row.is_active)
  dialogVisible.value = true
}

const fetchAwardDicts = async () => {
  loading.value = true
  try {
    const res = await systemService.getAwardDicts()
    rows.value = Array.isArray(res?.data) ? res.data : []
  } catch (error) {
    rows.value = []
    ElMessage.error(error?.message || '获取奖项字典失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.keyword = ''
  filters.active = null
  fetchAwardDicts()
}

const buildPayload = () => ({
  award_uid: Number(form.award_uid),
  award_name: form.award_name.trim(),
  category: form.category.trim() || null,
  sub_type: form.sub_type.trim() || null,
  score: Number(form.score),
  max_score: Number(form.max_score),
  ...(dialogMode.value === 'edit' ? { is_active: Boolean(form.is_active) } : {}),
})

const submitForm = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  const payload = buildPayload()
  if (payload.score > payload.max_score) {
    ElMessage.warning('score 不能大于 max_score')
    return
  }

  saving.value = true
  try {
    if (dialogMode.value === 'edit' && editingId.value) {
      const updatePayload = {
        award_name: payload.award_name,
        category: payload.category,
        sub_type: payload.sub_type,
        score: payload.score,
        max_score: payload.max_score,
        is_active: payload.is_active,
      }
      await systemService.updateAwardDict(editingId.value, updatePayload)
    } else {
      await systemService.createAwardDict(payload)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    await fetchAwardDicts()
  } catch (error) {
    ElMessage.error(error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除奖项「${row.award_name}」？`, '删除确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await systemService.deleteAwardDict(row.id)
    ElMessage.success('删除成功')
    await fetchAwardDicts()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '删除失败')
    }
  }
}

onMounted(fetchAwardDicts)
</script>

<style scoped>
</style>
