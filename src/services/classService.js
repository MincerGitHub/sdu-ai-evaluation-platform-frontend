import http from './http'

const normalizeClassOption = (item) => ({
  ...item,
  class_id: Number(item.class_id ?? item.value),
  value: Number(item.class_id ?? item.value),
  label: item.label || item.name || `${item.grade || ''}级 ${item.class_id ?? item.value}班`,
})

const classService = {
  async getPublicClasses() {
    const res = await http.get('/system/classes/public')
    const list = Array.isArray(res?.data) ? res.data : []
    return list.map(normalizeClassOption)
  },

  async getClasses(params = {}) {
    const res = await http.get('/system/classes', { params })
    const list = Array.isArray(res?.data) ? res.data : []
    return list.map(normalizeClassOption)
  },

  createClass(payload) {
    return http.post('/system/classes', payload)
  },

  updateClass(classId, payload) {
    return http.put(`/system/classes/${classId}`, payload)
  },

  deleteClass(classId) {
    return http.delete(`/system/classes/${classId}`)
  },
}

export { normalizeClassOption }
export default classService
