import http from './http'

const teacherService = {
    /** 全局查询申报记录 */
    getApplications(params = {}) {
        return http.get('/teacher/applications', { params })
    },

    /** 审核异常复核（改判） */
    recheck(applicationId, payload) {
        return http.post(`/teacher/applications/${applicationId}/recheck`, payload)
    },

    /** 批量归档 */
    archive(applicationIds) {
        return http.post('/teacher/applications/archive', { application_ids: applicationIds })
    },

    /** 统计看板 */
    getStatistics(params = {}) {
        return http.get('/teacher/statistics', { params })
    },
}

export default teacherService
