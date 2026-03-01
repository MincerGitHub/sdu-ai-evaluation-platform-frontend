import { success, fail, now, getCurrentUser } from './utils.js'
import { files, seq } from './mockData.js'

export default [
    // 【需要用户信息：记录 uploader_id】
    {
        url: '/api/v1/files/upload',
        method: 'post',
        response({ headers }) {
            const currentUser = getCurrentUser(headers)
            if (!currentUser) return fail(1004, '未登录或 token 缺失')

            const fileId = `f_${(++seq.file).toString(16).padStart(16, '0')}`
            const file = { file_id: fileId, filename: 'uploaded_file.pdf', content_type: 'application/pdf', size: Math.floor(Math.random() * 500000) + 10000, uploader_id: currentUser.id, url: `/api/v1/files/${fileId}` }
            files.push(file)
            return success(file, '上传成功')
        },
    },
    {
        url: '/api/v1/files/:file_id',
        method: 'get',
        response({ query }) {
            const file = files.find((f) => f.file_id === query.file_id)
            if (!file) return fail(1002, '文件不存在')
            return success(file, '获取成功')
        },
    },
]