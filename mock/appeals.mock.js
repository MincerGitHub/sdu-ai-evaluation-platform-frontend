import { success, fail, paginate, now } from './utils.js'
import { appeals, seq, getUserById } from './mockData.js'

// mock 环境下：
//   提交申诉 -> 当前学生固定为 学生1（id=1）
//   处理申诉 -> 当前教师固定为 老师1（id=4）
// 真实环境由 token 解析，此处用常量模拟
const CURRENT_STUDENT_ID = 1    // 学生1
const CURRENT_TEACHER_ID = 4    // 老师1

export default [
    // 1) 提交申诉（学生）
    {
        url: '/api/v1/appeals',
        method: 'post',
        response({ body }) {
            const { announcement_id, content, attachments } = body || {}
            if (!announcement_id || !content)
                return fail(1001, '参数校验失败', { reason: 'announcement_id/content 必填' })

            const u = getUserById(CURRENT_STUDENT_ID)
            const appeal = {
                id: ++seq.appeal,
                announcement_id,
                student_id: CURRENT_STUDENT_ID,
                student_name: u ? u.name : '未知',
                content,
                attachments: attachments || [],
                result: null,
                result_comment: null,
                status: 'pending',
                created_at: now(),
                processed_at: null,
                processed_by: null,
            }
            appeals.push(appeal)
            return success(
                {
                    id: appeal.id,
                    announcement_id: appeal.announcement_id,
                    status: appeal.status,
                    created_at: appeal.created_at,
                },
                '提交成功',
            )
        },
    },

    // 2) 获取申诉列表（教师/管理员查看全部；学生只看自己）
    {
        url: '/api/v1/appeals',
        method: 'get',
        response({ query }) {
            const { page, size, student_id, status, announcement_id } = query || {}
            let list = [...appeals]
            if (student_id) list = list.filter((a) => a.student_id === Number(student_id))
            if (status) list = list.filter((a) => a.status === status)
            if (announcement_id) list = list.filter((a) => a.announcement_id === Number(announcement_id))
            // 按创建时间倒序
            list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
            return success(paginate(list, page, size), '获取成功')
        },
    },

    // 3) 处理申诉（教师/管理员）
    {
        url: '/api/v1/appeals/:appeal_id/process',
        method: 'post',
        response({ query, body }) {
            const id = Number(query.appeal_id)
            const { result, result_comment } = body || {}
            if (!result) return fail(1001, '参数校验失败', { reason: 'result 必填' })
            if (!['approved', 'rejected'].includes(result))
                return fail(1001, '参数校验失败', { reason: 'result 仅允许 approved / rejected' })

            const appeal = appeals.find((a) => a.id === id)
            if (!appeal) return fail(1002, '申诉记录不存在')
            if (appeal.status === 'processed') return fail(1000, '该申诉已处理')

            appeal.result = result
            appeal.result_comment = result_comment || null
            appeal.status = 'processed'
            appeal.processed_at = now()
            appeal.processed_by = CURRENT_TEACHER_ID

            return success(
                {
                    id: appeal.id,
                    result: appeal.result,
                    result_comment: appeal.result_comment,
                    status: appeal.status,
                    processed_at: appeal.processed_at,
                },
                '处理成功',
            )
        },
    },
]
