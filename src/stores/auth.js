import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import tokenService from '@/services/tokenService'
import { ROLES } from '@/utils/constants'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(readStoredUser())
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

    function readStoredUser() {
        try {
            const raw = localStorage.getItem('auth_user')
            if (!raw) return null
            return JSON.parse(raw)
        } catch {
            localStorage.removeItem('auth_user')
            return null
        }
    }

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
        if (u) {
            localStorage.setItem('auth_user', JSON.stringify(u))
        } else {
            localStorage.removeItem('auth_user')
        }
    }

    function setViewMode(mode) {
        viewMode.value = mode
        localStorage.setItem('view_mode', mode)
    }

    let refreshTimer = null
    
    const clearRefreshTimer = () => {
        if (refreshTimer) {
            clearTimeout(refreshTimer)
            refreshTimer = null
        }
    }

    const setupAutoRefresh = () => {
        clearRefreshTimer()
        if (!accessToken.value) return

        try {
            const base64URL = accessToken.value.split('.')[1]
            const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/')
            const payload = JSON.parse(window.atob(base64))
            const expiryTime = payload.exp * 1000
            const currentTime = Date.now()
            let timeout = expiryTime - currentTime - (5 * 60 * 1000)
            if (timeout < 60000) timeout = 0
            console.log(`Token将在 ${timeout / 1000} 秒后自动续期`)

            refreshTimer = setTimeout(async () => {
                try {
                    await refreshAccessToken()
                    setupAutoRefresh()
                    console.log('Token 主动续期成功')
                } catch (err) {
                    console.warn('主动续期失败，等待被动拦截', err)
                }
            }, timeout)
        } catch (e) {
            console.error('Token格式非法，无法开启自动续期')
        }
    }

    async function login({ account, password }) {
        // 登录前先清除旧 token，避免请求携带过期凭证
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('auth_user')
        accessToken.value = ''
        refreshToken.value = ''
        user.value = null

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
        setupAutoRefresh()
        return data
    }

    async function register(payload) {
        const res = await authService.register(payload)
        return res.data
    }

    async function logout() {
        clearRefreshTimer()
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

    async function updateProfile(profilePayload) {
        const normalizeOptionalText = (value) => {
            if (value === null || value === undefined) return null
            const text = String(value).trim()
            return text || null
        }

        const nextName = normalizeOptionalText(profilePayload?.name)
        const nextEmail = normalizeOptionalText(profilePayload?.email)
        const nextPhone = normalizeOptionalText(profilePayload?.phone)
        const currentName = normalizeOptionalText(user.value?.name)
        const currentEmail = normalizeOptionalText(user.value?.email)
        const currentPhone = normalizeOptionalText(user.value?.phone)

        const payload = {}
        if (nextName !== currentName) payload.name = nextName
        if (nextEmail !== currentEmail) payload.email = nextEmail
        if (nextPhone !== currentPhone) payload.phone = nextPhone

        if (!Object.keys(payload).length) {
            return user.value || {}
        }

        const res = await authService.updateUserInfo(payload)
        const latestUser = {
            ...(user.value || {}),
            ...(res.data || {}),
        }
        setUser(latestUser)
        return latestUser
    }

    async function bindReviewerToken(token) {
        const res = await tokenService.activateReviewerToken(token)
        await fetchCurrentUser()
        return res.data || {}
    }
    const initAuth = async () => {
        if (accessToken.value) {
            setupAutoRefresh()
        }
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
        register,
        login,
        logout,
        refreshAccessToken,
        fetchCurrentUser,
        updateProfile,
        bindReviewerToken,
        setViewMode,
        initAuth
    }
})
