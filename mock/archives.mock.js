import { success, fail, now, getCurrentUser } from './utils.js'
import { archives, announcements, exportTasks, seq } from './mockData.js'

export default [
    // 【旧导出接口，仍保留：创建“教师导出任务”】
    {
        url: '/api/v1/teacher/exports',
        method: 'post',
        response({ headers, body }) {
            const currentUser = getCurrentUser(headers)
            if (!currentUser) return fail(1004, '未登录或 token 缺失')

            const { scope, format, filters } = body || {}
            if (!scope || !format) return fail(1001, 'scope/format 必填')

            const task_id = `exp_${++seq.exportTask}`
            const task = {
                task_id,
                scope,
                format,
                filters: filters || {},
                status: 'completed',
                created_by: currentUser.id,
                file_url: `/api/v1/teacher/exports/${task_id}/download`,
                created_at: now(),
                completed_at: now(),
            }
            exportTasks.push(task)
            return success({ task_id }, '导出任务已创建')
        },
    },
    {
        url: '/api/v1/teacher/exports/:task_id',
        method: 'get',
        response({ query }) {
            const task = exportTasks.find((t) => t.task_id === query.task_id)
            if (!task) return fail(1002, '导出任务不存在')
            return success(task, '获取成功')
        },
    },

    // 【新导出接口】用于前端 ExportPage：创建导出任务 + 可选写入归档
    {
        url: '/api/v1/archives/exports',
        method: 'post',
        response({ headers, body }) {
            const currentUser = getCurrentUser(headers)
            if (!currentUser) return fail(1004, '未登录或 token 缺失')

            const { scope, format, filters, store_to_archive } = body || {}
            if (!scope || !format) return fail(1001, 'scope/format 必填')

            // 1）先创建导出任务
            const task_id = `exp_${++seq.exportTask}`
            const task = {
                task_id,
                scope,
                format,
                filters: filters || {},
                status: 'completed',
                created_by: currentUser.id,
                file_url: `/api/v1/teacher/exports/${task_id}/download`,
                created_at: now(),
                completed_at: now(),
            }
            exportTasks.push(task)

            // 2）根据 store_to_archive 决定是否写入归档列表
            if (store_to_archive) {
                // 从 filters 中推导年级、班级列表（简化逻辑，仅 mock）
                const grade = filters?.grade ? Number(filters.grade) : null
                const class_ids = []
                if (filters?.class_id) {
                    class_ids.push(Number(filters.class_id))
                } else {
                    // 不传 class_id：代表全年级，mock 中随便给一个示例集合
                    class_ids.push(301, 302, 303)
                }

                const archive = {
                    archive_id: `arc_${++seq.archive}`,
                    archive_name: `导出归档_${task_id}`,
                    term: '2025-2026-1',
                    grade: grade || 2023,
                    class_ids,
                    is_announced: false,
                    export_task_id: task_id,
                    created_at: now(),
                }
                archives.push(archive)
            }

            // 与前端约定：只关心 task_id
            return success({ task_id }, '导出任务已创建')
        },
    },

    {
        url: '/api/v1/archives/exports/:archive_id/download',
        method: 'get',
        response({ query }) {
            const archive = archives.find((a) => a.archive_id === query.archive_id)
            if (!archive) return fail(1002, '归档记录不存在')
            return success(
                { message: `模拟下载归档 ${query.archive_id}`, archive_name: archive.archive_name },
                '获取成功',
            )
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
        url: '/api/v1/announcements',
        method: 'post',
        response({ body }) {
            const { title, archive_id, start_at, end_at } = body || {}
            if (!title || !archive_id) return fail(1001, 'title/archive_id 必填')
            const announcement = {
                id: ++seq.announcement,
                title,
                archive_id,
                start_at: start_at || now(),
                end_at: end_at || null,
                status: 'active',
                created_at: now(),
            }
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