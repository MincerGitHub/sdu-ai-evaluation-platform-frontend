import { success, fail, paginate, now } from './utils.js'

const pendingReviews = [
    { application_id: 12, student_name: '张三', student_id: 1, class_id: 301, category: 'innovation', sub_type: 'basic', title: '大学生创新训练项目', status: 'pending_review', input_score: 3.0, score_rule_version: 'v2026.02', created_at: '2026-02-19T12:00:00+00:00' },
    { application_id: 15, student_name: '李四', student_id: 2, class_id: 301, category: 'physical_mental', sub_type: 'basic', title: '篮球联赛 MVP', status: 'pending_review', input_score: 1.5, score_rule_version: 'v2026.02', created_at: '2026-02-16T11:00:00+00:00' },
    { application_id: 16, student_name: '赵六', student_id: 5, class_id: 302, category: 'art', sub_type: 'basic', title: '校歌咏比赛三等奖', status: 'pending_review', input_score: 1.0, score_rule_version: 'v2026.02', created_at: '2026-02-15T09:00:00+00:00' },
]

const reviewHistory = [
    { application_id: 11, student_name: '张三', decision: 'approved', reason_code: '', reason_text: '', decided_at: '2026-02-22T09:00:00+00:00' },
    { application_id: 13, student_name: '张三', decision: 'rejected', reason_code: 'MATERIAL_INVALID', reason_text: '证书图片模糊，无法辨认', decided_at: '2026-02-23T16:00:00+00:00' },
]

function getCategoryName(category) {
    const map = { physical_mental: '身心素质', art: '文艺素养', labor: '劳动素养', innovation: '创新创业', intellectual: '学业科研', moral: '思想道德' }
    return map[category] || category
}

export default [
    {
        url: '/api/v1/reviews/pending',
        method: 'get',
        response({ query }) {
            const { class_id, category, sub_type, keyword, page, size } = query || {}
            let list = [...pendingReviews]
            if (class_id) list = list.filter((r) => r.class_id === Number(class_id))
            if (category) list = list.filter((r) => r.category === category)
            if (sub_type) list = list.filter((r) => r.sub_type === sub_type)
            if (keyword) list = list.filter((r) => r.title.includes(keyword) || r.student_name.includes(keyword))
            return success(paginate(list, page, size), '获取成功')
        },
    },
    {
        url: '/api/v1/reviews/pending/category-summary',
        method: 'get',
        response({ query }) {
            const { class_id, term } = query || {}
            const classIdNum = class_id ? Number(class_id) : null
            let list = [...pendingReviews]
            if (classIdNum) list = list.filter((r) => r.class_id === classIdNum)
            const map = {}
            list.forEach((r) => {
                if (!map[r.category]) map[r.category] = { category: r.category, category_name: getCategoryName(r.category), pending_count: 0, approved_count: 0, rejected_count: 0, category_score: 0 }
                map[r.category].pending_count++
                map[r.category].category_score += r.input_score || 0
            })
            const categories = Object.values(map)
            return success({ class_id: classIdNum || 301, term: term || '2025-2026-1', categories, total_score: categories.reduce((s, c) => s + c.category_score, 0) }, '获取成功')
        },
    },
    {
        url: '/api/v1/reviews/pending/by-category',
        method: 'get',
        response({ query }) {
            const { class_id, category, sub_type, term, page, size } = query || {}
            let list = [...pendingReviews]
            if (class_id) list = list.filter((r) => r.class_id === Number(class_id))
            if (category) list = list.filter((r) => r.category === category)
            if (sub_type) list = list.filter((r) => r.sub_type === sub_type)
            const items = list.map((r) => ({ application_id: r.application_id, student_name: r.student_name, status: r.status, input_score: r.input_score, score_rule_version: r.score_rule_version }))
            return success({ class_id: class_id ? Number(class_id) : 301, category: category || 'all', term: term || '2025-2026-1', list: items }, '获取成功')
        },
    },
    {
        url: '/api/v1/reviews/pending-count',
        method: 'get',
        response() {
            return success({ count: pendingReviews.length }, '获取成功')
        },
    },
    {
        url: '/api/v1/reviews/history',
        method: 'get',
        response({ query }) {
            const { result, page, size } = query || {}
            let list = [...reviewHistory]
            if (result) list = list.filter((r) => r.decision === result)
            return success(paginate(list, page, size), '获取成功')
        },
    },
    {
        url: '/api/v1/reviews/:application_id',
        method: 'get',
        response({ params }) {
            const id = Number(params.application_id)
            const review = pendingReviews.find((r) => r.application_id === id)
            if (!review) return fail(1002, '审核记录不存在')
            return success(review, '获取成功')
        },
    },
    {
        url: '/api/v1/reviews/:application_id/decision',
        method: 'post',
        response({ params, body }) {
            const id = Number(params.application_id)
            const { decision, reason_code, reason_text } = body || {}
            const idx = pendingReviews.findIndex((r) => r.application_id === id)
            if (idx === -1) return fail(1002, '审核记录不存在')
            const review = pendingReviews[idx]
            review.status = decision === 'approved' ? 'approved' : 'rejected'
            reviewHistory.push({ application_id: id, student_name: review.student_name, decision, reason_code: reason_code || '', reason_text: reason_text || '', decided_at: now() })
            pendingReviews.splice(idx, 1)
            return success({ application_id: id, status: review.status }, '审核成功')
        },
    },
]