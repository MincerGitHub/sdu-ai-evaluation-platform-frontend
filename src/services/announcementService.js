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

  /** 获取学生个人公示报告 */
  getMyReport(announcementId) {
    return http.get(`/announcements/${announcementId}/my-report`, {
      params: { _ts: Date.now() },
      timeout: 180000,
    })
  },

  /** 获取某个公示范围内的公开申报 */
  getAnnouncementApplications(announcementId, params = {}) {
    return http.get(`/announcements/${announcementId}/applications`, {
      params: {
        ...params,
        _ts: Date.now(),
      },
    })
  },

  /** 获取某个公示范围内的单条申报详情 */
  getAnnouncementApplicationDetail(announcementId, applicationId) {
    return http.get(`/announcements/${announcementId}/applications/${applicationId}`, {
      params: { _ts: Date.now() },
    })
  },

  /** 调用外部模型生成学生个人报告语录；失败时前端继续使用规则化文案 */
  generateMyReportStoryCopy(announcementId) {
    return http.post(
      `/announcements/${announcementId}/my-report/story-copy`,
      { _ts: Date.now() },
      { timeout: 180000 }
    )
  },

  async downloadAnnouncementFile(announcementId, filename) {
    const blob = await http.get(`/announcements/${announcementId}/download`, {
      responseType: 'blob',
      params: { _ts: Date.now() },
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `announcement_${announcementId}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
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
