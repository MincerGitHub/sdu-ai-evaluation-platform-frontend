import { success, fail, now } from './utils.js'

const archives = [
    { archive_id: 'arc_9001', archive_name: '2025-2026-1_2023级_综测统计表', term: '2025-2026-1', grade: 2023, class_ids: [301, 302], is_announced: true, export_task_id: 'exp_10001', created_at: '2026-02-25T10:00:00Z' },
    { archive_id: 'arc_9002', archive_name: '2025-2026-2_2023级_综测统计表', term: '2025-2026-2', grade: 2023, class_ids: [301, 302], is_announced: false, export_task_id: 'exp_10002', created_at: '2026-02-26T10:00:00Z' },
]

const announcements = [
    { id: 1, title: '2025-2026学年第一学期综测公示', archive_id: 'arc_9001', start_at: '2026-02-15T00:00:00Z', end_at: '2026-02-20T23:59:59Z', status: 'active', created_at: '2026-02-14T10:00:00Z' },
]

let archiveSeq = 9100
let announcementSeq = 100

export default [
    {
        url: '/api/v1/archives/exports',
        method: 'post',
        response({ body }) {
            const { export_task_id } = body || {}
            if (!export_task_id) return fail(1001, 'export_task_id 必填')
            const archive = { archive_id: `arc_${++archiveSeq}`, archive_name: `归档_${export_task_id}`, term: '2025-2026-1', grade: 2023, class_ids: [301, 302], is_announced: false, export_task_id, created_at: now() }
            archives.push(archive)
            return success(archive, '创建成功')
        },
    },
    {
        url: '/api/v1/archives/exports',
        method: 'get',
        response({ query }) {
            const { term, grade, class_id } = query || {}
            let list = [...archives]
            if (term) list = list.filter((a) => a.term === term)
            if (grade) list = list.filter((a) => a.grade === Number(grade))
            if (class_id) list = list.filter((a) => a.class_ids.includes(Number(class_id)))
            return success(list, '获取成功')
        },
    },
    {
        url: '/api/v1/archives/exports/:archive_id/download',
        method: 'get',
        response({ params }) {
            const archive = archives.find((a) => a.archive_id === params.archive_id)
            if (!archive) return fail(1002, '归档记录不存在')
            return success({ message: `模拟下载归档 ${params.archive_id}`, archive_name: archive.archive_name }, '获取成功')
        },
    },
    {
        url: '/api/v1/announcements',
        method: 'post',
        response({ body }) {
            const { title, archive_id, start_at, end_at } = body || {}
            if (!title || !archive_id) return fail(1001, 'title/archive_id 必填')
            const announcement = { id: ++announcementSeq, title, archive_id, start_at: start_at || now(), end_at: end_at || null, status: 'active', created_at: now() }
            announcements.push(announcement)
            const arc = archives.find((a) => a.archive_id === String(archive_id))
            if (arc) arc.is_announced = true
            return success(announcement, '发布成功')
        },
    },
    {
        url: '/api/v1/announcements',
        method: 'get',
        response() {
            return success(announcements, '获取成功')
        },
    },
]