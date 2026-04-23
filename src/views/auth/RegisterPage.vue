<template>
  <div class="register-page">
    <h1>注册</h1>
    <el-card class="register-form">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="账号" prop="account">
          <el-input v-model="form.account" placeholder="请输入账号（4-32位）" />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码（至少6位）"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入密码"
          />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" class="full-width">
            <el-option label="学生" :value="ROLES.STUDENT" />
            <el-option label="教师" :value="ROLES.TEACHER" />
            <el-option label="管理员" :value="ROLES.ADMIN" />
          </el-select>
        </el-form-item>

        <el-form-item label="班级" prop="class_id">
          <el-select
            v-model="form.class_id"
            class="full-width"
            :disabled="!isStudentRole"
            clearable
            placeholder="学生角色必填"
          >
            <el-option v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="审核员身份" prop="is_reviewer">
          <el-switch v-model="form.is_reviewer" :disabled="!isStudentRole" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="可选，如 zhangsan@example.com" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="可选，如 13800000000" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="full-width" :loading="submitting" @click="onSubmit">
            注册
          </el-button>
        </el-form-item>

        <div class="login-link">
          <el-button link type="primary" @click="router.push({ name: 'Login' })">已有账号？去登录</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/utils/constants'
import { CLASSMAP } from '@/utils/classMap'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  account: '',
  name: '',
  password: '',
  confirmPassword: '',
  role: ROLES.STUDENT,
  class_id: null,
  is_reviewer: false,
  email: '',
  phone: '',
})

const classOptions = CLASSMAP
const isStudentRole = computed(() => form.role === ROLES.STUDENT)

watch(
  () => form.role,
  (role) => {
    if (role !== ROLES.STUDENT) {
      form.class_id = null
      form.is_reviewer = false
    }
  }
)

const validateConfirmPassword = (_rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
    return
  }
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const validateClassId = (_rule, value, callback) => {
  if (isStudentRole.value && !value) {
    callback(new Error('学生角色必须选择班级'))
    return
  }
  callback()
}

const rules = {
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
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  class_id: [{ validator: validateClassId, trigger: 'change' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  phone: [{ max: 20, message: '手机号长度不能超过20位', trigger: 'blur' }],
}

const onSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const payload = {
      account: form.account.trim(),
      password: form.password,
      name: form.name.trim(),
      role: form.role,
      class_id: isStudentRole.value ? form.class_id : null,
      is_reviewer: isStudentRole.value ? form.is_reviewer : false,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
    }

    await authStore.register(payload)
    ElMessage.success('注册成功，请登录')
    await router.push({ name: 'Login', query: { account: payload.account } })
  } catch (error) {
    console.error('Register failed:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.register-form {
  width: 460px;
  max-width: calc(100vw - 24px);
}

.full-width {
  width: 100%;
}

.login-link {
  text-align: center;
  margin-top: 8px;
}
</style>
