<template>
  <el-container class="layout">
    <el-header class="layout-header">
      <!-- header -->
      <div class="header-left">
        <img src="@/assets/logo.jpg" alt="山东大学综测评分" height="100%" />
      </div>
      <div class="header-right">
        <el-menu mode="horizontal" class="header-menu" :ellipsis="false" router>
          <el-menu-item v-if="canUseReviewerView" index="toggle-view" @click="toggleViewMode">
            {{ isInReviewerView ? '切换到学生视图' : '切换到审核人视图' }}
          </el-menu-item>
          <el-menu-item index="appeals">
            申诉
          </el-menu-item>
          <el-menu-item index="announcements">
            公示
          </el-menu-item>
          <el-sub-menu>
            <template #title>
              <span>{{ user.name || user.account }}</span>
            </template>
            <el-menu-item index="user">
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
        <el-menu class="sidebar-menu" router>
          <!-- 身心素养 -->
          <el-sub-menu index="physical-mental">
            <template #title>身心素养（上限15分）</template>
            <el-menu-item index="physical-mental-basic">
              基础性评价（上限9分）
            </el-menu-item>
            <el-menu-item index="physical-mental-achievement">
              成果性评价（上限6分）
            </el-menu-item>
          </el-sub-menu>

          <!-- 文艺素养 -->
          <el-sub-menu index="art">
            <template #title>文艺素养（上限15分）</template>
            <el-menu-item index="art-basic">
              基础性评价（上限9分）
            </el-menu-item>
            <el-menu-item index="art-achievement">
              成果性评价（上限6分）
            </el-menu-item>
          </el-sub-menu>

          <!-- 劳动素养 -->
          <el-sub-menu index="labor">
            <template #title>劳动素养（上限25分）</template>
            <el-menu-item index="labor-basic">
              基础性评价（上限15分）
            </el-menu-item>
            <el-menu-item index="labor-achievement">
              成果性评价（上限10分）
            </el-menu-item>
          </el-sub-menu>

          <!-- 创新素养 -->
          <el-sub-menu index="innovation">
            <template #title>创新素养（上限45分）</template>
            <el-menu-item index="innovation-basic">
              基础素养（上限5分）
            </el-menu-item>
            <el-menu-item index="innovation-breakthrough">
              突破提升（上限40分）
            </el-menu-item>
          </el-sub-menu>

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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'


const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)

const canUseReviewerView = computed(() => authStore.canUseReviewerView)
const isInReviewerView = computed(() => authStore.isInReviewerView)

const toggleViewMode = async () => {
  if (!canUseReviewerView.value) return

  if (isInReviewerView.value) {
    // 当前是审核人视图 -> 切回学生视图
    authStore.setViewMode('student')
    await router.push({ name: 'StudentDashboard' })
  } else {
    // 当前是学生视图 -> 切到审核人视图
    authStore.setViewMode('reviewer')
    await router.push({ name: 'ReviewerDashboard' })
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'Login' })
}

</script>