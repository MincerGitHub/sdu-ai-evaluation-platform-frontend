import http from './http'

const counselorService = {
    /** 查看某年级各班级整体情况 */
    getClassesOverview(grade, params = {}) {
        return http.get(`/counselor/grades/${grade}/classes/overview`, { params })
    },

    /** 查看某年级下单个班级明细 */
    getClassDetail(grade, classId, params = {}) {
        return http.get(`/counselor/grades/${grade}/classes/${classId}`, { params })
    },
}

export default counselorService
