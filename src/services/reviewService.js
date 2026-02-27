import http from './http'

const reviewService = {
    /** 获取待审核列表 */
    getPendingList(params = {}) {
        return http.get('/reviews/pending', { params })
    },

    /** 按分类获取待审核汇总 */
    getPendingCategorySummary(params = {}) {
        return http.get('/reviews/pending/category-summary', { params })
    },

    /** 按分类获取待审核明细 */
    getPendingByCategory(params = {}) {
        return http.get('/reviews/pending/by-category', { params })
    },

    /** 获取审核详情 */
    getDetail(applicationId) {
        return http.get(`/reviews/${applicationId}`)
    },

    /** 审核决策（通过/驳回） */
    makeDecision(applicationId, payload) {
        return http.post(`/reviews/${applicationId}/decision`, payload)
    },

    /** 获取我的审核记录 */
    getHistory(params = {}) {
        return http.get('/reviews/history', { params })
    },

    /** 获取待审核数量（首页红点） */
    getPendingCount() {
        return http.get('/reviews/pending-count')
    },
}

export default reviewService
