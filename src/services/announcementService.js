import http from './http'

const announcementService = {
  /** 获取公示列表 */
  getAnnouncements(params = {}) {
    return http.get('/announcements', {
      params: {
        ...params,
        _ts: Date.now(),
      },
    })
  },

  /** 发布公示 */
  createAnnouncement(payload) {
    return http.post('/announcements', payload)
  },

  /** 更新公示 */
  updateAnnouncement(announcementId, payload) {
    return http.put(`/announcements/${announcementId}`, payload)
  },

  /** 关闭公示 */
  closeAnnouncement(announcementId) {
    return http.post(`/announcements/${announcementId}/close`)
  },

  /** 删除公示 */
  reopenAnnouncement(announcementId) {
    return http.post(`/announcements/${announcementId}/reopen`)
  },

  deleteAnnouncement(announcementId) {
    return http.delete(`/announcements/${announcementId}`)
  },
}

export default announcementService
