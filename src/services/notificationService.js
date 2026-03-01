import http from './http'

const notificationService = {
    /** 发送驳回通知 */
    sendRejectEmail(payload) {
        return http.post('/notifications/reject-email', payload)
    },

    /** 发送申诉处理结果通知（复用邮件接口） */
    sendAppealResultEmail(payload) {
        return http.post('/notifications/reject-email', payload)
    },

    /** 查询邮件日志 */
    getEmailLogs(params = {}) {
        return http.get('/notifications/email-logs', { params })
    },
}

export default notificationService
