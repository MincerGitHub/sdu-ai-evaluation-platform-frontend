import { success, fail, paginate, now } from './utils.js'

const tokens = [
    { id: 1, token: 'rvw_a1b2c3d4e5f6g7h8', type: 'reviewer', class_ids: [301, 302, 303], status: 'active', expired_at: '2026-03-01T23:59:59+00:00', created_at: '2026-02-24T03:00:00+00:00', activated_at: '2026-02-24T03:10:23.325193+00:00', activated_user_id: 2 },
]

let tokenIdSeq = 10

export default [
    {
        url: '/api/v1/tokens/reviewer',
        method: 'post',
        response({ body }) {
            const { class_ids, expired_at } = body || {}
            if (!class_ids || !class_ids.length) return fail(1001, '参数校验失败', { reason: 'class_ids 不能为空' })
            const id = ++tokenIdSeq
            const t = { id, token: `rvw_${id}_${Date.now().toString(36)}`, type: 'reviewer', class_ids, status: 'pending', expired_at: expired_at || '2026-12-31T23:59:59+00:00', created_at: now(), activated_at: null, activated_user_id: null }
            tokens.push(t)
            return success({ token_id: t.id, token: t.token, type: t.type, class_ids: t.class_ids, expired_at: t.expired_at }, '创建成功')
        },
    },
    {
        url: '/api/v1/tokens/reviewer/activate',
        method: 'post',
        response({ body }) {
            const { token } = body || {}
            const t = tokens.find((tk) => tk.token === token)
            if (!t) return fail(1002, '令牌不存在')
            if (t.status === 'active') return fail(1007, '令牌已被激活')
            if (t.status === 'revoked') return fail(1000, '令牌已失效')
            t.status = 'active'; t.activated_user_id = 1; t.activated_at = now()
            return success({ token_id: t.id, status: t.status, activated_user_id: t.activated_user_id, activated_at: t.activated_at, is_reviewer: true, reviewer_token_id: t.id }, '激活成功')
        },
    },
    {
        url: '/api/v1/tokens',
        method: 'get',
        response({ query }) {
            const { type, status, page, size } = query || {}
            let list = [...tokens]
            if (type) list = list.filter((t) => t.type === type)
            if (status) list = list.filter((t) => t.status === status)
            return success(paginate(list, page, size), '获取成功')
        },
    },
    {
        url: '/api/v1/tokens/:token_id/revoke',
        method: 'post',
        response({ params }) {
            const id = Number(params.token_id)
            const t = tokens.find((tk) => tk.id === id)
            if (!t) return fail(1002, '令牌不存在')
            t.status = 'revoked'
            return success({}, '失效成功')
        },
    },
]