<template>
  <div class="page-container admin-dashboard-page">
    <header class="page-header">
      <h2>管理员首页</h2>
    </header>

    <el-row :gutter="12" class="metrics">
      <el-col :xs="12" :sm="6">
        <el-card>服务状态：{{ healthStatus }}</el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>系统配置项：{{ configCount }}</el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>奖项字典：{{ awardCount }}</el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>账号总数：{{ userTotal }}</el-card>
      </el-col>
    </el-row>

    <el-card class="section-card">
      <template #header>账号管理</template>
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="76px"
        class="user-form"
      >
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="账号" prop="account">
              <el-input v-model.trim="userForm.account" placeholder="4-32位" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="姓名" prop="name">
              <el-input v-model.trim="userForm.name" placeholder="姓名" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="密码" prop="password">
              <el-input v-model="userForm.password" type="password" show-password placeholder="至少6位" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="角色" prop="role">
              <el-select v-model="userForm.role" class="full-width">
                <el-option label="学生" value="student" />
                <el-option label="教师" value="teacher" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="班级" prop="class_id">
              <el-select
                v-model="userForm.class_id"
                class="full-width"
                :disabled="userForm.role !== 'student'"
                clearable
              >
                <el-option v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="审核员">
              <el-switch v-model="userForm.is_reviewer" :disabled="userForm.role !== 'student'" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="激活码" prop="reviewer_token">
              <el-input
                v-model.trim="userForm.reviewer_token"
                :disabled="userForm.role !== 'student' || !userForm.is_reviewer"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model.trim="userForm.email" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model.trim="userForm.phone" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label=" ">
              <el-button class="btn-main" :loading="creatingUser" @click="handleCreateUser">创建账号</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-table :data="userRows" size="small" border stripe empty-text="暂无账号">
        <el-table-column prop="account" label="账号" min-width="130" show-overflow-tooltip />
        <el-table-column prop="name" label="姓名" min-width="120" show-overflow-tooltip />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">{{ roleLabel(row.role) }}</template>
        </el-table-column>
        <el-table-column prop="class_id" label="班级" width="100" />
        <el-table-column label="审核员" width="90">
          <template #default="{ row }">{{ row.is_reviewer ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :disabled="row.role === 'admin'" @click="openEditDialog(row)">修改</el-button>
            <el-button link type="danger" :disabled="row.role === 'admin'" @click="handleDeleteUser(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="section-card">
      <template #header>最近系统日志（10条）</template>
      <el-table :data="logs" size="small" border stripe>
        <el-table-column prop="action" label="动作" min-width="180" show-overflow-tooltip />
        <el-table-column prop="target_type" label="目标类型" width="120" />
        <el-table-column prop="target_id" label="目标ID" min-width="120" show-overflow-tooltip />
        <el-table-column label="时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="editDialogVisible" title="修改账号" width="720px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="76px">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12">
            <el-form-item label="账号" prop="account">
              <el-input v-model.trim="editForm.account" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model.trim="editForm.name" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="新密码" prop="password">
              <el-input v-model="editForm.password" type="password" show-password placeholder="不填则不修改" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="editForm.role" class="full-width">
                <el-option label="学生" value="student" />
                <el-option label="教师" value="teacher" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="班级" prop="class_id">
              <el-select
                v-model="editForm.class_id"
                class="full-width"
                :disabled="editForm.role !== 'student'"
                clearable
              >
                <el-option v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="审核员">
              <el-switch v-model="editForm.is_reviewer" :disabled="editForm.role !== 'student'" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="激活码" prop="reviewer_token">
              <el-input
                v-model.trim="editForm.reviewer_token"
                :disabled="editForm.role !== 'student' || !editForm.is_reviewer"
                placeholder="新增/更换审核员身份时填写"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model.trim="editForm.email" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model.trim="editForm.phone" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="updatingUser" @click="handleUpdateUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import systemService from '@/services/systemService'
import classService from '@/services/classService'
import { CLASSMAP } from '@/utils/classMap'

