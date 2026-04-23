import http from './http'

const normalizeOptionalText = (value) => {
    if (value === null || value === undefined) return null
    const text = String(value).trim()
    return text || null
}

const authService = {
    register(payload) {
        return http.post('/auth/register', payload)
    },

    login(account, password) {
        return http.post('/auth/login', { account, password })
    },

    refreshToken(refreshToken) {
        return http.post('/auth/refresh', { refresh_token: refreshToken })
    },

    logout(refreshToken) {
        return http.post('/auth/logout', { refresh_token: refreshToken })
    },

    getCurrentUser() {
        return http.get('/users/me')
    },

    updateUserInfo(userInfo) {
        const payload = { ...userInfo }
        if (Object.prototype.hasOwnProperty.call(payload, 'email')) {
            payload.email = normalizeOptionalText(payload.email)
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'phone')) {
            payload.phone = normalizeOptionalText(payload.phone)
        }
        return http.put('/users/me', payload)
    },
}

export default authService
