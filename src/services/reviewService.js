import http from './http'

const reviewService = {
    /**
     * 获取待审核列表
     * @param {Object} params - { class_id, category, sub_type, keyword, page, size, role }
     */
    getPendingList(params = {}) {
        return http.get('/reviews/pending', { params })
    },

    /**
     * 获取待审核分类汇总
     * @param {Object} params - { class_id, term, role }
     */
    getCategorySummary(params = {}) {
        return http.get('/reviews/pending/category-summary', { params })
    },

    /**
     * 按分类获取待审核明细
     * @param {Object} params - { class_id, category(必填), sub_type, term, page, size, role }
     */
    getPendingByCategory(params = {}) {
        return http.get('/reviews/pending/by-category', { params })
    },

    /**
     * 获取审核详情
     * @param {number} applicationId
     */
    getReviewDetail(applicationId) {
        return http.get(`/reviews/${applicationId}`)
    },

    /**
     * 提交审核决策（单条）
     * @param {number} applicationId
     * @param {Object} payload - { decision, comment, reason_code, reason_text }
     */
    submitDecision(applicationId, payload) {
        return http.post(`/reviews/${applicationId}/decision`, payload)
    },

    /**
     * 批量提交审核决策
     * @param {Object} payload - { application_ids, decision, comment, reason_code, reason_text }
     */
    batchDecision(payload) {
        return http.post('/reviews/batch-decision', payload)
    },

    /**
     * 获取审核历史
     * @param {Object} params - { class_id, result, from, to, page, size }
     */
    getHistory(params = {}) {
        return http.get('/reviews/history', { params })
    },

    /**
     * 获取待审核数量
     * @param {Object} params - { class_id, role }
     */
    getPendingCount(params = {}) {
        return http.get('/reviews/pending-count', { params })
    },
}

export default reviewService
