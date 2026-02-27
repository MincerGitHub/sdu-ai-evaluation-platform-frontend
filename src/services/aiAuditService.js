import http from './http'

const aiAuditService = {
    /** 获取 AI 审核报告 */
    getReport(applicationId) {
        return http.get(`/ai-audits/${applicationId}/report`)
    },

    /** 获取 AI 审核日志列表 */
    getLogs(params = {}) {
        return http.get('/ai-audits/logs', { params })
    },

    /** 获取 AI 规则开关配置 */
    getConfig() {
        return http.get('/ai-audits/config')
    },

    /** 更新 AI 规则开关配置 */
    updateConfig(payload) {
        return http.put('/ai-audits/config', payload)
    },
}

export default aiAuditService
