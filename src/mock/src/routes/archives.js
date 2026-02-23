import express from 'express';

const router = express.Router();

// Mock archive data
let archives = [];

// Create an archive record
router.post('/', (req, res) => {
    const { archive_name, term, grade, class_ids } = req.body;
    const newArchive = {
        archive_id: `arc_${archives.length + 1}`,
        archive_name,
        term,
        grade,
        class_ids,
        total_score: Math.random() * 100, // Mock total score
        category_scores: [
            { category: 'intellectual', score: Math.random() * 50 },
            { category: 'moral', score: Math.random() * 50 },
        ],
        created_at: new Date().toISOString(),
    };
    archives.push(newArchive);
    res.status(201).json({
        code: 0,
        message: '创建成功',
        data: newArchive,
    });
});

// Get all archive records
router.get('/', (req, res) => {
    res.status(200).json({
        code: 0,
        message: '获取成功',
        data: archives,
    });
});

// Get archive details by ID
router.get('/:archive_id', (req, res) => {
    const archive = archives.find(a => a.archive_id === req.params.archive_id);
    if (archive) {
        res.status(200).json({
            code: 0,
            message: '获取成功',
            data: archive,
        });
    } else {
        res.status(404).json({
            code: 1002,
            message: '资源不存在',
        });
    }
});

// Download archive file (mock implementation)
router.get('/:archive_id/download', (req, res) => {
    const archive = archives.find(a => a.archive_id === req.params.archive_id);
    if (archive) {
        res.status(200).json({
            code: 0,
            message: '下载成功',
            data: {
                download_url: `/downloads/${archive.archive_id}.zip`, // Mock download URL
            },
        });
    } else {
        res.status(404).json({
            code: 1002,
            message: '资源不存在',
        });
    }
});

export default router;