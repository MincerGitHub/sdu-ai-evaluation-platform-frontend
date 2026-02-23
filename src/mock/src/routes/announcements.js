import express from 'express';

const router = express.Router();

let announcements = [
    {
        id: 1,
        title: "2025-2026学年第一学期综测公示",
        scope: {
            grade: 2023,
            class_ids: [301, 302]
        },
        start_at: "2026-02-15T00:00:00Z",
        end_at: "2026-02-20T23:59:59Z",
        show_fields: ["name", "class", "score", "rank"]
    },
    {
        id: 2,
        title: "2025-2026学年第二学期综测公示",
        scope: {
            grade: 2023,
            class_ids: [301]
        },
        start_at: "2026-09-01T00:00:00Z",
        end_at: "2026-09-10T23:59:59Z",
        show_fields: ["name", "class", "score", "rank"]
    }
];

// Fetch all announcements
router.get('/', (req, res) => {
    res.json({
        code: 0,
        message: "获取成功",
        data: announcements
    });
});

// Create a new announcement
router.post('/', (req, res) => {
    const { title, scope, start_at, end_at, show_fields } = req.body;
    const newAnnouncement = {
        id: announcements.length + 1,
        title,
        scope,
        start_at,
        end_at,
        show_fields
    };
    announcements.push(newAnnouncement);
    res.status(201).json({
        code: 0,
        message: "创建成功",
        data: newAnnouncement
    });
});

export default router;