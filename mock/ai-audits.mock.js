import { success, fail, paginate } from './utils.js'

const reports = {
    10: {
        application_id: 10,
        ocr_text: '全国大学生数学建模竞赛 省级一等奖 张三 20260001',
        identity_check: { matched: true, matched_fields: ['姓名', '学号'] },
        consistency_check: { matched: true, diff: [] },
        result: 'pass',
        risk_points: [],
        score_breakdown: [
            { rule_code: 'R_COMPETITION_LEVEL', rule_name: '竞赛级别', score: 4.0 },
            { rule_code: 'R_MATERIAL_COMPLETENESS', rule_name: '材料完整度', score: 2.0 },
        ],
        score: 6.0,
        total_score: 26.5,
        audited_at: '2026-02-21T10:03:30Z',
    },
    14: {
        application_id: 14,
        ocr_text: '农场劳动证明 劳动时长20小时',
        identity_check: { matched: true, matched_fields: ['姓名'] },
        consistency_check: { matched: false, diff: ['劳动时长不一致：申报36小时，证明20小时'] },
        result: 'abnormal',
        risk_points: ['劳动时长不一致'],
        score_breakdown: [
            { rule_code: 'R_LABOR_HOURS', rule_name: '劳动时长', score: 1.0 },
            { rule_code: 'R_MATERIAL_COMPLETENESS', rule_name: '材料完整度', score: 1.0 },
        ],
        score: 2.0,
        total_score: 22.5,
        audited_at: '2026-02-17T09:05:00Z',
    },
}

const auditLogs = [
    { id: 1, application_id: 10, result: 'pass', audited_at: '2026-02-21T10:03:30Z' },
    { id: 2, application_id: 14, result: 'abnormal', audited_at: '2026-02-17T09:05:00Z' },
    { id: 3, application_id: 12, result: 'pass', audited_at: '2026-02-19T12:02:00Z' },
]

const aiConfig = {
    enabled: true,
    fallback_to_manual: true,
    ocr_provider: 'baidu',
}

export default [
    {
        url: '/api/v1/ai-audits/:application_id/report',
        method: 'get',
        response({ params }) {
            const id = Number(params.application_id)
            const report = reports[id]
            if (!report) return fail(1002, '暂无 AI 审核报告')
            return success(report, '获取成功')
        },
    },
    {
        url: '/api/v1/ai-audits/logs',
        method: 'get',
        response({ query }) {
            const { result, page, size } = query || {}
            let list = [...auditLogs]
            if (result) list = list.filter((l) => l.result === result)
            return success(paginate(list, page, size), '获取成功')
        },
    },
    {
        url: '/api/v1/ai-audits/config',
        method: 'get',
        response() {
            return success(aiConfig, '获取成功')
        },
    },
    {
        url: '/api/v1/ai-audits/config',
        method: 'put',
        response({ body }) {
            const { enabled, fallback_to_manual, ocr_provider } = body || {}
            if (enabled !== undefined) aiConfig.enabled = enabled
            if (fallback_to_manual !== undefined) aiConfig.fallback_to_manual = fallback_to_manual
            if (ocr_provider !== undefined) aiConfig.ocr_provider = ocr_provider
            return success(aiConfig, '更新成功')
        },
    },
]