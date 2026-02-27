import axios from 'axios'

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
    (response) => {
        const { data } = response
        // 业务码非 0 视为业务错误
        if (data && data.code !== undefined && data.code !== 0) {
            const err = new Error(data.message || '请求失败')
            err.code = data.code
            err.data = data
            return Promise.reject(err)
        }
        return data // 返回 { code, message, data, request_id }
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response
            console.error(`Error ${status}: ${data?.message || error.message}`)

            // 401: token 过期，可在此触发刷新逻辑
            if (status === 401) {
                // 可选：跳转登录或触发 refresh
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/login'
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error('Network error or server is down.')
        } else {
            console.error('Network error or server is down.')
        }
        return Promise.reject(error)
    }
)

export default http
