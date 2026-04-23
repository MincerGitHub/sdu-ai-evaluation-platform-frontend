<template>
  <div class="page-container system-config-page">
    <header class="page-header">
      <h2>系统配置</h2>
    </header>

    <div class="table-toolbar">
      <div class="toolbar-left" />
      <div class="toolbar-right">
        <el-button class="btn-main" @click="openCreateDialog">新增配置项</el-button>
        <el-button class="btn-plain" @click="fetchConfigs">刷新</el-button>
      </div>
    </div>

    <div class="table-block">
      <el-table :data="rows" border stripe v-loading="loading" empty-text="暂无系统配置">
        <el-table-column prop="config_key" label="配置键" min-width="180" />
        <el-table-column label="配置值" min-width="360">
          <template #default="{ row }">
            <pre class="config-json">{{ formatJson(row.config_value) }}</pre>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="配置键" prop="config_key">
          <el-input
            v-model.trim="form.config_key"
            :disabled="dialogMode === 'edit'"
            placeholder="例如：site"
          />
        </el-form-item>
        <el-form-item label="配置值" prop="config_value_text">
          <el-input
            v-model="form.config_value_text"
            type="textarea"
            :rows="10"
            placeholder='请输入 JSON，例如 {"allow_register":true}'
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model.trim="form.description" placeholder="可选" />
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
import { ElMessage } from 'element-plus'
import systemService from '@/services/systemService'

const loading = ref(false)
const saving = ref(false)
const rows = ref([])

const dialogVisible = ref(false)
const dialogMode = ref('create')
const formRef = ref(null)

const form = reactive({
  config_key: '',
  config_value_text: '{\n  \n}',
  description: '',
})

const rules = {
  config_key: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
  config_value_text: [{ required: true, message: '请输入 JSON 配置值', trigger: 'blur' }],
}

const dialogTitle = computed(() => (dialogMode.value === 'edit' ? '编辑配置' : '新增配置'))

const formatJson = (value) => {
  try {
    return JSON.stringify(value ?? {}, null, 2)
  } catch {
    return String(value ?? '')
  }
}

const parseJson = (text) => {
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch (error) {
    return { ok: false, error: error?.message || 'JSON 解析失败' }
  }
}

const resetForm = () => {
  form.config_key = ''
  form.config_value_text = '{\n  \n}'
  form.description = ''
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  dialogMode.value = 'edit'
  form.config_key = row.config_key
  form.config_value_text = formatJson(row.config_value)
  form.description = row.description || ''
  dialogVisible.value = true
}

const toRows = (configs) =>
  Object.entries(configs || {}).map(([config_key, config_value]) => ({
    config_key,
    config_value,
    description: '',
  }))

const fetchConfigs = async () => {
  loading.value = true
  try {
    const res = await systemService.getConfigs()
    rows.value = toRows(res?.data || {})
  } catch (error) {
    rows.value = []
    ElMessage.error(error?.message || '获取系统配置失败')
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  const parsed = parseJson(form.config_value_text)
  if (!parsed.ok) {
    ElMessage.error(`配置值 JSON 不合法：${parsed.error}`)
    return
  }

  saving.value = true
  try {
    await systemService.updateConfig({
      config_key: form.config_key,
      config_value: parsed.value,
      description: form.description || null,
    })
    ElMessage.success('系统配置保存成功')
    dialogVisible.value = false
    await fetchConfigs()
  } catch (error) {
    ElMessage.error(error?.message || '系统配置保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(fetchConfigs)
</script>

<style scoped>
.config-json {
  margin: 0;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
