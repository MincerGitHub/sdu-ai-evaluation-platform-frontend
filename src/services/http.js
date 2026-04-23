import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb)
}

function onRefreshed(token, error = null) {
    refreshSubscribers.forEach((cb) => cb(token, error))
    refreshSubscribers = []
}

async function handleExpireAndRetry(originalRequest, originalError) {
    if (!originalRequest) {
        return Promise.reject(originalError || new Error('请求上下文缺失，无法重试'))
    }

    if (!originalRequest.headers) {
        originalRequest.headers = {}
    }

    const authStore = useAuthStore()
    const failedToken =
        typeof originalRequest.headers.Authorization === 'string'
            ? originalRequest.headers.Authorization.replace('Bearer ', '')
            : ''
    const currentToken = authStore.accessToken

    if (failedToken && failedToken !== currentToken && currentToken) {
        originalRequest.headers.Authorization = `Bearer ${currentToken}`
        return http(originalRequest)
    }

    if (originalRequest._retry) {
        await authStore.logout()
        return Promise.reject(originalError || new Error('登录状态已过期'))
    }

    originalRequest._retry = true

    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            subscribeTokenRefresh((token, refreshError) => {
                if (refreshError || !token) {
                    reject(refreshError || new Error('刷新访问令牌失败'))
                    return
                }
                originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(http(originalRequest))
            })
        })
    }

    isRefreshing = true

    try {
        await authStore.refreshAccessToken()
        const newToken = authStore.accessToken
        if (!newToken) {
            throw new Error('刷新后未获取到访问令牌')
        }

        onRefreshed(newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return http(originalRequest)
    } catch (err) {
        onRefreshed('', err)
        await authStore.logout()
        return Promise.reject(err)
    } finally {
        isRefreshing = false
    }
}

const http = axios.create({
    baseURL: '/api/v1',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
})

// 请求拦截：自动附加 access_token
http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截：统一错误处理
http.interceptors.response.use(
    async (response) => {
        const { data, config } = response

        const isWrappedResponse = data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'code')

        if (!isWrappedResponse) {
            return data
        }

        // 处理业务码 access token 失效
        if (data.code === 1005) {
            return handleExpireAndRetry(config)
        }

        // 处理业务码 refresh token 失效
        if (data.code === 1006) {
            ElMessage.error('会话已过期，请重新登录')
            const authStore = useAuthStore()
            await authStore.logout()
            const err = new Error('刷新令牌过期')
            err.code = data.code
            err.data = data
            return Promise.reject(err)
        }

        // 处理其它业务错误
        if (data.code !== undefined && data.code !== 0) {
            const message = data.message || '请求失败'
            switch (data.code) {
                case 1001:
                    console.warn('参数校验失败', data.details)
                    break
                case 1007:
                    ElMessage.warning('业务冲突')
                    break
                default:
                    ElMessage.error(message)
            }
            const err = new Error(message)
            err.code = data.code
            err.data = data
            return Promise.reject(err)
        }

        return data // 返回 { code, message, data, request_id }
    },
    async (error) => {
        const originalRequest = error.config

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !String(originalRequest.url || '').includes('/auth/login') &&
            !String(originalRequest.url || '').includes('/auth/refresh') &&
            !String(originalRequest.url || '').includes('/auth/logout')
        ) {
            return handleExpireAndRetry(originalRequest, error)
        } else if (error.response?.status >= 500) {
            ElMessage.error('服务器崩溃了')
        } else if (error.response?.status === 403) {
            ElMessage.warning('无权限')
        } else if (error.response?.status === 404) {
            console.error('API路径不存在', originalRequest?.url)
        }

        return Promise.reject(error)
    }
)

export default http
