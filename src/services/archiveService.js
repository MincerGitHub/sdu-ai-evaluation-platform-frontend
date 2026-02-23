import http from './http';

const archiveService = {
  createArchive(data) {
    return http.post('/archives/exports', data);
  },

  getArchiveList(queryParams) {
    return http.get('/archives/exports', { params: queryParams });
  },

  getArchiveDetail(archiveId) {
    return http.get(`/archives/exports/${archiveId}`);
  },

  downloadArchive(archiveId) {
    return http.get(`/archives/exports/${archiveId}/download`, { responseType: 'blob' });
  }
};

export default archiveService;