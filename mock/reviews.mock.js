import { success, fail, now } from './utils.js'
import { applications, reviewRecords, getUserById, seq } from './mockData.js'

// mock 环境下当前操作用户：
//   审核员场景 -> 学生2（id=2，is_reviewer=true，class_ids=[301,302]）
//   教师场景   -> 老师1（id=4，role=teacher）
// 真实环境由 token 解析，此处通过 query.role 做简单模拟（不传默认 reviewer）
const REVIEWER_USER_ID = 2   // 学生2
const TEACHER_USER_ID = 4    // 老师1
const REVIEWER_CLASS_IDS = [301, 302]  // 令牌1 绑定的班级

// ---- 工具 ----

function getStudentInfo(userId) {
    const u = getUserById(userId)
    return u ? { id: u.id, name: u.name, account: u.account, class_id: u.class_id } : { id: userId, name: '未知', account: 'unknown', class_id: 0 }
}

function filterByRole(list, query) {
    const role = query?.role || 'reviewer'
    if (role === 'teacher') {
        // 教师看全局 pending_teacher
        let result = list.filter((a) => a.status === 'pending_teacher' && !a.is_deleted)
        if (query?.class_id) {
            const cid = Number(query.class_id)
            result = result.filter((a) => getStudentInfo(a.user_id).class_id === cid)
        }
        return result
    }
    // 审核员：看 pending_review，且只看令牌绑定班级内的申报
    let result = list.filter((a) => a.status === 'pending_review' && !a.is_deleted)
    result = result.filter((a) => REVIEWER_CLASS_IDS.includes(getStudentInfo(a.user_id).class_id))
    if (query?.class_id) {
        const cid = Number(query.class_id)
        result = result.filter((a) => getStudentInfo(a.user_id).class_id === cid)
    }
    return result
}

function paginate(list, page, size) {
    const p = Math.max(1, Number(page) || 1)
    const s = Math.max(1, Math.min(100, Number(size) || 10))
    const total = list.length
    return { page: p, size: s, total, list: list.slice((p - 1) * s, p * s) }
}

// ---- Mock 接口 ----

