import http from './http';

const notificationService = {
  sendRejectionEmail(applicationId, to, reason) {
    return http.post('/notifications/reject-email', {
      application_id: applicationId,
      to: to,
      reason: reason,
    });
  },

  getEmailLogs(params) {
    return http.get('/notifications/email-logs', { params });
  },
};

export default notificationService;