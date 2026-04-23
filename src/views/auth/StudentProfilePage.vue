<template>
  <div class="page-container student-profile-page">
    <header class="page-header">
      <h2>个人信息</h2>
    </header>

    <el-form :model="profileForm" label-width="90px" class="profile-form">
      <el-form-item label="姓名">
        <el-input v-model="profileForm.name" disabled />
      </el-form-item>
      <el-form-item label="学号">
        <el-input v-model="profileForm.account" disabled />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model.trim="profileForm.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model.trim="profileForm.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="savingProfile" @click="handleSaveProfile">提交</el-button>
      </el-form-item>
    </el-form>

    <header class="page-header token-header">
      <h2>审核人令牌</h2>
    </header>

    <div class="table-toolbar">
      <div class="toolbar-left">
        <el-tag :type="isReviewer ? 'success' : 'info'">
          {{ isReviewer ? '已启用审核权限' : '未启用审核权限' }}
        </el-tag>
      </div>
      <div class="toolbar-right">
        <el-button class="btn-main" @click="openBindDialog">绑定令牌</el-button>
        <el-button class="btn-plain" @click="fetchTokens">刷新</el-button>
      </div>
    </div>

    <div class="table-block">
      <el-table :data="tokenRows" v-loading="loadingTokens" border stripe empty-text="暂无已绑定令牌">
        <el-table-column prop="token" label="令牌" min-width="240" />
        <el-table-column label="审核权限范围" min-width="200">
          <template #default="{ row }">
            {{ renderClassScope(row.class_ids) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="过期时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.expired_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="handleUnbind(row)">解绑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="bindDialogVisible" title="绑定令牌" width="460px">
      <el-form :model="bindForm" label-width="80px">
        <el-form-item label="令牌">
          <el-input v-model.trim="bindForm.token" placeholder="请输入教师发放的令牌" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bindDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="bindingToken" @click="submitBindToken">绑定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CLASSMAP } from '@/utils/classMap'
import { useAuthStore } from '@/stores/auth'
import tokenService from '@/services/tokenService'

const authStore = useAuthStore()

const savingProfile = ref(false)
const loadingTokens = ref(false)
const bindingToken = ref(false)
const bindDialogVisible = ref(false)

const tokenRows = ref([])

const profileForm = reactive({
  name: '',
  account: '',
  email: '',
  phone: '',
})

const bindForm = reactive({
  token: '',
})

const isReviewer = computed(() => Boolean(authStore.user?.is_reviewer))

const fillProfile = (user) => {
  profileForm.name = user?.name || ''
  profileForm.account = user?.account || ''
  profileForm.email = user?.email || ''
  profileForm.phone = user?.phone || ''
}

const fetchProfile = async () => {
  try {
    const user = await authStore.fetchCurrentUser()
    fillProfile(user)
  } catch (error) {
    ElMessage.error(error?.message || '加载个人信息失败')
  }
}

const fetchTokens = async () => {
  loadingTokens.value = true
  try {
    const res = await tokenService.getList({ type: 'reviewer', page: 1, size: 100 })
    const data = res?.data || {}
    tokenRows.value = Array.isArray(data.list) ? data.list : []
  } catch (error) {
    tokenRows.value = []
    ElMessage.error(error?.message || '加载令牌列表失败')
  } finally {
    loadingTokens.value = false
  }
}

const handleSaveProfile = async () => {
  savingProfile.value = true
  try {
    const latestUser = await authStore.updateProfile({
      email: profileForm.email,
      phone: profileForm.phone,
    })
    fillProfile(latestUser)
    ElMessage.success('个人信息已更新')
  } catch (error) {
    ElMessage.error(error?.message || '个人信息更新失败')
  } finally {
    savingProfile.value = false
  }
}

const openBindDialog = () => {
  bindForm.token = ''
  bindDialogVisible.value = true
}

const submitBindToken = async () => {
  if (!bindForm.token) {
    ElMessage.warning('请输入令牌')
    return
  }
  bindingToken.value = true
  try {
    await tokenService.activateReviewerToken(bindForm.token)
    await fetchProfile()
    await fetchTokens()
    bindDialogVisible.value = false
    ElMessage.success('令牌绑定成功')
  } catch (error) {
    ElMessage.error(error?.message || '令牌绑定失败')
  } finally {
    bindingToken.value = false
  }
}

const handleUnbind = async (row) => {
  const tokenId = row?.id || row?.token_id
  if (!tokenId) return
  try {
    await ElMessageBox.confirm('确认解绑该令牌吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await tokenService.unbindToken(tokenId)
    await fetchProfile()
    await fetchTokens()
    ElMessage.success('已解绑')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '解绑失败')
    }
  }
}

const renderClassScope = (classIds = []) => {
  if (!Array.isArray(classIds) || !classIds.length) return '-'
  return classIds
    .map((id) => CLASSMAP.find((item) => Number(item.class_id) === Number(id))?.label || `${id}班`)
    .join('、')
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleString('zh-CN', { hour12: false })
}

onMounted(async () => {
  await fetchProfile()
  await fetchTokens()
})
</script>

<style scoped>
.student-profile-page {
  width: 100%;
  box-sizing: border-box;
}

.token-header {
  margin-top: 20px;
}
</style>
