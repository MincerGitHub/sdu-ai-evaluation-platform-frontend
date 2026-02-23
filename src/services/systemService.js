import http from './http';

const systemService = {
  getSystemConfigs() {
    return http.get('/system/configs');
  },

  updateSystemConfigs(data) {
    return http.put('/system/configs', data);
  },

  getSystemLogs(params) {
    return http.get('/system/logs', { params });
  },

  getAwardDicts() {
    return http.get('/system/award-dicts');
  },

  createAwardDict(data) {
    return http.post('/system/award-dicts', data);
  },

  updateAwardDict(data) {
    return http.put(`/system/award-dicts/${data.id}`, data);
  },

  deleteAwardDict(id) {
    return http.delete(`/system/award-dicts/${id}`);
  }
};

export default systemService;