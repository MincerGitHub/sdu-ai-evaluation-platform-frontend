import http from './http';

const teacherService = {
  // 获取教师的所有申报记录
  getAllApplications(params) {
    return http.get('/teacher/applications', { params });
  },

  // 生成审核人令牌
  generateReviewerToken(data) {
    return http.post('/tokens/reviewer', data);
  },

  // 获取统计数据
  getStatistics(params) {
    return http.get('/teacher/statistics', { params });
  },

  // 导出数据
  exportData(data) {
    return http.post('/teacher/exports', data);
  },

  // 查询导出任务结果
  getExportTaskResult(taskId) {
    return http.get(`/teacher/exports/${taskId}`);
  },

  // 审核异常复核
  recheckApplication(applicationId, data) {
    return http.post(`/teacher/applications/${applicationId}/recheck`, data);
  },

  // 批量归档
  archiveApplications(data) {
    return http.post('/teacher/applications/archive', data);
  },

  // 获取班级概览
  getGradeClassOverview(grade, classId, params) {
    return http.get(`/counselor/grades/${grade}/classes/${classId}`, { params });
  }
};

export default teacherService;