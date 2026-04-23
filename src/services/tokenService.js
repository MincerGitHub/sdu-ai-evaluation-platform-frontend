import http from './http'

const tokenService = {
  createReviewerToken(payload) {
    return http.post('/tokens/reviewer', payload)
  },

  activateReviewerToken(token) {
    return http.post('/tokens/reviewer/activate', { token })
  },

  getList(params = {}) {
    return http.get('/tokens', { params })
  },

  revokeToken(tokenId) {
    return http.post(`/tokens/${tokenId}/revoke`)
  },

  unbindToken(tokenId) {
    return http.post(`/tokens/${tokenId}/unbind`)
  },
}

export default tokenService
