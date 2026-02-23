import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock database
const applications = [];

// Create application
router.post('/', (req, res) => {
    const { award_type, award_level, title, description, occurred_at, attachments } = req.body;

    const newApplication = {
        id: uuidv4(),
        award_type,
        award_level,
        title,
        description,
        occurred_at,
        attachments,
        status: 'pending_ai',
        item_score: null,
        total_score: null,
        created_at: new Date().toISOString(),
    };

    applications.push(newApplication);
    res.status(201).json({
        code: 0,
        message: '创建成功',
        data: newApplication,
    });
});

// Get my applications
router.get('/my', (req, res) => {
    const { userId } = req; // Assuming userId is set in middleware after authentication
    const userApplications = applications.filter(app => app.userId === userId);
    
    res.status(200).json({
        code: 0,
        message: '获取成功',
        data: userApplications,
    });
});

// Get application details
router.get('/:application_id', (req, res) => {
    const { application_id } = req.params;
    const application = applications.find(app => app.id === application_id);

    if (!application) {
        return res.status(404).json({
            code: 1002,
            message: '资源不存在',
        });
    }

    res.status(200).json({
        code: 0,
        message: '获取成功',
        data: application,
    });
});

// Get categories (for demonstration purposes)
router.get('/categories', (req, res) => {
    const categories = [
        {
            category: 'moral',
            name: '思想道德',
            children: [
                { code: 'volunteer', name: '志愿服务' },
                { code: 'social_practice', name: '社会实践' },
            ],
        },
        {
            category: 'intellectual',
            name: '学业科研',
            children: [
                { code: 'discipline_competition', name: '学科竞赛' },
                { code: 'paper', name: '论文成果' },
            ],
        },
    ];

    res.status(200).json({
        code: 0,
        message: '获取成功',
        data: categories,
    });
});

export default router;