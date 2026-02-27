import { success, fail, paginate, now } from './utils.js'

const emailLogs = [
    { id: 1, application_id: 13, to: 'zhangsan@example.com', subject: '申报驳回通知', status: 'success', sent_at: '2026-02-23T16:05:00Z' },
    { id: 2, application_id: 14, to: 'zhangsan@example.com', subject: 'AI 异常通知', status: 'success', sent_at: '2026-02-17T09:10:00Z' },
    { id: 3, application_id: 16, to: 'zhaoliu@example.com', subject: '申报驳回通知', status: 'failed', sent_at: '2026-02-20T11:00:00Z' },
]

export default [
    {
        url: '/api/v1/notifications/reject-email',
        method: 'post',
        response({ body }) {
            const { application_id, to } = body || {}
            if (!application_id || !to) return fail(1001, 'application_id/to 必填')
            const log = { id: emailLogs.length + 1, application_id, to, subject: '申报驳回通知', status: 'success', sent_at: now() }
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