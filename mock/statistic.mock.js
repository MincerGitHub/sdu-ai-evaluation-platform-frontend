import { success, fail, now, getCurrentUser, paginate } from './utils.js'
import { applications, reviewRecords, seq, getUserById } from './mockData.js'

const TEACHER_ROLES = ['teacher', 'admin']
const PENDING_STATUSES = ['pending_ai', 'pending_review', 'pending_teacher']

function hasTeacherPermission(user) {
    return !!user && TEACHER_ROLES.includes(user.role)
}

function toGrade(classId) {
    if (!classId) return null
    // 当前 mock 班级 301/302/303 统一归属于 2023 级
    return 2023
}

function toProjectText(category, subType) {
    const categoryMap = {
        physical_mental: '身心素养',
        art: '文艺素养',
        labor: '劳动素养',
        innovation: '创新素养',
    }
    const subTypeMap = {
        basic: '基础性评价',
        achievement: '成果性评价',
    }
    return `${categoryMap[category] || category || '-'} · ${subTypeMap[subType] || subType || '-'}`
}

function mapApplicationRecord(app) {
    const stu = getUserById(app.user_id)
    const attachments = Array.isArray(app.attachments) ? app.attachments : []
    const aiResult = app.status === 'pending_ai' ? '待检测' : '未见异常'
    return {
        application_id: app.id,
        grade: toGrade(stu?.class_id),
        class_id: stu?.class_id || null,
        student_id: stu?.id || app.user_id,
        student_account: stu?.account || '-',
        student_name: stu?.name || '未知学生',
        title: app.title,
        category: app.category,
        sub_type: app.sub_type,
        project: toProjectText(app.category, app.sub_type),
        description: app.description || '',
        attachments,
        ai_result: app.ai_result || aiResult,
        status: app.status,
        score: Number(app.score || 0),
        comment: app.comment || null,
        created_at: app.created_at,
        updated_at: app.updated_at,
    }
}

function applyApplicationFilters(records, query = {}) {
    let list = [...records]

    if (query.grade) {
        const grade = Number(query.grade)
        list = list.filter((item) => Number(item.grade) === grade)
    }
    if (query.class_id) {
        const classId = Number(query.class_id)
        list = list.filter((item) => Number(item.class_id) === classId)
    }
    if (query.status) {
        list = list.filter((item) => item.status === query.status)
    }
    if (query.category) {
        list = list.filter((item) => item.category === query.category)
    }
    if (query.sub_type) {
        list = list.filter((item) => item.sub_type === query.sub_type)
    }
    if (query.keyword) {
        const keyword = String(query.keyword).trim().toLowerCase()
        if (keyword) {
            list = list.filter((item) =>
                item.title.toLowerCase().includes(keyword)
                || item.student_name.toLowerCase().includes(keyword)
                || item.student_account.toLowerCase().includes(keyword)
            )
        }
    }

    return list
}

