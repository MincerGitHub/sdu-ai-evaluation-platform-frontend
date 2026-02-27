import { success, paginate } from './utils.js'

const classesOverview = {
    2023: [
        { class_id: 301, class_name: '23级1班', total_students: 42, submitted_students: 35, submission_rate: 0.8333, pending_review: 12, approved: 60, rejected: 14, total_score: 187.5, avg_score: 5.36 },
        { class_id: 302, class_name: '23级2班', total_students: 40, submitted_students: 32, submission_rate: 0.8, pending_review: 8, approved: 55, rejected: 10, total_score: 165.0, avg_score: 5.16 },
        { class_id: 303, class_name: '23级3班', total_students: 38, submitted_students: 30, submission_rate: 0.7895, pending_review: 6, approved: 48, rejected: 8, total_score: 142.0, avg_score: 4.73 },
    ],
    2024: [
        { class_id: 401, class_name: '24级1班', total_students: 45, submitted_students: 38, submission_rate: 0.8444, pending_review: 15, approved: 50, rejected: 12, total_score: 195.0, avg_score: 5.13 },
    ],
}

const classStudents = {
    301: [
        { student_id: 1, student_name: '张三', account: '20260001', total_score: 8.0, approved_count: 2, pending_count: 3, rejected_count: 1 },
        { student_id: 2, student_name: '李四', account: '20260002', total_score: 1.5, approved_count: 0, pending_count: 1, rejected_count: 0 },
        { student_id: 3, student_name: '王五', account: '20260003', total_score: 5.0, approved_count: 1, pending_count: 0, rejected_count: 0 },
    ],
    302: [
        { student_id: 5, student_name: '赵六', account: '20260005', total_score: 6.0, approved_count: 1, pending_count: 1, rejected_count: 0 },
        { student_id: 6, student_name: '钱七', account: '20260006', total_score: 5.0, approved_count: 1, pending_count: 0, rejected_count: 0 },
    ],
}

export default [
    {
        url: '/api/v1/counselor/grades/:grade/classes/overview',
        method: 'get',
        response({ params, query }) {
            const grade = Number(params.grade)
            const term = query?.term || '2025-2026-1'
            const classes = classesOverview[grade] || []
            return success({ grade, term, classes }, '获取成功')
        },
    },
    {
        url: '/api/v1/counselor/grades/:grade/classes/:class_id',
        method: 'get',
        response({ params, query }) {
            const grade = Number(params.grade)
            const classId = Number(params.class_id)
            const term = query?.term || '2025-2026-1'
            const { page, size } = query || {}
            const students = classStudents[classId] || []
            return success({ grade, class_id: classId, term, ...paginate(students, page, size) }, '获取成功')
        },
    },
]