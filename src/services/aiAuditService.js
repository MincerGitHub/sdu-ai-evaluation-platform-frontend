import http from './http';

const aiAuditService = {
  // 获取AI审核报告
  getAuditReport(applicationId) {
    return http.get(`/ai-audits/${applicationId}/report`);
  },

  // 获取AI审核日志列表
  getAuditLogs(queryParams) {
    return http.get('/ai-audits/logs', { params: queryParams });
  },

  // 配置AI审核规则
  updateAuditConfig(config) {
    return http.put('/ai-audits/config', config);
  }
};

export default aiAuditService;