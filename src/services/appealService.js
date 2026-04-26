import http from './http'

const appealService = {
    /** 提交申诉 */
    create(payload) {
        return http.post('/appeals', payload)
    },

    /** 查询申诉记录 */
    getList(params = {}) {
        return http.get('/appeals', { params })
    },

    /** 搜索可被申诉处理关联的申报 */
    searchApplicationOptions(params = {}) {
        return http.get('/appeals/application-options', { params })
    },

    /** 处理申诉 */
    process(appealId, payload) {
        return http.post(`/appeals/${appealId}/process`, payload)
    },
}

export default appealService
