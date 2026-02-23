import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 获取当前用户信息
router.get('/me', authenticate, (req, res) => {
    const user = req.user;

    return res.json({
        code: 0,
        message: '获取成功',
        data: {
            id: user.id,
            name: user.name,
            role: user.role,
            is_reviewer: user.is_reviewer,
            class_id: user.class_id,
        },
    });
});

export default router;