import express from 'express';
import { mockAiAuditReports } from '../services/mockDb.js';

const router = express.Router();

// Fetch AI audit report for a specific application
router.get('/:application_id/report', (req, res) => {
    const applicationId = req.params.application_id;
    const report = mockAiAuditReports.find(report => report.application_id === parseInt(applicationId));

    if (report) {
        res.json({
            code: 0,
            message: '获取成功',
            data: report,
        });
    } else {
        res.status(404).json({
            code: 1002,
            message: '资源不存在',
        });
    }
});

// Fetch AI audit logs
router.get('/logs', (req, res) => {
    // Simulate fetching logs from a mock database
    const logs = [
        {
            application_id: 9001,
            result: 'pass',
            audited_at: '2026-02-13T10:03:30Z',
        },
        {
            application_id: 9002,
            result: 'abnormal',
            audited_at: '2026-02-14T11:00:00Z',
        },
    ];

    res.json({
        code: 0,
        message: '获取成功',
        data: logs,
    });
});

// AI audit configuration
router.put('/config', (req, res) => {
    const { enabled, fallback_to_manual, ocr_provider } = req.body;

    // Simulate saving configuration
    res.json({
        code: 0,
        message: '配置更新成功',
        data: {
            enabled,
            fallback_to_manual,
            ocr_provider,
        },
    });
});

export default router;