import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/utils/constants'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },

    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginPage.vue'),
      meta: { public: true },
    },

    // 学生端
    {
      path: '/student',
      component: () => import('@/components/layout/StudentLayout.vue'),
      meta: { role: ROLES.STUDENT },
      children: [
        {
          path: 'dashboard',
          name: 'StudentDashboard',
          component: () => import('@/views/dashboard/StudentDashboard.vue'),
        },
        {
          path: 'application/:category/:subType',
          name: 'StudentApplication',
          component: () => import('@/views/application/StudentApplicationPage.vue'),
        },
        // ...else
      ],
    },

    // 审核人端
    {
      path: '/reviewer',
      component: () => import('@/components/layout/ReviewerLayout.vue'),
      meta: { role: ROLES.STUDENT, requiresReviewer: true },
      children: [
        {
          path: 'dashboard',
          name: 'ReviewerDashboard',
          component: () => import('@/views/dashboard/ReviewerDashboard.vue'),
        },
        {
          path: 'application/:category/:subType',
          name: 'ReviewerApplication',
          component: () => import('@/views/application/ReviewApplicationPage.vue'),
        },
        // ...else
      ],
    },

    // 教师端
    {
      path: '/teacher',
      component: () => import('@/components/layout/TeacherLayout.vue'),
      meta: { role: ROLES.TEACHER },
      children: [
        {
          path: 'dashboard',
          name: 'TeacherDashboard',
          component: () => import('@/views/dashboard/TeacherDashboard.vue'),
        },
        {
          path: 'application/:category/:subType',
          name: 'TeacherApplication',
          component: () => import('@/views/application/ReviewApplicationPage.vue'),
        },
        // ...else
      ],
    },

    // 公示
    {
      path: '/announcement',
      name: 'Announcement',
      component: () => import('@/views/announcement/AnnouncementPage.vue'),
    },

    // 系统管理
    {
      path: '/system/config',
      name: 'SystemConfig',
      component: () => import('@/views/system/SystemConfigPage.vue'),
      meta: { role: ROLES.ADMIN },
    },
    {
      path: '/system/logs',
      name: 'SystemLogs',
      component: () => import('@/views/system/SystemLogsPage.vue'),
      meta: { role: ROLES.ADMIN },
    },
    {
      path: '/system/award-dicts',
      name: 'AwardDicts',
      component: () => import('@/views/system/AwardDictsPage.vue'),
      meta: { role: ROLES.ADMIN },
    },

    // 错误
    {
      path: '/forbidden',
      name: 'Forbidden',
      component: () => import('@/views/error/ForbiddenPage.vue'),
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: () => import('@/views/error/NotFoundPage.vue'),
    },
  ],
})

// role guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (!to.meta.public && !auth.isAuthenticated) {
    return next({ name: 'Login' })
  }

  // 基础角色校验
  if (to.meta.role) {
    const requiredRole = to.meta.role
    if (requiredRole === ROLES.STUDENT && !auth.isStudent) {
      return next({ name: 'Forbidden' })
    }
    if (requiredRole === ROLES.TEACHER && !auth.isTeacher) {
      return next({ name: 'Forbidden' })
    }
    if (requiredRole === ROLES.ADMIN && !auth.isAdmin) {
      return next({ name: 'Forbidden' })
    }
  }



  next()
})

export default router