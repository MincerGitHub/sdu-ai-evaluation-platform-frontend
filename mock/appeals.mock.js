import { success, fail, paginate, now } from './utils.js'

const appeals = [
    {
        id: 1,
        announcement_id: 1,
        student_id: 1,
        student_name: '张三',
        content: '我认为体育加分项未统计，校运动会 100 米第一名的加分没有体现',
        attachments: ['file_abc123'],
        result: null,
        status: 'pending',
        created_at: '2026-02-16T10:00:00Z',
        processed_at: null,
    },
    {
        id: 2,
        announcement_id: 1,
        student_id: 2,
        student_name: '李四',
        content: '篮球联赛 MVP 加分有误',
        attachments: [],
        result: 'rejected',
        status: 'processed',
        created_at: '2026-02-17T08:00:00Z',
        processed_at: '2026-02-18T14:00:00Z',
    },
]

let appealSeq = 100

export default [
    {
        url: '/api/v1/appeals',
        method: 'post',
        response({ body }) {
            const { announcement_id, content, attachments } = body || {}
            if (!announcement_id || !content) return fail(1001, 'announcement_id/content 必填')
            const appeal = {
                id: ++appealSeq,
                announcement_id,
                student_id: 1,
                student_name: '张三',
                content,
                attachments: attachments || [],
                result: null,
                status: 'pending',
                created_at: now(),
                processed_at: null,
            }
            appeals.push(appeal)
            return success(appeal, '提交成功')
        },
    },
    {
        url: '/api/v1/appeals',
        method: 'get',
        response({ query }) {
            const { page, size } = query || {}
            return success(paginate([...appeals], page, size), '获取成功')
        },
    },
    {
        url: '/api/v1/appeals/:appeal_id/process',
        method: 'post',
        response({ params, body }) {
            const id = Number(params.appeal_id)
            const { result } = body || {}
            const appeal = appeals.find((a) => a.id === id)
            if (!appeal) return fail(1002, '申诉记录不存在')
            if (appeal.status === 'processed') return fail(1000, '该申诉已处理')
            appeal.result = result || 'rejected'
            appeal.status = 'processed'
            appeal.processed_at = now()
            return success({ id: appeal.id, result: appeal.result, status: appeal.status }, '处理成功')
        },
    },
]