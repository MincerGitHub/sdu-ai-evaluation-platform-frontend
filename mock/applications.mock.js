import { success, fail, now, getCurrentUser } from './utils.js'
import { applications, seq } from './mockData.js'

export default [
    // ---- 创建 ----  【需要用户信息：确定 user_id】
    {
        url: '/api/v1/applications',
        method: 'post',
        response({ headers, body }) {
            const currentUser = getCurrentUser(headers)
            if (!currentUser) return fail(1004, '未登录或 token 缺失')

            const { award_uid, title, description, occurred_at, attachments, category, sub_type, score } = body || {}
            if (!award_uid || !title || !category || !sub_type || score == null)
                return fail(1001, '参数校验失败', { reason: 'award_uid/title/category/sub_type/score 必填' })
            const id = ++seq.application
            const app = {
                id,
                user_id: currentUser.id,
                category,
                sub_type,
                award_uid,
                title,
                description: description || '',
                occurred_at: occurred_at || null,
                attachments: attachments || [],
                status: 'pending_review',
                score,
                comment: null,
                is_deleted: false,
                created_at: now(),
                updated_at: now(),
            }
            applications.push(app)
            return success({ id: app.id, status: app.status, score: app.score, award_uid: app.award_uid, created_at: app.created_at }, '创建成功')
        },
    },
    // ---- 分类汇总 ----  【需要用户信息：只查自己的】
    {
        url: '/api/v1/applications/my/category-summary',
        method: 'get',
        response({ headers, query }) {
            const currentUser = getCurrentUser(headers)
            if (!currentUser) return fail(1004, '未登录或 token 缺失')

            const term = query?.term || '2025-2026-1'
            const myApps = applications.filter((a) => a.user_id === currentUser.id && !a.is_deleted)
            const map = {}
            myApps.forEach((a) => {
                const key = `${a.category}__${a.sub_type}`
                if (!map[key]) map[key] = { category: a.category, sub_type: a.sub_type, count: 0, approved: 0, pending: 0, rejected: 0, category_score: 0 }
                map[key].count++
                if (a.status === 'approved') { map[key].approved++; map[key].category_score += a.score || 0 }
                else if (a.status === 'rejected') map[key].rejected++
                else map[key].pending++
            })
            const categories = Object.values(map)
            return success({ term, categories, total_score: categories.reduce((s, c) => s + c.category_score, 0) }, '获取成功')
        },
    },
    // ---- 分类明细 ----  【需要用户信息：只查自己的】
    {
        url: '/api/v1/applications/my/by-category',
        method: 'get',
        response({ headers, query }) {
            const currentUser = getCurrentUser(headers)
            if (!currentUser) return fail(1004, '未登录或 token 缺失')

            const { category, sub_type, status, term } = query || {}
            let list = applications.filter((a) => a.user_id === currentUser.id && !a.is_deleted)
            if (category) list = list.filter((a) => a.category === category)
            if (sub_type) list = list.filter((a) => a.sub_type === sub_type)
            if (status) list = list.filter((a) => a.status === status)
            const items = list.map((a) => ({ application_id: a.id, award_uid: a.award_uid, title: a.title, status: a.status, score: a.score }))
            return success({ category: category || 'all', term: term || '2025-2026-1', list: items }, '获取成功')
        },
    },
    // ---- 撤回 ----
    {
        url: '/api/v1/applications/:application_id/withdraw',
        method: 'post',
        response({ query }) {
            const id = Number(query.application_id)
            const app = applications.find((a) => a.id === id && !a.is_deleted)
            if (!app) return fail(1002, '资源不存在')
            if (!['pending_ai', 'pending_review'].includes(app.status)) return fail(1000, `当前状态 ${app.status} 不允许撤回`)
            app.status = 'withdrawn'
            app.updated_at = now()
            return success({ id: app.id, status: app.status }, '撤回成功')
        },
    },
    // ---- 详情 ----
    {
        url: '/api/v1/applications/:application_id',
        method: 'get',
        response({ query }) {
            const id = Number(query.application_id)
            const app = applications.find((a) => a.id === id && !a.is_deleted)
            if (!app) return fail(1002, '资源不存在')
            return success({
                id: app.id, category: app.category, sub_type: app.sub_type, award_uid: app.award_uid,
                title: app.title, description: app.description, occurred_at: app.occurred_at,
                attachments: app.attachments, status: app.status, score: app.score,
                comment: app.comment, created_at: app.created_at, updated_at: app.updated_at,
            }, '获取成功')
        },
    },
    // ---- 更新 ----
    {
        url: '/api/v1/applications/:application_id',
        method: 'put',
        response({ query, body }) {
            const id = Number(query.application_id)
            const app = applications.find((a) => a.id === id && !a.is_deleted)
            if (!app) return fail(1002, '资源不存在')
            if (!['pending_ai', 'pending_review'].includes(app.status)) return fail(1000, `当前状态 ${app.status} 不允许编辑`)
            const { award_uid, title, description, occurred_at, attachments, category, sub_type, score } = body || {}
            if (award_uid !== undefined) app.award_uid = award_uid
            if (title !== undefined) app.title = title
            if (description !== undefined) app.description = description
            if (occurred_at !== undefined) app.occurred_at = occurred_at
            if (attachments !== undefined) app.attachments = attachments
            if (category !== undefined) app.category = category
            if (sub_type !== undefined) app.sub_type = sub_type
            if (score !== undefined) app.score = score
            app.status = 'pending_review'
            app.updated_at = now()
            return success({ id: app.id, status: app.status, updated_at: app.updated_at }, '更新成功')
        },
    },
    // ---- 删除（软删） ----
    {
        url: '/api/v1/applications/:application_id',
        method: 'delete',
        response({ query }) {
            const id = Number(query.application_id)
            const app = applications.find((a) => a.id === id && !a.is_deleted)
            if (!app) return fail(1002, '资源不存在')
            app.is_deleted = true
            app.updated_at = now()
            return success({}, '删除成功')
        },
    },
]