<template>
  <div class="login-page">
    <h1>登录</h1>
    <el-card class="login-form">
      <el-form @submit.prevent="onSubmit" @keyup.enter.native="onSubmit">
        <el-form-item label="账号">
          <el-input v-model="account" placeholder="请输入账号" />
        </el-form-item>

        <el-form-item label="密码">
          <el-input v-model="password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="login-button" @click="onSubmit">
            登录
          </el-button>
        </el-form-item>

        <div v-if="error" class="error">{{ error }}</div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/utils/constants'

const authStore = useAuthStore()
const router = useRouter()

const account = ref('')
const password = ref('')
const error = ref('')

const onSubmit = async () => {
  error.value = ''
  if (!account.value || !password.value) {
    error.value = '请输入账号和密码'
    return
  }
  try {
    const data = await authStore.login({
      account: account.value,
      password: password.value,
    })

    const user = data.user
    const role = user?.role
    const isReviewer = !!user?.is_reviewer

    if (role === ROLES.ADMIN) {
      await router.push({ name: 'AdminDashboard' })
    } else if (role === ROLES.TEACHER) {
      await router.push({ name: 'TeacherDashboard' })
    } else if (role === ROLES.STUDENT && !isReviewer) {
      await router.push({ name: 'ReviewerDashboard' })
    } else {
      await router.push({ name: 'StudentDashboard' })
    }
  } catch (e) {
    console.error('Login failed:', e)
    error.value = '登录失败，请检查账号或密码'
  }
}

</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-form {
  width: 360px;
}

.login-button {
  width: 100%;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>