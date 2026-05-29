import http from './http'

const applicationService = {
    /** 获取分类树 */
    getCategories() {
        return http.get('/applications/categories')
    },

    /** 创建申报 */
    create(payload) {
        return http.post('/applications', payload)
    },

    /** 创建 AI 自动填报任务 */
    createAutoFillJob(payload) {
        return http.post('/applications/auto-fill/jobs', payload)
    },

    /** 获取 AI 自动填报任务 */
    getAutoFillJob(jobId) {
        return http.get(`/applications/auto-fill/jobs/${jobId}`)
    },

    /** 取消 AI 自动填报任务 */
    cancelAutoFillJob(jobId) {
        return http.delete(`/applications/auto-fill/jobs/${jobId}`)
    },

    /** 确认 AI 自动填报预览并创建申报 */
    confirmAutoFillJob(jobId, payload) {
        return http.post(`/applications/auto-fill/jobs/${jobId}/confirm`, payload)
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
