<template>
  <el-container class="layout">
    <el-header class="layout-header">
      <div class="header-left">
        <img src="@/assets/logo.jpg" alt="山东大学综测评分" height="100%" />
      </div>
      <div class="header-right">
        <el-menu mode="horizontal" class="header-menu" :ellipsis="false">
          <el-menu-item index="/admin/announcement" @click="go('/admin/announcement')">
            公示
          </el-menu-item>
          <el-sub-menu index="user-menu">
            <template #title>
              <span>{{ user.name || user.account }}</span>
            </template>
            <el-menu-item index="/admin/profile" @click="go('/admin/profile')">
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
          <el-menu-item index="/admin/dashboard" @click="go('/admin/dashboard')">
            管理员首页
          </el-menu-item>
          <el-menu-item index="/system/config" @click="go('/system/config')">
            系统配置
          </el-menu-item>
          <el-menu-item index="/system/logs" @click="go('/system/logs')">
            系统日志
          </el-menu-item>
          <el-menu-item index="/system/award-dicts" @click="go('/system/award-dicts')">
            奖项字典
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
