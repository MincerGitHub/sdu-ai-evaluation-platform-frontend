import { success, fail } from './utils.js'

const users = [
    { id: 1, account: '20260001', password: '12345678', name: '张三', role: 'student', class_id: 301, is_reviewer: false, email: 'zhangsan@example.com', phone: '13800000001' },
    { id: 2, account: '20260002', password: '12345678', name: '李四', role: 'student', class_id: 301, is_reviewer: true, email: 'lisi@example.com', phone: '13800000002' },
    { id: 3, account: 'teacher01', password: '12345678', name: '王老师', role: 'teacher', class_id: null, is_reviewer: false, email: 'wang@example.com', phone: '13800000003' },
    { id: 4, account: 'admin01', password: '12345678', name: '管理员', role: 'admin', class_id: null, is_reviewer: false, email: 'admin@example.com', phone: '13800000004' },
]

export default [
    // 登录
    {
        url: '/api/v1/auth/login',
        method: 'post',
        response({ body }) {
            const { account, password } = body || {}
            const user = users.find(u => u.account === account && u.password === password)
            if (!user) return fail(1000, '账号或密码错误')
            return success({
                user: { id: user.id, name: user.name, role: user.role, class_id: user.class_id, is_reviewer: user.is_reviewer, email: user.email, phone: user.phone },
                access_token: `mock_access_${user.id}_${Date.now()}`,
                refresh_token: `mock_refresh_${user.id}_${Date.now()}`,
                expires_in: 7200,
            }, '登录成功')
        },
    },
    // 注册
    {
        url: '/api/v1/auth/register',
        method: 'post',
        response({ body }) {
            const { account, password, name } = body || {}
            if (!account || !password || !name) return fail(1001, '参数校验失败')
            if (users.find(u => u.account === account)) return fail(1007, '账号已存在')
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