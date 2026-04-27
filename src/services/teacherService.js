import http from './http'

const teacherService = {
    /** 全局查询申报记录 */
    getApplications(params = {}) {
        return http.get('/teacher/applications', { params })
    },

    /** 审核异常复核（改判） */
    recheck(applicationId, payload) {
        return http.post(`/teacher/applications/${applicationId}/recheck`, payload)
    },

    /** 批量归档 */
    archive(applicationIds) {
        return http.post('/teacher/applications/archive', { application_ids: applicationIds })
    },

    /** 创建导出任务 */
    createExport(payload) {
        const idempotencyKey =
            (globalThis?.crypto && typeof globalThis.crypto.randomUUID === 'function'
                ? globalThis.crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`)

        return http.post('/teacher/exports', payload, {
            headers: {
                'Idempotency-Key': idempotencyKey,
            },
        })
    },

    /** 查询导出任务状态 */
    getExportTask(taskId) {
        return http.get(`/teacher/exports/${taskId}`)
    },

    /** 导出文件下载 URL */
    getExportDownloadUrl(taskId) {
        return `/api/v1/teacher/exports/${taskId}/download`
    },

    /** 鉴权下载导出文件 */
    async downloadExportFile(taskId, filename) {
        const blob = await http.get(`/teacher/exports/${taskId}/download`, {
            responseType: 'blob',
        })
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename || `${taskId}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
    },

    /** 统计看板 */
    getStatistics(params = {}) {
        return http.get('/teacher/statistics', { params })
    },

    /** 教师端综测画像与风险预警 */
    analyzeInsights(payload = {}) {
        return http.post('/teacher/insights/analyze', payload, {
            timeout: 180000,
        })
    },
}

export default teacherService
