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
export function paginate(list, page = 1, size = 10) {
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
