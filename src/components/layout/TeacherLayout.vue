<template>
  <el-container class="layout">
    <el-header class="layout-header">
      <div class="header-left">
        <img src="@/assets/logo.jpg" alt="山东大学综测评分" height="100%" />
      </div>
      <div class="header-right">
        <el-menu mode="horizontal" class="header-menu" :ellipsis="false">
          <el-menu-item index="/teacher/announcement" @click="go('/teacher/announcement')">
            公示
          </el-menu-item>
          <el-sub-menu index="user-menu">
            <template #title>
              <span>{{ user.name || user.account }}</span>
            </template>
            <el-menu-item index="/teacher/profile" @click="go('/teacher/profile')">
              个人信息
            </el-menu-item>
            <el-menu-item index="logout" @click="handleLogout">
              注销
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
    </el-header>
    <el-container>
      <el-aside class="layout-sidebar">
        <el-menu class="sidebar-menu" :default-active="activeMenu">
          <el-menu-item index="/teacher/dashboard" @click="go('/teacher/dashboard')">
            教师首页
          </el-menu-item>
          <el-menu-item index="/teacher/appeals" @click="go('/teacher/appeals')">
            申诉列表
          </el-menu-item>
          <el-menu-item index="/teacher/tokens" @click="go('/teacher/tokens')">
            令牌管理
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const user = computed(() => authStore.user)
const activeMenu = computed(() => route.path)

const go = (path) => {
  router.push(path)
}

const handleLogout = () => {
  router.push({ name: 'Login' })
  authStore.logout()
}
</script>
