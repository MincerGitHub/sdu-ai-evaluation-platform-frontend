import http from './http'

const applicationService = {
    /** 创建申报 */
    create(payload) {
        return http.post('/applications', payload)
    },

    /** 分类汇总 */
    getCategorySummary(params = {}) {
        return http.get('/applications/my/category-summary', { params })
    },

    /** 分类明细 */
    getByCategory(params = {}) {
        return http.get('/applications/my/by-category', { params })
    },

    /** 申报详情 */
    getDetail(applicationId) {
        return http.get(`/applications/${applicationId}`)
    },

    /** 更新申报 */
    update(applicationId, payload) {
        return http.put(`/applications/${applicationId}`, payload)
    },

    /** 撤回申报 */
    withdraw(applicationId) {
        return http.post(`/applications/${applicationId}/withdraw`)
    },

    /** 删除申报（软删） */
    remove(applicationId) {
        return http.delete(`/applications/${applicationId}`)
    },
}

export default applicationService
