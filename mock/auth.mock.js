import { success, fail } from './utils.js'
import { users } from './mockData.js'

export default [
    // 登录
    {
        url: '/api/v1/auth/login',
        method: 'post',
        response({ body }) {
            const { account, password } = body || {}
            const user = users.find((u) => u.account === account && u.password === password)
            if (!user) return fail(1000, '账号或密码错误')
            return success(
                {
                    user: {
                        id: user.id,
                        name: user.name,
                        role: user.role,
                        class_id: user.class_id,
                        is_reviewer: user.is_reviewer,
                        reviewer_token_id: user.reviewer_token_id,
                        email: user.email,
                        phone: user.phone,
                    },
                    access_token: `mock_access_${user.id}_${Date.now()}`,
                    refresh_token: `mock_refresh_${user.id}_${Date.now()}`,
                    expires_in: 7200,
                },
                '登录成功',
            )
        },
    },
    // 注册
    {
        url: '/api/v1/auth/register',
        method: 'post',
        response({ body }) {
            const { account, password, name } = body || {}
            if (!account || !password || !name) return fail(1001, '参数校验失败')
            if (users.find((u) => u.account === account)) return fail(1007, '账号已存在')
            return success({}, '注册成功')
        },
    },
    // 刷新 token
    {
        url: '/api/v1/auth/refresh',
        method: 'post',
        response({ body }) {
            const { refresh_token } = body || {}
            if (!refresh_token) return fail(1006, 'refresh token 无效')
            return success({ access_token: `mock_access_refreshed_${Date.now()}`, expires_in: 7200 })
        },
    },
    // 退出登录
    {
        url: '/api/v1/auth/logout',
        method: 'post',
        response() {
            return success({}, '退出成功')
        },
    },
]