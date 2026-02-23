import http from './http';

const applicationService = {
  // 创建申报
  createApplication(applicationData) {
    return http.post('/applications', applicationData);
  },

  // 获取我的申报列表
  getMyApplications(params) {
    return http.get('/applications/my', { params });
  },

  // 获取申报详情
  getApplicationDetail(applicationId) {
    return http.get(`/applications/${applicationId}`);
  },

  // 编辑申报
  updateApplication(applicationId, applicationData) {
    return http.put(`/applications/${applicationId}`, applicationData);
  },

  // 删除申报
  deleteApplication(applicationId) {
    return http.delete(`/applications/${applicationId}`);
  },

  // 获取综测分类字典
  getCategories() {
    return http.get('/applications/categories');
  },

  // 获取按分类的汇总
  getCategorySummary(term) {
    return http.get('/applications/my/category-summary', { params: { term } });
  },

  // 按分类获取申报明细
  getApplicationsByCategory(params) {
    return http.get('/applications/my/by-category', { params });
  },
};

export default applicationService;