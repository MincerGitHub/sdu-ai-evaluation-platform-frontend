import http from './http'

function resolveApiPath(url) {
    if (!url) return ''
    if (/^https?:\/\//i.test(url)) return url
    if (url.startsWith('/')) return url
    return `/api/v1/${url.replace(/^\/+/, '')}`
}

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

    /** 获取可访问文件 URL（后端会先做权限校验） */
    async getFileAccessUrl(fileId) {
        const res = await http.get(`/files/${fileId}/url`)
        const url = res?.data?.url || res?.url || ''
        return resolveApiPath(url || this.getFileUrl(fileId))
    },

    /** 获取文件信息 */
    getFile(fileId) {
        return http.get(`/files/${fileId}`, {
            params: { raw: false },
            headers: { Accept: 'application/json' },
        })
    },

    /** 获取文件二进制（带鉴权） */
    getFileBlob(fileId) {
        return http.get(`/files/${fileId}`, {
            params: { raw: true },
            responseType: 'blob',
        })
    },

    /** 获取文件 ArrayBuffer（带鉴权） */
    async getFileArrayBuffer(fileId) {
        const blob = await this.getFileBlob(fileId)
        return blob.arrayBuffer()
    },

    /** 鉴权下载文件并触发浏览器保存 */
    async downloadFile(fileId, filename) {
        const blob = await this.getFileBlob(fileId)
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename || fileId
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
    },

    /** 删除文件 */
    remove(fileId) {
        return http.delete(`/files/${fileId}`)
    },
}

export default fileService
