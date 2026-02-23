import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import { ROLES } from '@/utils/constants'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const accessToken = ref(localStorage.getItem('access_token') || '')
    const refreshToken = ref(localStorage.getItem('refresh_token') || '')

    // 当前视图模式：'student' | 'reviewer'
    // （只对 role === student 且 is_reviewer === true 的用户有用）
    const viewMode = ref(localStorage.getItem('view_mode') || 'student')

    const isAuthenticated = computed(() => !!accessToken.value)

    const role = computed(() => user.value?.role || null)
    const isStudent = computed(() => role.value === ROLES.STUDENT)
    const isTeacher = computed(() => role.value === ROLES.TEACHER)
    const isAdmin = computed(() => role.value === ROLES.ADMIN)
    const isReviewer = computed(() => !!user.value?.is_reviewer)
    const isInReviewerView = computed(() => isStudent.value && isReviewer.value && viewMode.value === 'reviewer')
    const canUseReviewerView = computed(() => isStudent.value && isReviewer.value)

    function setTokens(at, rt) {
        accessToken.value = at || ''
        refreshToken.value = rt || ''
        if (at) {
            localStorage.setItem('access_token', at)
        } else {
            localStorage.removeItem('access_token')
        }
        if (rt) {
            localStorage.setItem('refresh_token', rt)
        } else {
            localStorage.removeItem('refresh_token')
        }
    }

    function setUser(u) {
        user.value = u
    }

    function setViewMode(mode) {
        viewMode.value = mode
        localStorage.setItem('view_mode', mode)
    }

    async function login({ account, password }) {
        const res = await authService.login(account, password)
        const data = res.data
        setUser(data.user)
        setTokens(data.access_token, data.refresh_token)

        // 登录时初始化 viewMode：
        // - 学生 + is_reviewer: 保持上次选择（localStorage 中已有），否则默认 student
        // - 非学生：统一设成 student（其实不使用）
        if (data.user.role === ROLES.STUDENT && data.user.is_reviewer) {
            const saved = localStorage.getItem('view_mode')
            if (saved === 'reviewer' || saved === 'student') {
                viewMode.value = saved
            } else {
                setViewMode('student')
            }
        } else {
            setViewMode('student')
        }

        return data
    }

    async function logout() {
        try {
            if (refreshToken.value) {
                await authService.logout(refreshToken.value)
            }
        } catch (e) {
            // 可按需记录日志，这里暂时不阻断
            console.error('Logout request failed:', e)
        } finally {
            setUser(null)
            setTokens('', '')
            setViewMode('student')
            localStorage.removeItem('view_mode')
        }
    }

    async function refreshAccessToken() {
        if (!refreshToken.value) return
        const res = await authService.refreshToken(refreshToken.value)
        const data = res.data
        setTokens(data.access_token, refreshToken.value)
    }

    async function fetchCurrentUser() {
        // 如果刚刷新页面，有 token 但 user 为空，可以调用这个
        const res = await authService.getCurrentUser()
        setUser(res.data)
        return res.data
    }

    return {
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        role,
        isStudent,
        isTeacher,
        isAdmin,
        isReviewer,
        isInReviewerView,
        canUseReviewerView,
        viewMode,
        login,
        logout,
        refreshAccessToken,
        fetchCurrentUser,
        setViewMode,
    }
})