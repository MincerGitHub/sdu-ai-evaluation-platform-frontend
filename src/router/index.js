import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/utils/constants'

const routeLoaders = {
  Login: () => import('@/views/auth/LoginPage.vue'),
  Register: () => import('@/views/auth/RegisterPage.vue'),
  StudentLayout: () => import('@/components/layout/StudentLayout.vue'),
  StudentDashboard: () => import('@/views/dashboard/StudentDashboard.vue'),
  StudentApplication: () => import('@/views/application/StudentApplicationPage.vue'),
  StudentProfile: () => import('@/views/auth/StudentProfilePage.vue'),
  StudentAnnouncement: () => import('@/views/announcement/AnnouncementPage.vue'),
  StudentAnnouncementReport: () => import('@/views/announcement/AnnouncementReportPage.vue'),
  StudentAppeals: () => import('@/views/announcement/AppealCreatePage.vue'),
  ReviewerLayout: () => import('@/components/layout/ReviewerLayout.vue'),
  ReviewerDashboard: () => import('@/views/dashboard/ReviewerDashboard.vue'),
  ReviewerApplication: () => import('@/views/application/ReviewApplicationPage.vue'),
  TeacherLayout: () => import('@/components/layout/TeacherLayout.vue'),
  TeacherDashboard: () => import('@/views/dashboard/TeacherDashboard.vue'),
  TeacherStatistics: () => import('@/views/application/TeacherStatisticsPage.vue'),
  TeacherStudentStatistics: () => import('@/views/application/TeacherStudentStatisticsPage.vue'),
  TeacherAllApplications: () => import('@/views/application/TeacherAllApplicationsPage.vue'),
  TeacherApplication: () => import('@/views/application/ReviewApplicationPage.vue'),
  TeacherProfile: () => import('@/views/auth/TeacherProfilePage.vue'),
  TeacherAnnouncement: () => import('@/views/announcement/AnnouncementPage.vue'),
  TokenManagement: () => import('@/views/auth/TokenManagementPage.vue'),
  TeacherAppealProcess: () => import('@/views/announcement/AppealProcessPage.vue'),
  TeacherExport: () => import('@/views/archive/ExportPage.vue'),
  TeacherArchive: () => import('@/views/archive/ArchivePage.vue'),
  TeacherClasses: () => import('@/views/system/ClassManagementPage.vue'),
  AdminLayout: () => import('@/components/layout/AdminLayout.vue'),
  AdminDashboard: () => import('@/views/dashboard/AdminDashboard.vue'),
  AdminProfile: () => import('@/views/auth/AdminProfilePage.vue'),
  AdminAnnouncement: () => import('@/views/announcement/AnnouncementPage.vue'),
  SystemConfig: () => import('@/views/system/SystemConfigPage.vue'),
  SystemLogs: () => import('@/views/system/SystemLogsPage.vue'),
  AwardDicts: () => import('@/views/system/AwardDictsPage.vue'),
  AdminClasses: () => import('@/views/system/ClassManagementPage.vue'),
  Forbidden: () => import('@/views/error/ForbiddenPage.vue'),
  NotFound: () => import('@/views/error/NotFoundPage.vue'),
}

const preloadGroups = {
  admin: ['AdminDashboard', 'SystemConfig', 'SystemLogs', 'AwardDicts', 'AdminClasses', 'AdminAnnouncement', 'AdminProfile'],
  teacher: [
    'TeacherDashboard',
    'TeacherStatistics',
    'TeacherStudentStatistics',
    'TeacherAllApplications',
    'TeacherApplication',
    'TeacherAnnouncement',
    'TeacherAppealProcess',
    'TeacherExport',
    'TeacherArchive',
    'TeacherClasses',
    'TokenManagement',
    'TeacherProfile',
  ],
  student: ['StudentDashboard', 'StudentApplication', 'StudentAnnouncement', 'StudentAnnouncementReport', 'StudentAppeals', 'StudentProfile'],
  reviewer: ['ReviewerDashboard', 'ReviewerApplication'],
}

const preloadedRoutes = new Set()

function schedulePreload(callback) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: 1500 })
  } else {
    window.setTimeout(callback, 50)
  }
}

