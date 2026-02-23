import express from 'express';

const router = express.Router();

// Mock data for notifications
const notifications = [
    {
        id: 1,
        application_id: 9001,
        to: "student@example.com",
        reason: "缺少盖章证明",
        status: "sent",
        created_at: new Date().toISOString(),
    },
    {
        id: 2,
        application_id: 9002,
        to: "student2@example.com",
        reason: "材料不完整",
        status: "sent",
        created_at: new Date().toISOString(),
    },
];

// Route to send rejection notification
router.post('/reject-email', (req, res) => {
    const { application_id, to, reason } = req.body;

    // Simulate sending an email
    const notification = {
        id: notifications.length + 1,
        application_id,
        to,
        reason,
        status: "sent",
        created_at: new Date().toISOString(),
    };

    notifications.push(notification);
    res.status(200).json({
        code: 0,
        message: "通知发送成功",
        data: notification,
    });
});

// Route to get email logs
router.get('/email-logs', (req, res) => {
    const { status } = req.query;
    const filteredNotifications = notifications.filter(n => !status || n.status === status);

    res.status(200).json({
        code: 0,
        message: "获取成功",
        data: filteredNotifications,
    });
});

export default router;