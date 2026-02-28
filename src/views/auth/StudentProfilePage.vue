<template>
  <div class="student-profile-page">
    <el-card class="profile-card">
      <template #header>
        <span>个人信息</span>
      </template>

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
          <el-button type="primary" :loading="savingProfile" @click="handleSaveProfile">
            提交
          </el-button>
          <el-button @click="handleBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="token-card">
      <template #header>
        <span>绑定审核人令牌</span>
      </template>

      <el-form :model="tokenForm" label-width="90px" class="token-form">
        <el-form-item label="当前状态">
          <el-tag :type="isReviewer ? 'success' : 'info'">
            {{ isReviewer ? '已绑定审核权限' : '未绑定' }}
          </el-tag>
        </el-form-item>

        <el-form-item label="令牌">
          <el-input v-model.trim="tokenForm.token" placeholder="请输入教师发放的审核令牌" :disabled="isReviewer" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="bindingToken" :disabled="isReviewer" @click="handleBindToken">
            绑定令牌
          </el-button>
          <span v-if="isReviewer" class="token-hint">
            你已具备审核人身份，可在顶部切换到审核人视图。
          </span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { computed, reactive, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const savingProfile = ref(false)
const bindingToken = ref(false)

const isReviewer = computed(() => authStore.isReviewer)

const profileForm = reactive({
  name: '',
  account: '',
  email: '',
  phone: '',
})

const tokenForm = reactive({
  token: '',
})

// 页面加载时主动获取用户信息
const fetchAndInitProfile = async () => {
  try {
    const user = await authStore.fetchCurrentUser()
    profileForm.name = user.name || ''
    profileForm.account = user.account || ''
    profileForm.email = user.email || ''
    profileForm.phone = user.phone || ''
  } catch (error) {
    ElMessage.error('加载用户信息失败，请稍后重试')
  }
}

onMounted(() => {
  fetchAndInitProfile()
})

const handleSaveProfile = async () => {
  savingProfile.value = true
  try {
    await authStore.updateProfile({
      email: profileForm.email,
      phone: profileForm.phone,
    })
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    ElMessage.error(error?.message || '个人信息更新失败')
  } finally {
    savingProfile.value = false
  }
}

const handleBindToken = async () => {
  if (!tokenForm.token) {
    ElMessage.warning('请先输入令牌')
    return
  }

  bindingToken.value = true
  try {
    await authStore.bindReviewerToken(tokenForm.token)
    tokenForm.token = ''
    ElMessage.success('令牌绑定成功')
  } catch (error) {
    ElMessage.error(error?.message || '令牌绑定失败')
  } finally {
    bindingToken.value = false
  }
}

const handleBack = () => {
  router.back()
}
</script>

<style scoped>
.student-profile-page {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 760px;
}

.token-hint {
  margin-left: 12px;
  color: #606266;
  font-size: 13px;
}

@media (max-width: 768px) {
  .student-profile-page {
    max-width: 100%;
  }
}
</style>