export default [
    // 1) 教师查看全部申报（筛查）
    {
        url: '/api/v1/teacher/applications',
        method: 'get',
        response({ headers, query }) {
            const currentUser = getCurrentUser(headers)
            if (!currentUser) return fail(1004, '未登录或 token 缺失')
            if (!hasTeacherPermission(currentUser)) return fail(1003, '无权限')

            const records = applications
                .filter((app) => !app.is_deleted)
                .map((app) => mapApplicationRecord(app))
                .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))

            const filtered = applyApplicationFilters(records, query)
            return success(paginate(filtered, query?.page, query?.size), '获取成功')
        },
    },

    // 2) 教师复核申报
    {
        url: '/api/v1/teacher/applications/:application_id/recheck',
        method: 'post',
        response({ headers, query, body }) {
            const currentUser = getCurrentUser(headers)
            if (!currentUser) return fail(1004, '未登录或 token 缺失')
            if (!hasTeacherPermission(currentUser)) return fail(1003, '无权限')

            const applicationId = Number(query?.application_id)
            const app = applications.find((item) => item.id === applicationId && !item.is_deleted)
            if (!app) return fail(1002, '申报不存在')
            if (app.status === 'archived') return fail(1000, '已归档申报不允许复核')

            const { decision, comment } = body || {}
            if (!decision) return fail(1001, '参数校验失败', { reason: 'decision 必填' })
            if (!['approved', 'rejected'].includes(decision)) {
                return fail(1001, '参数校验失败', { reason: 'decision 仅允许 approved/rejected' })
            }

            const newStatus = decision === 'approved' ? 'approved' : 'rejected'
            app.status = newStatus
            app.comment = comment || null
            app.updated_at = now()

            const stu = getUserById(app.user_id)
            reviewRecords.push({
                review_id: ++seq.reviewRecord,
                application_id: app.id,
                reviewer_id: currentUser.id,
                reviewer_role: 'teacher',
                student_name: stu?.name || '未知学生',
                class_id: stu?.class_id || null,
                title: app.title,
                decision,
                result: newStatus,
                comment: comment || null,
                reviewed_at: now(),
            })

            return success(
                {
                    application_id: app.id,
                    status: app.status,
                    comment: app.comment,
                    updated_at: app.updated_at,
                },
                '复核成功',
            )
        },
    },

    // 3) 教师批量归档申报
    {
        url: '/api/v1/teacher/applications/archive',
        method: 'post',
        response({ headers, body }) {
            const currentUser = getCurrentUser(headers)
            if (!currentUser) return fail(1004, '未登录或 token 缺失')
            if (!hasTeacherPermission(currentUser)) return fail(1003, '无权限')

            const applicationIds = body?.application_ids
            if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
                return fail(1001, '参数校验失败', { reason: 'application_ids 必填且不能为空' })
            }

            const uniqueIds = [...new Set(applicationIds.map((id) => Number(id)))]
            const archived = []
            const skipped = []

            uniqueIds.forEach((id) => {
                const app = applications.find((item) => item.id === id && !item.is_deleted)
                if (!app) {
                    skipped.push({ application_id: id, reason: 'not_found' })
                    return
                }
                if (app.status === 'archived') {
                    skipped.push({ application_id: id, reason: 'already_archived' })
                    return
                }
                app.status = 'archived'
                app.updated_at = now()
                archived.push(id)
            })

            return success(
                {
                    total: uniqueIds.length,
                    success_count: archived.length,
                    skipped_count: skipped.length,
                    archived_application_ids: archived,
                    skipped,
                },
                '归档完成',
            )
        },
    },

    // 4) 教师按班级查看统计信息
    {
        url: '/api/v1/teacher/statistics/classes',
        method: 'get',
        response({ headers, query }) {
            const currentUser = getCurrentUser(headers)
            if (!currentUser) return fail(1004, '未登录或 token 缺失')
            if (!hasTeacherPermission(currentUser)) return fail(1003, '无权限')

            const classMap = new Map()
            applications
                .filter((app) => !app.is_deleted)
                .forEach((app) => {
                    const stu = getUserById(app.user_id)
                    const classId = Number(stu?.class_id)
                    if (!classId) return
                    const grade = toGrade(classId)

                    if (query?.grade && Number(query.grade) !== grade) return
                    if (query?.class_id && Number(query.class_id) !== classId) return

                    if (!classMap.has(classId)) {
                        classMap.set(classId, {
                            grade,
                            class_id: classId,
                            total_count: 0,
                            rejected_count: 0,
                            pending_count: 0,
                            total_score: 0,
                        })
                    }
                    const row = classMap.get(classId)
                    row.total_count += 1
                    row.total_score += Number(app.score || 0)
                    if (app.status === 'rejected') row.rejected_count += 1
                    if (PENDING_STATUSES.includes(app.status)) row.pending_count += 1
                })

            const list = [...classMap.values()]
                .map((row) => ({
                    ...row,
                    average_score: row.total_count > 0
                        ? Number((row.total_score / row.total_count).toFixed(2))
                        : 0,
                    total_score: Number(row.total_score.toFixed(2)),
                }))
                .sort((a, b) => a.class_id - b.class_id)

            return success({ list }, '获取成功')
        },
    },
]
