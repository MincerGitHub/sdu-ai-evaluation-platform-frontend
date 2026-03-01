import http from './http'

const announcementService = {
  /** 获取公示列表 */
  getAnnouncements(params = {}) {
    return http.get('/announcements', { params })
  },

  /** 公示绑定归档文件下载 URL */
  getDownloadUrl(archiveId) {
    if (!archiveId) return '#'
    return `/api/v1/archives/exports/${archiveId}/download`
  },
}

export default announcementService
