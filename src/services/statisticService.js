import http from './http'

const statisticService = {
  getAllApplications(params = {}) {
    return http.get('/teacher/applications', { params })
  },

  recheckApplication(applicationId, payload) {
    return http.post(`/teacher/applications/${applicationId}/recheck`, payload)
  },

  archiveApplications(payload) {
    return http.post('/teacher/applications/archive', payload)
  },

  getClassStatistics(params = {}) {
    return http.get('/teacher/statistics/classes', { params })
  },

  getStudentStatistics(params = {}) {
    return http.get('/teacher/statistics/students', { params })
  },
}

export default statisticService
