import http from './http'

const archiveService = {
    /** 创建导出归档记录 */
    createExport(payload) {
        // payload 中可包含:
        // - scope: 导出范围，如 'applications'
        // - format: 导出格式，如 'xlsx'
        // - filters: 过滤条件
        // - store_to_archive: boolean，本次导出生成的 task_id 是否写入归档列表
        return http.post('/archives/exports', payload)
    },

    /** 查询归档列表 */
    getExports(params = {}) {
        return http.get('/archives/exports', { params })
    },

    /** 归档文件下载 URL */
    getDownloadUrl(archiveId) {
        return `/api/v1/archives/exports/${archiveId}/download`
    },

    /** 发布公示 */
    createAnnouncement(payload) {
        return http.post('/announcements', payload)
    },

    /** 获取公示列表 */
    getAnnouncements(params = {}) {
        return http.get('/announcements', { params })
    },
}

export default archiveService
