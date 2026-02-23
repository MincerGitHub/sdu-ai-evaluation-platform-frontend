import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock data for reviews
const reviews = [
    {
        application_id: 9001,
        student_name: "张三",
        status: "pending_review",
        item_score: 3.0,
        score_rule_version: "v2026.02"
    },
    {
        application_id: 9002,
        student_name: "李四",
        status: "approved",
        item_score: 5.0,
        score_rule_version: "v2026.02"
    },
    {
        application_id: 9003,
        student_name: "王五",
        status: "rejected",
        item_score: 2.0,
        score_rule_version: "v2026.02"
    }
];

// Get pending reviews
router.get('/pending', (req, res) => {
    const pendingReviews = reviews.filter(review => review.status === 'pending_review');
    res.json({
        code: 0,
        message: "获取成功",
        data: {
            list: pendingReviews
        }
    });
});

// Get review details
router.get('/:application_id', (req, res) => {
    const review = reviews.find(r => r.application_id === parseInt(req.params.application_id));
    if (review) {
        res.json({
            code: 0,
            message: "获取成功",
            data: review
        });
    } else {
        res.status(404).json({
            code: 1002,
            message: "资源不存在"
        });
    }
});

// Submit review decision
router.post('/:application_id/decision', (req, res) => {
    const { decision, comment } = req.body;
    const review = reviews.find(r => r.application_id === parseInt(req.params.application_id));
    if (review) {
        review.status = decision === 'approved' ? 'approved' : 'rejected';
        res.json({
            code: 0,
            message: "审核决策已提交",
            data: {
                application_id: review.application_id,
                decision,
                comment
            }
        });
    } else {
        res.status(404).json({
            code: 1002,
            message: "资源不存在"
        });
    }
});

// Get review history
router.get('/history', (req, res) => {
    const history = reviews.map(review => ({
        application_id: review.application_id,
        student_name: review.student_name,
        status: review.status,
        item_score: review.item_score
    }));
    res.json({
        code: 0,
        message: "获取成功",
        data: history
    });
});

export default router;