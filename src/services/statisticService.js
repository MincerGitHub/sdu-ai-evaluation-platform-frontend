import http from './http'

const statisticService = {
    /** 教师查询全部申报（支持筛查） */
    getAllApplications(params = {}) {
        return http.get('/teacher/applications', { params })
    },

    /** 教师复核单条申报 */
    recheckApplication(applicationId, payload) {
        return http.post(`/teacher/applications/${applicationId}/recheck`, payload)
    },

    /** 教师批量归档申报 */
    archiveApplications(payload) {
        return http.post('/teacher/applications/archive', payload)
    },

    /** 教师按班级查看统计信息 */
    getClassStatistics(params = {}) {
        return http.get('/teacher/statistics/classes', { params })
    },
}

export default statisticService
