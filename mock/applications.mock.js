import { success, fail, now } from './utils.js'

const applications = [
    { id: 1, user_id: 1, category: 'physical_mental', sub_type: 'basic', award_uid: 1, title: '全国大学生数学建模竞赛', description: '团队获奖，获得省级一等奖', occurred_at: '2026-01-15', attachments: [{ file_id: 'file_abc123' }], status: 'pending_review', input_score: 1.0, version: 1, is_deleted: false, created_at: '2026-02-21T10:00:00+00:00', updated_at: '2026-02-21T10:00:00+00:00' },
    { id: 2, user_id: 1, category: 'physical_mental', sub_type: 'achievement', award_uid: 2, title: '校运动会 100 米第一名', description: '短跑项目', occurred_at: '2026-03-10', attachments: [{ file_id: 'file_def456' }], status: 'approved', input_score: 2.0, version: 2, is_deleted: false, created_at: '2026-02-20T08:00:00+00:00', updated_at: '2026-02-22T09:00:00+00:00' },
    { id: 3, user_id: 1, category: 'innovation', sub_type: 'basic', award_uid: 3, title: '大学生创新训练项目', description: '国家级大创项目', occurred_at: '2026-02-01', attachments: [], status: 'pending_review', input_score: 3.0, version: 1, is_deleted: false, created_at: '2026-02-19T12:00:00+00:00', updated_at: '2026-02-19T12:00:00+00:00' },
    { id: 4, user_id: 1, category: 'art', sub_type: 'basic', award_uid: 4, title: '校级合唱比赛', description: '获得二等奖', occurred_at: '2026-01-20', attachments: [{ file_id: 'file_ghi789' }], status: 'rejected', input_score: 5, version: 2, is_deleted: false, created_at: '2026-02-18T14:00:00+00:00', updated_at: '2026-02-23T16:00:00+00:00' },
    { id: 5, user_id: 1, category: 'labor', sub_type: 'basic', award_uid: 5, title: '农场劳动', description: '劳动时长 36 小时', occurred_at: '2026-01-25', attachments: [], status: 'pending_review', input_score: 2, version: 1, is_deleted: false, created_at: '2026-02-17T09:00:00+00:00', updated_at: '2026-02-17T09:00:00+00:00' },
    { id: 6, user_id: 2, category: 'physical_mental', sub_type: 'basic', award_uid: 6, title: '篮球联赛 MVP', description: '校级篮球联赛', occurred_at: '2026-02-05', attachments: [{ file_id: 'file_jkl012' }], status: 'pending_review', input_score: 1.5, version: 1, is_deleted: false, created_at: '2026-02-16T11:00:00+00:00', updated_at: '2026-02-16T11:00:00+00:00' },
]

let appIdSeq = 100

export default [
    // ---- 创建 ----
    {
        url: '/api/v1/applications',
        method: 'post',
        response({ body }) {
            const { award_uid, title, description, occurred_at, attachments, category, sub_type, input_score } = body || {}
            if (!award_uid || !title || !category || !sub_type || !input_score) return fail(1001, '参数校验失败', { reason: 'award_uid/title/category/sub_type/input_score 必填' })
            const id = ++appIdSeq
            //  本来 status: 'pending_ai'，但是ai审核做不完了，先直接进入人工审核了
            const app = { id, user_id: 1, category, sub_type, award_uid, title, description: description || '', occurred_at: occurred_at || null, attachments: attachments || [], status: 'pending_review', input_score, score_rule_version: null, version: 0, is_deleted: false, created_at: now(), updated_at: now() }
            applications.push(app)
            return success({ id: app.id, status: app.status, input_score: app.input_score, created_at: app.created_at }, '创建成功')
        },
    },
    // ---- 分类汇总 ----
    {
        url: '/api/v1/applications/my/category-summary',
        method: 'get',
        response({ query }) {
            const term = query?.term || '2025-2026-1' // 这里学期暂时固定
            const myApps = applications.filter((a) => a.user_id === 1 && !a.is_deleted)
            const map = {}
            myApps.forEach((a) => {
                const key = `${a.category}__${a.sub_type}`
                if (!map[key]) map[key] = { category: a.category, sub_type: a.sub_type, count: 0, approved: 0, pending: 0, rejected: 0, category_score: 0 }
                map[key].count++
                if (a.status === 'approved') { map[key].approved++; map[key].category_score += a.input_score || 0 }
                else if (a.status === 'rejected') map[key].rejected++
                else map[key].pending++
            })
            const categories = Object.values(map)
            return success({ term, categories, total_score: categories.reduce((s, c) => s + c.category_score, 0) }, '获取成功')
        },
    },
    // ---- 分类明细 ----
    {
        url: '/api/v1/applications/my/by-category',
        method: 'get',
        response({ query }) {
            const { category, sub_type, status, term } = query || {}
            let list = applications.filter((a) => a.user_id === 1 && !a.is_deleted)
            if (category) list = list.filter((a) => a.category === category)
            if (sub_type) list = list.filter((a) => a.sub_type === sub_type)
            if (status) list = list.filter((a) => a.status === status)
            const items = list.map((a) => ({ application_id: a.id, award_uid: a.award_uid, title: a.title, status: a.status, input_score: a.input_score, version: a.version }))
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
            app.status = 'withdrawn';
            // app.version++ // version做不完了，不做了先
            return success({ id: app.id, status: app.status, version: app.version }, '撤回成功')
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
            return success({ id: app.id, category: app.category, sub_type: app.sub_type, award_uid: app.award_uid, title: app.title, description: app.description, occurred_at: app.occurred_at, attachments: app.attachments, status: app.status, input_score: app.input_score, version: app.version, created_at: app.created_at }, '获取成功')
        },
    },
    // ---- 更新 ----
    {
        url: '/api/v1/applications/:application_id',
        method: 'put',
        response({ query, body }) {
            // vite-plugin-mock 不同方法注入位置不同，做兼容处理
            const id = Number(query?.application_id)
            const app = applications.find((a) => a.id === id && !a.is_deleted)
            if (!app) return fail(1002, '资源不存在')
            if (!['pending_ai', 'pending_review'].includes(app.status)) return fail(1000, `当前状态 ${app.status} 不允许编辑`)
            const { version, award_uid, title, description, occurred_at, attachments, category, sub_type, input_score } = body || {}
            // if (version !== app.version) return fail(1007, '版本冲突，请刷新后重试')
            if (award_uid !== undefined) app.award_uid = award_uid
            if (title !== undefined) app.title = title
            if (description !== undefined) app.description = description
            if (occurred_at !== undefined) app.occurred_at = occurred_at
            if (attachments !== undefined) app.attachments = attachments
            if (category !== undefined) app.category = category
            if (sub_type !== undefined) app.sub_type = sub_type
            if (input_score !== undefined) app.input_score = input_score
            // app.version++;
            // app.status = 'pending_ai'; // ai审核做不完了，先直接进入人工审核了
            app.status = 'pending_review';
            app.updated_at = now()
            return success({ id: app.id, status: app.status, version: app.version, updated_at: app.updated_at }, '更新成功')
        },
    },
    // ---- 删除 ----
    {
        url: '/api/v1/applications/:application_id',
        method: 'delete',
        response({ params, query }) {
            // vite-plugin-mock 不同方法注入位置不同，做兼容处理
            const id = Number(params?.application_id ?? query?.application_id)
            const app = applications.find((a) => a.id === id && !a.is_deleted)
            if (!app) return fail(1002, '资源不存在')
            app.is_deleted = true
            return success({}, '删除成功')
        },
    },
]