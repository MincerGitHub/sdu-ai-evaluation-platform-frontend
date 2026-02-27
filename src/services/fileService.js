import http from './http'

const fileService = {
    /** 上传文件（multipart/form-data） */
    upload(file) {
        const formData = new FormData()
        formData.append('file', file)
        return http.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    /** 获取文件 URL（拼接即可，实际为文件流） */
    getFileUrl(fileId) {
        return `/api/v1/files/${fileId}`
    },

    /** 获取文件信息 */
    getFile(fileId) {
        return http.get(`/files/${fileId}`)
    },
}

export default fileService
