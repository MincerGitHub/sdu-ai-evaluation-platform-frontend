import { users } from './mockData.js'

/**
 * 生成 request_id
 */
export function genRequestId() {
    // 简易 uuid
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

/**
 * 统一成功响应
 */
export function success(data, message = 'ok') {
    return {
        code: 0,
        message,
        data,
        request_id: genRequestId(),
    }
}

/**
 * 统一失败响应
 */
export function fail(code, message, error) {
    const res = {
        code,
        message,
        request_id: genRequestId(),
    }
    if (error) res.error = error
    return res
}

/**
 * 分页工具
 */
export function paginate(list, page = 1, size = 100) {
    const p = Math.max(1, Number(page))
    const s = Math.min(100, Math.max(1, Number(size)))
    const total = list.length
    const start = (p - 1) * s
    const end = start + s
    return {
        page: p,
        size: s,
        total,
        list: list.slice(start, end),
    }
}

/**
 * 获取当前 ISO 时间
 */
export function now() {
    return new Date().toISOString()
}

/**
 * 从请求 headers 中解析当前登录用户
 * 约定 token 格式：Bearer mock_access_{userId}_{timestamp}
 * @param {object} headers - 请求头对象
 * @returns {object|null} 用户对象，未找到返回 null
 */
export function getCurrentUser(headers = {}) {
    const authorization = headers.authorization || headers.Authorization || ''
    if (!authorization.startsWith('Bearer ')) return null
    const token = authorization.slice(7)
    const match = token.match(/^mock_access_(\d+)_/)
    if (!match) return null
    const userId = Number(match[1])
    return users.find((u) => u.id === userId) || null
}
