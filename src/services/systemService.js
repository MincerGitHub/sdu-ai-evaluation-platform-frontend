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
