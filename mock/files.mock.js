import { success, fail, now } from './utils.js'

const files = [
    { file_id: 'file_abc123', filename: 'award.pdf', content_type: 'application/pdf', size: 245761, url: '/api/v1/files/file_abc123' },
    { file_id: 'file_def456', filename: 'certificate.jpg', content_type: 'image/jpeg', size: 102400, url: '/api/v1/files/file_def456' },
]

let fileSeq = 1000

export default [
    {
        url: '/api/v1/files/upload',
        method: 'post',
        response() {
            const fileId = `f_${(++fileSeq).toString(16).padStart(16, '0')}`
            const file = { file_id: fileId, filename: 'uploaded_file.pdf', content_type: 'application/pdf', size: Math.floor(Math.random() * 500000) + 10000, url: `/api/v1/files/${fileId}` }
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