export function preloadRoutesForUser(user) {
  if (!user?.role) return
  const names = [...(preloadGroups[user.role] || [])]
  if (user.role === ROLES.STUDENT && user.is_reviewer) {
    names.push(...preloadGroups.reviewer)
  }
  const pending = names.filter((name) => routeLoaders[name] && !preloadedRoutes.has(name))
  if (!pending.length) return
  for (const name of pending) preloadedRoutes.add(name)
  schedulePreload(() => {
    pending.forEach((name) => {
      routeLoaders[name]().catch(() => preloadedRoutes.delete(name))
    })
  })
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },

    {
      path: '/login',
      name: 'Login',
      component: routeLoaders.Login,
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: routeLoaders.Register,
      meta: { public: true },
    },

    // 学生端
    {
      path: '/student',
      component: routeLoaders.StudentLayout,
      meta: { role: ROLES.STUDENT },
      children: [
        {
          path: 'dashboard',
          name: 'StudentDashboard',
          component: routeLoaders.StudentDashboard,
        },
        {
          path: 'application/:category/:subType',
          name: 'StudentApplication',
          component: routeLoaders.StudentApplication,
        },
        {
          path: 'profile',
          name: 'StudentProfile',
          component: routeLoaders.StudentProfile,
        },
        {
          path: 'announcement',
          name: 'StudentAnnouncement',
          component: routeLoaders.StudentAnnouncement,
        },
        {
          path: 'announcement/:announcementId/report',
          name: 'StudentAnnouncementReport',
          component: routeLoaders.StudentAnnouncementReport,
        },
        {
          path: 'appeals',
          name: 'StudentAppeals',
          component: routeLoaders.StudentAppeals,
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
      component: routeLoaders.ReviewerLayout,
      meta: { role: ROLES.STUDENT, requiresReviewer: true },
      children: [
        {
          path: '',
          redirect: { name: 'ReviewerDashboard' },
        },
        {
          path: 'dashboard',
          name: 'ReviewerDashboard',
          component: routeLoaders.ReviewerDashboard,
        },
        {
          path: 'application/:category/:subType',
          name: 'ReviewerApplication',
          component: routeLoaders.ReviewerApplication,
        },
        // ...else
      ],
    },

    // 教师端
    {
      path: '/teacher',
      component: routeLoaders.TeacherLayout,
      meta: { role: ROLES.TEACHER },
      children: [
        {
          path: 'dashboard',
          name: 'TeacherDashboard',
          component: routeLoaders.TeacherDashboard,
        },
        {
          path: 'statistics',
          name: 'TeacherStatistics',
          component: routeLoaders.TeacherStatistics,
        },
        {
          path: 'statistics/students',
          name: 'TeacherStudentStatistics',
          component: routeLoaders.TeacherStudentStatistics,
        },
        {
          path: 'all-applications',
          name: 'TeacherAllApplications',
          component: routeLoaders.TeacherAllApplications,
        },
        {
          path: 'application/:category/:subType',
          name: 'TeacherApplication',
          component: routeLoaders.TeacherApplication,
        },
        {
          path: 'profile',
          name: 'TeacherProfile',
          component: routeLoaders.TeacherProfile,
        },
        {
          path: 'announcement',
          name: 'TeacherAnnouncement',
          component: routeLoaders.TeacherAnnouncement,
        },
        {
          path: 'tokens',
          name: 'TokenManagement',
          component: routeLoaders.TokenManagement,
        },
        {
          path: 'appeals',
          name: 'TeacherAppealProcess',
          component: routeLoaders.TeacherAppealProcess,
        },
        {
          path: 'export',
          name: 'TeacherExport',
          component: routeLoaders.TeacherExport,
        },
        {
          path: 'archive',
          name: 'TeacherArchive',
          component: routeLoaders.TeacherArchive,
        },
        {
          path: 'classes',
          name: 'TeacherClasses',
          component: routeLoaders.TeacherClasses,
        },
        // ...else
      ],
    },

    // 管理员端
    {
      path: '/admin',
      component: routeLoaders.AdminLayout,
      meta: { role: ROLES.ADMIN },
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: routeLoaders.AdminDashboard,
        },
        {
          path: 'profile',
          name: 'AdminProfile',
          component: routeLoaders.AdminProfile,
        },
        {
          path: 'announcement',
          name: 'AdminAnnouncement',
          component: routeLoaders.AdminAnnouncement,
        },
        // 系统管理
        {
          path: 'config',
          name: 'SystemConfig',
          component: routeLoaders.SystemConfig,
        },
        {
          path: 'logs',
          name: 'SystemLogs',
          component: routeLoaders.SystemLogs,
        },
        {
          path: 'award-dicts',
          name: 'AwardDicts',
          component: routeLoaders.AwardDicts,
        },
        {
          path: 'classes',
          name: 'AdminClasses',
          component: routeLoaders.AdminClasses,
        },
      ],
    },

    // 错误
    {
      path: '/forbidden',
      name: 'Forbidden',
      component: routeLoaders.Forbidden,
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: routeLoaders.NotFound,
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
  if (!to.meta.public && auth.isStudent && auth.isReviewer) {
    if (to.path.startsWith('/reviewer') && auth.viewMode !== 'reviewer') {
      auth.setViewMode('reviewer')
    } else if (to.path.startsWith('/student') && auth.viewMode !== 'student') {
      auth.setViewMode('student')
    }
  }
  preloadRoutesForUser(auth.user)
  next()
})

export default router
