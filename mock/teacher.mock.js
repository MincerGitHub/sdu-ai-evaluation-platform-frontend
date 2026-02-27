import { success, fail, paginate } from './utils.js'

const allApplications = [
    { id: 10, student_name: '张三', class_id: 301, grade: 2023, category: 'physical_mental', status: 'pending_ai', input_score: null, created_at: '2026-02-21T10:00:00Z' },
    { id: 11, student_name: '张三', class_id: 301, grade: 2023, category: 'physical_mental', status: 'approved', input_score: 2.0, created_at: '2026-02-20T08:00:00Z' },
    { id: 12, student_name: '张三', class_id: 301, grade: 2023, category: 'innovation', status: 'pending_review', input_score: 3.0, created_at: '2026-02-19T12:00:00Z' },
    { id: 13, student_name: '张三', class_id: 301, grade: 2023, category: 'art', status: 'rejected', input_score: null, created_at: '2026-02-18T14:00:00Z' },
    { id: 14, student_name: '张三', class_id: 301, grade: 2023, category: 'labor', status: 'rejected', input_score: null, created_at: '2026-02-17T09:00:00Z' },
    { id: 15, student_name: '李四', class_id: 301, grade: 2023, category: 'physical_mental', status: 'pending_review', input_score: 1.5, created_at: '2026-02-16T11:00:00Z' },
    { id: 16, student_name: '赵六', class_id: 302, grade: 2023, category: 'art', status: 'pending_review', input_score: 1.0, created_at: '2026-02-15T09:00:00Z' },
    { id: 17, student_name: '钱七', class_id: 302, grade: 2023, category: 'innovation', status: 'approved', input_score: 5.0, created_at: '2026-02-14T10:00:00Z' },
    { id: 18, student_name: '孙八', class_id: 303, grade: 2024, category: 'labor', status: 'approved', input_score: 1.5, created_at: '2026-02-13T08:00:00Z' },
]

export default [
    {
        url: '/api/v1/teacher/applications',
        method: 'get',
        response({ query }) {
            const { grade, class_id, status, keyword, page, size } = query || {}
            let list = [...allApplications]
            if (grade) list = list.filter((a) => a.grade === Number(grade))
            if (class_id) list = list.filter((a) => a.class_id === Number(class_id))
            if (status) list = list.filter((a) => a.status === status)
            if (keyword) list = list.filter((a) => a.student_name.includes(keyword))
            return success(paginate(list, page, size), '获取成功')
        },
    },
    {
        url: '/api/v1/teacher/applications/:application_id/recheck',
        method: 'post',
        response({ params, body }) {
            const id = Number(params.application_id)
            const { target_status } = body || {}
            const app = allApplications.find((a) => a.id === id)
            if (!app) return fail(1002, '资源不存在')
            if (!['approved', 'rejected', 'pending_review'].includes(target_status)) return fail(1001, '目标状态无效')
            app.status = target_status
            return success({ id: app.id, status: app.status }, '复核成功')
        },
    },
    {
        url: '/api/v1/teacher/applications/archive',
        method: 'post',
        response({ body }) {
            const { application_ids } = body || {}
            if (!application_ids || !application_ids.length) return fail(1001, 'application_ids 不能为空')
            const archived = []
            application_ids.forEach((id) => {
                const app = allApplications.find((a) => a.id === id)
                if (app) { app.status = 'archived'; archived.push(id) }
            })
            return success({ archived_count: archived.length, archived_ids: archived }, '归档成功')
        },
    },
    {
        url: '/api/v1/teacher/statistics',
        method: 'get',
        response({ query }) {
            const { grade, class_id } = query || {}
            let list = [...allApplications]
            if (grade) list = list.filter((a) => a.grade === Number(grade))
            if (class_id) list = list.filter((a) => a.class_id === Number(class_id))
            const total = list.length
            const approved = list.filter((a) => a.status === 'approved').length
            const rejected = list.filter((a) => a.status === 'rejected').length
            const pending = list.filter((a) => ['pending_ai', 'pending_review'].includes(a.status)).length
            const total_score = list.reduce((s, a) => s + (a.input_score || 0), 0)
            const avg_score = total > 0 ? Math.round((total_score / total) * 100) / 100 : 0
            const byCategory = {}
            list.forEach((a) => {
                if (!byCategory[a.category]) byCategory[a.category] = { type: a.category, count: 0, score: 0 }
                byCategory[a.category].count++
                byCategory[a.category].score += a.input_score || 0
            })
            return success({ total, approved, rejected, pending, total_score, avg_score, by_award_type: Object.values(byCategory) }, '获取成功')
        },
    },
]