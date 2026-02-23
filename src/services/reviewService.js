import http from './http';

const reviewService = {
  // 获取待审核列表
  getPendingReviews(params) {
    return http.get('/reviews/pending', { params });
  },

  // 获取审核详情
  getReviewDetail(applicationId) {
    return http.get(`/reviews/${applicationId}`);
  },

  // 提交审核决策
  submitReviewDecision(applicationId, decisionData) {
    return http.post(`/reviews/${applicationId}/decision`, decisionData);
  },

  // 获取审核历史记录
  getReviewHistory(params) {
    return http.get('/reviews/history', { params });
  },

  // 获取待审核数量
  getPendingCount() {
    return http.get('/reviews/pending-count');
  }
};

export default reviewService;