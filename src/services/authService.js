import http from './http'

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
        return http.put('/users/me', userInfo)
    },
}

export default authService