const health = ref({})
const configs = ref({})
const awardDicts = ref([])
const logs = ref([])
const logTotal = ref(0)
const userRows = ref([])
const userTotal = ref(0)
const classOptions = ref(CLASSMAP)
const userFormRef = ref(null)
const editFormRef = ref(null)
const creatingUser = ref(false)
const updatingUser = ref(false)
const editDialogVisible = ref(false)
const editingOriginalReviewer = ref(false)

const healthStatus = computed(() => health.value?.status || 'unknown')
const configCount = computed(() => Object.keys(configs.value || {}).length)
const awardCount = computed(() => awardDicts.value.length)
const userForm = reactive({
  account: '',
  name: '',
  password: '',
  role: 'student',
  class_id: null,
  is_reviewer: false,
  reviewer_token: '',
  email: '',
  phone: '',
})

const editForm = reactive({
  id: null,
  account: '',
  name: '',
  password: '',
  role: 'student',
  class_id: null,
  is_reviewer: false,
  reviewer_token: '',
  email: '',
  phone: '',
})

const roleLabelMap = {
  admin: '管理员',
  teacher: '教师',
  student: '学生',
}

const roleLabel = (role) => roleLabelMap[role] || role || '-'

watch(
  () => userForm.role,
  (role) => {
    if (role !== 'student') {
      userForm.class_id = null
      userForm.is_reviewer = false
      userForm.reviewer_token = ''
    }
  }
)

watch(
  () => editForm.role,
  (role) => {
    if (role !== 'student') {
      editForm.class_id = null
      editForm.is_reviewer = false
      editForm.reviewer_token = ''
    }
  }
)

watch(
  () => userForm.is_reviewer,
  (enabled) => {
    if (!enabled) userForm.reviewer_token = ''
  }
)

watch(
  () => editForm.is_reviewer,
  (enabled) => {
    if (!enabled) editForm.reviewer_token = ''
  }
)

const validateClassId = (_rule, value, callback) => {
  if (userForm.role === 'student' && !value) {
    callback(new Error('请选择班级'))
    return
  }
  callback()
}

const validateEditClassId = (_rule, value, callback) => {
  if (editForm.role === 'student' && !value) {
    callback(new Error('请选择班级'))
    return
  }
  callback()
}

const validateReviewerToken = (_rule, value, callback) => {
  if (userForm.role === 'student' && userForm.is_reviewer && !String(value || '').trim()) {
    callback(new Error('请输入激活码'))
    return
  }
  callback()
}

const validateEditReviewerToken = (_rule, value, callback) => {
  if (
    editForm.role === 'student' &&
    editForm.is_reviewer &&
    !editingOriginalReviewer.value &&
    !String(value || '').trim()
  ) {
    callback(new Error('新增审核员身份必须填写激活码'))
    return
  }
  callback()
}

const validateOptionalPassword = (_rule, value, callback) => {
  if (value && (String(value).length < 6 || String(value).length > 64)) {
    callback(new Error('密码长度需在 6-64 位'))
    return
  }
  callback()
}

const userRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 32, message: '账号长度需在 4-32 位', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 1, max: 64, message: '姓名长度需在 1-64 位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 64, message: '密码长度需在 6-64 位', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  class_id: [{ validator: validateClassId, trigger: 'change' }],
  reviewer_token: [{ validator: validateReviewerToken, trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  phone: [{ max: 20, message: '手机号长度不能超过20位', trigger: 'blur' }],
}

const editRules = {
  account: userRules.account,
  name: userRules.name,
  password: [{ validator: validateOptionalPassword, trigger: 'blur' }],
  role: userRules.role,
  class_id: [{ validator: validateEditClassId, trigger: 'change' }],
  reviewer_token: [{ validator: validateEditReviewerToken, trigger: 'blur' }],
  email: userRules.email,
  phone: userRules.phone,
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleString('zh-CN', { hour12: false })
}

const fetchDashboard = async () => {
  try {
    const [healthRes, configRes, awardRes, logRes, userRes, classRows] = await Promise.all([
      systemService.getApiHealth(),
      systemService.getConfigs(),
      systemService.getAwardDicts(),
      systemService.getLogs({ page: 1, size: 10 }),
      systemService.getUsers({ page: 1, size: 10 }),
      classService.getClasses().catch(() => CLASSMAP),
    ])

    health.value = healthRes?.data || {}
    configs.value = configRes?.data || {}
    awardDicts.value = Array.isArray(awardRes?.data) ? awardRes.data : []
    logs.value = Array.isArray(logRes?.data?.list) ? logRes.data.list : []
    logTotal.value = Number(logRes?.data?.total || 0)
    userRows.value = Array.isArray(userRes?.data?.list) ? userRes.data.list : []
    userTotal.value = Number(userRes?.data?.total || 0)
    classOptions.value = Array.isArray(classRows) && classRows.length ? classRows : CLASSMAP
  } catch (error) {
    ElMessage.error(error?.message || '获取管理员首页数据失败')
  }
}

const resetUserForm = () => {
  Object.assign(userForm, {
    account: '',
    name: '',
    password: '',
    role: 'student',
    class_id: null,
    is_reviewer: false,
    reviewer_token: '',
    email: '',
    phone: '',
  })
  userFormRef.value?.clearValidate()
}

const handleCreateUser = async () => {
  if (!userFormRef.value) return
  try {
    await userFormRef.value.validate()
  } catch {
    return
  }
  creatingUser.value = true
  try {
    await systemService.createUser({
      account: userForm.account.trim(),
      password: userForm.password,
      name: userForm.name.trim(),
      role: userForm.role,
      class_id: userForm.role === 'student' ? userForm.class_id : null,
      is_reviewer: userForm.role === 'student' ? userForm.is_reviewer : false,
      reviewer_token:
        userForm.role === 'student' && userForm.is_reviewer ? userForm.reviewer_token.trim() : null,
      email: userForm.email.trim() || null,
      phone: userForm.phone.trim() || null,
    })
    ElMessage.success('账号已创建')
    resetUserForm()
    await fetchDashboard()
  } catch (error) {
    ElMessage.error(error?.message || '创建账号失败')
  } finally {
    creatingUser.value = false
  }
}

const openEditDialog = (row) => {
  editingOriginalReviewer.value = Boolean(row?.is_reviewer)
  Object.assign(editForm, {
    id: row.id,
    account: row.account || '',
    name: row.name || '',
    password: '',
    role: row.role === 'teacher' ? 'teacher' : 'student',
    class_id: row.role === 'student' ? row.class_id || null : null,
    is_reviewer: Boolean(row.is_reviewer),
    reviewer_token: '',
    email: row.email || '',
    phone: row.phone || '',
  })
  editDialogVisible.value = true
  editFormRef.value?.clearValidate()
}

const handleUpdateUser = async () => {
  if (!editFormRef.value || !editForm.id) return
  try {
    await editFormRef.value.validate()
  } catch {
    return
  }
  updatingUser.value = true
  try {
    const payload = {
      account: editForm.account.trim(),
      name: editForm.name.trim(),
      role: editForm.role,
      class_id: editForm.role === 'student' ? editForm.class_id : null,
      is_reviewer: editForm.role === 'student' ? editForm.is_reviewer : false,
      reviewer_token:
        editForm.role === 'student' && editForm.is_reviewer && editForm.reviewer_token.trim()
          ? editForm.reviewer_token.trim()
          : null,
      email: editForm.email.trim() || null,
      phone: editForm.phone.trim() || null,
    }
    if (editForm.password) payload.password = editForm.password
    await systemService.updateUser(editForm.id, payload)
    ElMessage.success('账号已更新')
    editDialogVisible.value = false
    await fetchDashboard()
  } catch (error) {
    ElMessage.error(error?.message || '更新账号失败')
  } finally {
    updatingUser.value = false
  }
}

const handleDeleteUser = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除账号「${row.account}」？删除后该账号将无法登录。`, '删除账号', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await systemService.deleteUser(row.id)
    ElMessage.success('账号已删除')
    await fetchDashboard()
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(error?.message || '删除账号失败')
  }
}

onMounted(fetchDashboard)
</script>

<style scoped>
.metrics {
  margin-bottom: 12px;
}

.section-card {
  margin-top: 12px;
}

.user-form {
  margin-bottom: 8px;
}

.full-width {
  width: 100%;
}
</style>
