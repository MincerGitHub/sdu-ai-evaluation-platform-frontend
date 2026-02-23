import http from './http';

const fileService = {
  uploadFile(file, category) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    return http.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getFileUrl(fileId) {
    return http.get(`/files/${fileId}/url`);
  },

  deleteFile(fileId) {
    return http.delete(`/files/${fileId}`);
  },

  getFileList(queryParams) {
    return http.get('/files', { params: queryParams });
  },
};

export default fileService;