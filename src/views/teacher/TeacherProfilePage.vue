<template>
  <div class="teacher-profile-page">
    <el-card class="profile-card">
      <template #header>
        <span>个人信息</span>
      </template>

      <el-form :model="profileForm" label-width="80px" class="profile-form">
        <el-form-item label="姓名">
          <el-input v-model="profileForm.name" disabled />
        </el-form-item>

        <el-form-item label="工号">
          <el-input v-model="profileForm.account" disabled />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model.trim="profileForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="savingProfile" @click="handleSaveProfile">
            提交
          </el-button>
          <el-button @click="handleBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const savingProfile = ref(false)

const profileForm = reactive({
  name: '',
  account: '',
  email: '',
})

watch(
  () => authStore.user,
  (value) => {
    const user = value || {}
    profileForm.name = user.name || ''
    profileForm.account = user.account || ''
    profileForm.email = user.email || ''
  },
  { immediate: true }
)

const handleSaveProfile = async () => {
  savingProfile.value = true
  try {
    await authStore.updateProfile({
      email: profileForm.email,
    })
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    ElMessage.error(error?.message || '个人信息更新失败')
  } finally {
    savingProfile.value = false
  }
}

const handleBack = () => {
  router.back()
}
</script>

<style scoped>
.teacher-profile-page {
  max-width: 720px;
}
</style>
