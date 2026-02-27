import http from './http'

const tokenService = {
    /** 创建评审令牌（教师/管理员） */
    createReviewerToken(payload) {
        return http.post('/tokens/reviewer', payload)
    },

    /** 激活评审令牌（学生） */
    activateReviewerToken(token) {
        return http.post('/tokens/reviewer/activate', { token })
    },

    /** 令牌列表（教师/管理员） */
    getList(params = {}) {
        return http.get('/tokens', { params })
    },

    /** 令牌失效（教师/管理员） */
    revokeToken(tokenId) {
        return http.post(`/tokens/${tokenId}/revoke`)
    },
}

export default tokenService