export default [
    // 1) 待审核列表
    {
        url: '/api/v1/reviews/pending',
        method: 'get',
        response({ query }) {
            let list = filterByRole(applications, query)
            if (query?.category) list = list.filter((a) => a.category === query.category)
            if (query?.sub_type) list = list.filter((a) => a.sub_type === query.sub_type)
            if (query?.keyword) {
                const kw = query.keyword.toLowerCase()
                list = list.filter((a) => {
                    const stu = getStudentInfo(a.user_id)
                    return a.title.toLowerCase().includes(kw) || stu.name.includes(kw)
                })
            }
            const mapped = list.map((a) => {
                const stu = getStudentInfo(a.user_id)
                return { application_id: a.id, student_id: stu.id, student_name: stu.name, class_id: stu.class_id, title: a.title, category: a.category, sub_type: a.sub_type, status: a.status, score: a.score, created_at: a.created_at }
            })
            return success(paginate(mapped, query?.page, query?.size), '获取成功')
        },
    },

    // 2) 待审核分类汇总
    {
        url: '/api/v1/reviews/pending/category-summary',
        method: 'get',
        response({ query }) {
            const pending = filterByRole(applications, query)
            const term = query?.term || '2025-2026-1'
            const classId = query?.class_id ? Number(query.class_id) : null
            const map = {}

            pending.forEach((a) => {
                if (!map[a.category]) map[a.category] = { category: a.category, category_name: a.category, pending_count: 0, approved_count: 0, rejected_count: 0 }
                map[a.category].pending_count++
            })
            // 从审核记录中补充 approved/rejected 统计
            reviewRecords.forEach((r) => {
                const app = applications.find((a) => a.id === r.application_id)
                if (!app) return
                const stu = getStudentInfo(app.user_id)
                if (classId && stu.class_id !== classId) return
                if (!map[app.category]) map[app.category] = { category: app.category, category_name: app.category, pending_count: 0, approved_count: 0, rejected_count: 0 }
                // 只统计终态记录（避免同一申报多次审核重复计数，取最新一条）
                if (r.result === 'approved') map[app.category].approved_count++
                else if (r.result === 'rejected') map[app.category].rejected_count++
            })

            return success({ class_id: classId, term, categories: Object.values(map) }, '获取成功')
        },
    },

    // 3) 按分类待审核明细
    {
        url: '/api/v1/reviews/pending/by-category',
        method: 'get',
        response({ query }) {
            if (!query?.category) return fail(1001, '参数校验失败', { reason: 'category 必填' })
            let list = filterByRole(applications, query)
            list = list.filter((a) => a.category === query.category)
            if (query?.sub_type) list = list.filter((a) => a.sub_type === query.sub_type)
            const mapped = list.map((a) => {
                const stu = getStudentInfo(a.user_id)
                return { application_id: a.id, student_name: stu.name, status: a.status, score: a.score }
            })
            const result = paginate(mapped, query?.page, query?.size)
            return success({ class_id: query?.class_id ? Number(query.class_id) : null, category: query.category, term: query?.term || '2025-2026-1', ...result }, '获取成功')
        },
    },

    // 7) 待审核数量（放在 :application_id 之前）
    {
        url: '/api/v1/reviews/pending-count',
        method: 'get',
        response({ query }) {
            const list = filterByRole(applications, query)
            return success({ pending_count: list.length }, '获取成功')
        },
    },

    // 6) 我的审核历史
    {
        url: '/api/v1/reviews/history',
        method: 'get',
        response({ query }) {
            const role = query?.role || 'reviewer'
            const currentReviewerId = role === 'teacher' ? TEACHER_USER_ID : REVIEWER_USER_ID
            let list = reviewRecords.filter((r) => r.reviewer_id === currentReviewerId)
            if (query?.class_id) list = list.filter((r) => r.class_id === Number(query.class_id))
            if (query?.result) list = list.filter((r) => r.result === query.result)
            if (query?.from) list = list.filter((r) => r.reviewed_at >= query.from)
            if (query?.to) list = list.filter((r) => r.reviewed_at <= query.to)
            const mapped = list.map((r) => ({
                application_id: r.application_id, student_name: r.student_name, class_id: r.class_id,
                title: r.title, result: r.result, comment: r.comment,
                reason_code: r.reason_code, reason_text: r.reason_text, reviewed_at: r.reviewed_at,
            }))
            return success(paginate(mapped, query?.page, query?.size), '获取成功')
        },
    },

    // 5.1) 批量审核决策
    {
        url: '/api/v1/reviews/batch-decision',
        method: 'post',
        response({ body, query }) {
            const { application_ids, decision, comment } = body || {}
            if (!Array.isArray(application_ids) || application_ids.length === 0) return fail(1001, '参数校验失败', { reason: 'application_ids 必填且不能为空' })
            if (!decision) return fail(1001, '参数校验失败', { reason: 'decision 必填' })
            if (application_ids.length > 200) return fail(1001, 'application_ids 最多 200 条')

            const role = query?.role || 'reviewer'
            const currentReviewerId = role === 'teacher' ? TEACHER_USER_ID : REVIEWER_USER_ID
            const uniqueIds = [...new Set(application_ids.map(Number))]

            // 先全量校验
            for (const id of uniqueIds) {
                const app = applications.find((a) => a.id === id && !a.is_deleted)
                if (!app) return fail(1002, `资源不存在: application_id=${id}`)
                const allowedStatus = role === 'teacher' ? ['pending_teacher'] : ['pending_review']
                if (!allowedStatus.includes(app.status)) return fail(1000, `application_id=${id} 当前状态 ${app.status} 不允许审核`)
            }

            const resultList = []
            for (const id of uniqueIds) {
                const app = applications.find((a) => a.id === id)
                const newStatus = role === 'teacher'
                    ? (decision === 'approved' ? 'approved' : 'rejected')
                    : (decision === 'approved' ? 'pending_teacher' : 'rejected')
                app.status = newStatus
                app.comment = comment || null
                app.updated_at = now()

                const rid = ++seq.reviewRecord
                const reviewedAt = now()
                const stu = getStudentInfo(app.user_id)
                reviewRecords.push({ review_id: rid, application_id: id, reviewer_id: currentReviewerId, reviewer_role: role, student_name: stu.name, class_id: stu.class_id, title: app.title, decision, result: newStatus, comment: comment || null, reviewed_at: reviewedAt })
                resultList.push({ application_id: id, status: newStatus, review_id: rid, reviewed_at: reviewedAt })
            }
            return success({ total: uniqueIds.length, success_count: uniqueIds.length, list: resultList }, '批量审核完成')
        },
    },

    // 4) 审核详情
    {
        url: '/api/v1/reviews/:application_id',
        method: 'get',
        response({ query }) {
            const id = Number(query.application_id)
            const app = applications.find((a) => a.id === id && !a.is_deleted)
            if (!app) return fail(1002, '资源不存在')
            const stu = getStudentInfo(app.user_id)
            return success({
                id: app.id,
                student: { id: stu.id, name: stu.name, account: stu.account, class_id: stu.class_id },
                category: app.category, sub_type: app.sub_type, award_uid: app.award_uid,
                title: app.title, description: app.description, occurred_at: app.occurred_at,
                attachments: app.attachments, status: app.status, score: app.score,
                comment: app.comment, created_at: app.created_at, updated_at: app.updated_at,
            }, '获取成功')
        },
    },

    // 5) 单条审核决策
    {
        url: '/api/v1/reviews/:application_id/decision',
        method: 'post',
        response({ query, body }) {
            const id = Number(query.application_id)
            const app = applications.find((a) => a.id === id && !a.is_deleted)
            if (!app) return fail(1002, '资源不存在')

            const { decision, comment } = body || {}
            const role = body?.role || 'reviewer'   // 真实场景由 token 决定
            const currentReviewerId = role === 'teacher' ? TEACHER_USER_ID : REVIEWER_USER_ID

            if (!decision) return fail(1001, '参数校验失败', { reason: 'decision 必填' })

            const allowedStatus = role === 'teacher' ? ['pending_teacher'] : ['pending_review']
            if (!allowedStatus.includes(app.status)) return fail(1000, `当前状态 ${app.status} 不允许审核`)

            const newStatus = role === 'teacher'
                ? (decision === 'approved' ? 'approved' : 'rejected')
                : (decision === 'approved' ? 'pending_teacher' : 'rejected')

            app.status = newStatus
            app.comment = comment || null
            app.updated_at = now()

            const rid = ++seq.reviewRecord
            const reviewedAt = now()
            const stu = getStudentInfo(app.user_id)
            reviewRecords.push({ review_id: rid, application_id: id, reviewer_id: currentReviewerId, reviewer_role: role, student_name: stu.name, class_id: stu.class_id, title: app.title, decision, result: newStatus, comment: comment || null, reviewed_at: reviewedAt })

            return success({ application_id: id, status: newStatus, review_id: rid, reviewed_at: reviewedAt }, '审核完成')
        },
    },
]