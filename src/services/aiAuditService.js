import http from './http'

const aiAuditService = {
    /** 获取 AI 审核报告 */
    getReport(applicationId) {
        return http.get(`/ai-audits/${applicationId}/report`)
    },

    /** 获取 AI 审核日志列表 */
    getLogs(params = {}) {
        return http.get('/ai-audits/logs', { params })
    }
}

export default aiAuditService
