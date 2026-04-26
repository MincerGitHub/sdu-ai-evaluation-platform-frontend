import axios from 'axios'
import http from './http'

const rootHttp = axios.create({
  baseURL: '/',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

const systemService = {
  /** /api/v1/health */
  getApiHealth() {
    return http.get('/health')
  },

  /** /health */
  getRootHealth() {
    return rootHttp.get('/health')
  },

  /** 获取系统配置（admin） */
  getConfigs() {
    return http.get('/system/configs')
  },

  /** 更新系统配置（admin） */
  updateConfig(payload) {
    return http.put('/system/configs', payload)
  },

  /** 获取系统日志（admin） */
  getLogs(params = {}) {
    return http.get('/system/logs', { params })
  },

  /** 获取用户列表（admin） */
  getUsers(params = {}) {
    return http.get('/system/users', { params })
  },

  /** 创建用户（admin） */
  createUser(payload) {
    return http.post('/system/users', payload)
  },

  /** 修改用户（admin） */
  updateUser(userId, payload) {
    return http.put(`/system/users/${userId}`, payload)
  },

  /** 删除用户（admin） */
  deleteUser(userId) {
    return http.delete(`/system/users/${userId}`)
  },

  /** 获取班级列表 */
  getClasses(params = {}) {
    return http.get('/system/classes', { params })
  },

  /** 获取公开可选班级 */
  getPublicClasses() {
    return http.get('/system/classes/public')
  },

  /** 创建班级 */
  createClass(payload) {
    return http.post('/system/classes', payload)
  },

  /** 修改班级 */
  updateClass(classId, payload) {
    return http.put(`/system/classes/${classId}`, payload)
  },

  /** 删除班级 */
  deleteClass(classId) {
    return http.delete(`/system/classes/${classId}`)
  },

  /** 获取奖项字典（admin） */
  getAwardDicts() {
    return http.get('/system/award-dicts')
  },

  /** 新建奖项字典（admin） */
  createAwardDict(payload) {
    return http.post('/system/award-dicts', payload)
  },

  /** 更新奖项字典（admin） */
  updateAwardDict(awardId, payload) {
    return http.put(`/system/award-dicts/${awardId}`, payload)
  },

  /** 删除奖项字典（admin） */
  deleteAwardDict(awardId) {
    return http.delete(`/system/award-dicts/${awardId}`)
  },
}

export default systemService
