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
        {
          path: 'profile',
          name: 'StudentProfile',
          component: () => import('@/views/auth/StudentProfilePage.vue'),
        },
        {
          path: 'announcement',
          name: 'StudentAnnouncement',
          component: () => import('@/views/announcement/AnnouncementPage.vue'),
        },
        {
          path: 'appeals',
          name: 'StudentAppeals',
          component: () => import('@/views/announcement/AppealCreatePage.vue'),
        },
        {
          path: 'appeals/create',
          name: 'StudentAppealCreate',
          redirect: (to) => ({ name: 'StudentAppeals', query: { ...to.query, mode: 'create' } }),
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
          path: 'statistics',
          name: 'TeacherStatistics',
          component: () => import('@/views/teacher/TeacherStatisticsPage.vue'),
        },
        {
          path: 'all-applications',
          name: 'TeacherAllApplications',
          component: () => import('@/views/teacher/TeacherAllApplicationsPage.vue'),
        },
        {
          path: 'application/:category/:subType',
          name: 'TeacherApplication',
          component: () => import('@/views/application/ReviewApplicationPage.vue'),
        },
        {
          path: 'profile',
          name: 'TeacherProfile',
          component: () => import('@/views/auth/TeacherProfilePage.vue'),
        },
        {
          path: 'announcement',
          name: 'TeacherAnnouncement',
          component: () => import('@/views/announcement/AnnouncementPage.vue'),
        },
        {
          path: 'tokens',
          name: 'TokenManagement',
          component: () => import('@/views/auth/TokenManagementPage.vue'),
        },
        {
          path: 'appeals',
          name: 'TeacherAppealProcess',
          component: () => import('@/views/announcement/AppealProcessPage.vue'),
        },
        // ...else
      ],
    },

    // 管理员端
    {
      path: '/admin',
      component: () => import('@/components/layout/AdminLayout.vue'),
      meta: { role: ROLES.ADMIN },
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/dashboard/AdminDashboard.vue'),
        },
        {
          path: 'profile',
          name: 'AdminProfile',
          component: () => import('@/views/auth/AdminProfilePage.vue'),
        },
        {
          path: 'announcement',
          name: 'AdminAnnouncement',
          component: () => import('@/views/announcement/AnnouncementPage.vue'),
        },
        // 系统管理
        {
          path: 'config',
          name: 'SystemConfig',
          component: () => import('@/views/system/SystemConfigPage.vue'),
        },
        {
          path: 'logs',
          name: 'SystemLogs',
          component: () => import('@/views/system/SystemLogsPage.vue'),
        },
        {
          path: 'award-dicts',
          name: 'AwardDicts',
          component: () => import('@/views/system/AwardDictsPage.vue'),
        },
      ],
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
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (!to.meta.public && !auth.isAuthenticated) {
    return next({ name: 'Login' })
  }

  // 刷新页面后若仅恢复了 token，先拉取当前用户，避免 role 判定误拦截到 forbidden
  if (!to.meta.public && auth.isAuthenticated && !auth.user) {
    try {
      await auth.fetchCurrentUser()
    } catch {
      await auth.logout()
      return next({ name: 'Login' })
    }
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

  if (to.meta.requiresReviewer && !auth.isReviewer) {
    return next({ name: 'Forbidden' })
  }
  next()
})

export default router
