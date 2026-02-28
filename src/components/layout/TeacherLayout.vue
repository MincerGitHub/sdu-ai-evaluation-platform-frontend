<template>
  <el-container class="layout">
    <el-header class="layout-header">
      <div class="header-left">
        <img src="@/assets/logo.jpg" alt="山东大学综测评分" height="100%" />
      </div>
      <div class="header-right">
        <el-menu mode="horizontal" class="header-menu" :ellipsis="false" router>
          <el-menu-item index="appeals">
            申诉
          </el-menu-item>
          <el-menu-item index="/announcement">
            公示
          </el-menu-item>
          <el-sub-menu index="user-menu">
            <template #title>
              <span>{{ user.name || user.account }}</span>
            </template>
            <el-menu-item index="/teacher/profile">
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
        <el-menu class="sidebar-menu" :default-active="activeMenu" router>
          <el-menu-item index="/teacher/dashboard">
            教师首页
          </el-menu-item>
          <!-- 身心素养 -->
          <el-sub-menu index="physical_mental">
            <template #title>身心素养（上限15分）</template>
            <el-menu-item index="/teacher/application/physical_mental/basic">
              基础性评价（上限9分）
            </el-menu-item>
            <el-menu-item index="/teacher/application/physical_mental/achievement">
              成果性评价（上限6分）
            </el-menu-item>
          </el-sub-menu>

          <!-- 文艺素养 -->
          <el-sub-menu index="art">
            <template #title>文艺素养（上限15分）</template>
            <el-menu-item index="/teacher/application/art/basic">
              基础性评价（上限9分）
            </el-menu-item>
            <el-menu-item index="/teacher/application/art/achievement">
              成果性评价（上限6分）
            </el-menu-item>
          </el-sub-menu>

          <!-- 劳动素养 -->
          <el-sub-menu index="labor">
            <template #title>劳动素养（上限25分）</template>
            <el-menu-item index="/teacher/application/labor/basic">
              基础性评价（上限15分）
            </el-menu-item>
            <el-menu-item index="/teacher/application/labor/achievement">
              成果性评价（上限10分）
            </el-menu-item>
          </el-sub-menu>

          <!-- 创新素养 -->
          <el-sub-menu index="innovation">
            <template #title>创新素养（上限45分）</template>
            <el-menu-item index="/teacher/application/innovation/basic">
              基础素养（上限5分）
            </el-menu-item>
            <el-menu-item index="/teacher/application/innovation/achievement">
              突破提升（上限40分）
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/teacher/tokens">
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

const handleLogout = () => {
  router.push({ name: 'Login' })
  authStore.logout()
}

</script>
