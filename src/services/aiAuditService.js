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

    /** 预留：图片真实性/P图/AI生成检测 */
    checkImageAuthenticity(fileId, options = {}) {
        return http.post('/ai-audits/image-authenticity', { file_id: fileId, ...options })
    }
}

export default aiAuditService
