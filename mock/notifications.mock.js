import { success, fail, paginate, now } from './utils.js'
import { emailLogs, seq } from './mockData.js'

export default [
    {
        url: '/api/v1/notifications/reject-email',
        method: 'post',
        response({ body }) {
            const { application_id, to } = body || {}
            if (!application_id || !to) return fail(1001, 'application_id/to 必填')
            const log = { id: ++seq.emailLog, application_id, to, subject: '申报驳回通知', status: 'success', sent_at: now() }
            emailLogs.push(log)
            return success(log, '发送成功')
        },
    },
    {
        url: '/api/v1/notifications/email-logs',
        method: 'get',
        response({ query }) {
            const { status, page, size } = query || {}
            let list = [...emailLogs]
            if (status) list = list.filter((l) => l.status === status)
            return success(paginate(list, page, size), '获取成功')
        },
    },
]