import { success, fail, now, getCurrentUser } from './utils.js'
import { reviewerTokens, seq } from './mockData.js'

export default [
    {
        url: '/api/v1/tokens/reviewer',
        method: 'post',
        response({ body }) {
            const { class_ids, expired_at } = body || {}
            if (!class_ids || !class_ids.length) return fail(1001, '参数校验失败', { reason: 'class_ids 不能为空' })
            const id = ++seq.token
            const t = { id, token: `rvw_${id}_${Date.now().toString(36)}`, type: 'reviewer', class_ids, status: 'pending', expired_at: expired_at || '2026-12-31T23:59:59+00:00', created_at: now(), activated_at: null, activated_user_id: null }
            reviewerTokens.push(t)
            return success({ token_id: t.id, token: t.token, type: t.type, class_ids: t.class_ids, expired_at: t.expired_at }, '创建成功')
        },
    },
    // 【需要用户信息：确定activated_user_id】
    {
        url: '/api/v1/tokens/reviewer/activate',
        method: 'post',
        response({ headers, body }) {
            const currentUser = getCurrentUser(headers)
            if (!currentUser) return fail(1004, '未登录或 token 缺失')

            const { token } = body || {}
            const t = reviewerTokens.find((tk) => tk.token === token)
            if (!t) return fail(1002, '令牌不存在')
            if (t.status === 'active') return fail(1007, '令牌已被激活')
            if (t.status === 'revoked') return fail(1000, '令牌已失效')
            t.status = 'active'; t.activated_user_id = currentUser.id; t.activated_at = now()
            return success({ token_id: t.id, status: t.status, activated_user_id: t.activated_user_id, activated_at: t.activated_at, is_reviewer: true, reviewer_token_id: t.id }, '激活成功')
        },
    },
    {
        url: '/api/v1/tokens',
        method: 'get',
        response({ query }) {
            const { type, status, page, size } = query || {}
            let list = [...reviewerTokens]
            if (type) list = list.filter((t) => t.type === type)
            if (status) list = list.filter((t) => t.status === status)
            return success(paginate(list, page, size), '获取成功')
        },
    },
    {
        url: '/api/v1/tokens/:token_id/revoke',
        method: 'post',
        response({ query }) {
            const id = Number(query.token_id)
            if (!Number.isFinite(id)) return fail(1001, '参数校验失败', { reason: 'token_id 无效' })
            const t = reviewerTokens.find((tk) => tk.id === id)
            if (!t) return fail(1002, '令牌不存在')
            t.status = 'revoked'
            return success({}, '失效成功')
        },
    },
]
