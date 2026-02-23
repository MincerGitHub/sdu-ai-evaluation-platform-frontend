import express from 'express';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// Mock data for teacher applications
const mockApplications = [
    {
        id: 1,
        title: 'Math Olympiad',
        description: 'Participation in the National Math Olympiad',
        status: 'approved',
        student_id: 101,
        student_name: 'Alice',
        score: 95,
    },
    {
        id: 2,
        title: 'Science Fair',
        description: 'Project on Renewable Energy',
        status: 'pending_review',
        student_id: 102,
        student_name: 'Bob',
        score: null,
    },
];

// Fetch applications for a teacher
router.get('/applications', (req, res) => {
    // In a real application, you would fetch this data from a database
    res.json({
        code: 0,
        message: 'Applications fetched successfully',
        data: mockApplications,
    });
});

// Fetch statistics for a teacher
router.get('/statistics', (req, res) => {
    const statistics = {
        totalApplications: mockApplications.length,
        approvedCount: mockApplications.filter(app => app.status === 'approved').length,
        pendingCount: mockApplications.filter(app => app.status === 'pending_review').length,
    };

    res.json({
        code: 0,
        message: 'Statistics fetched successfully',
        data: statistics,
    });
});

export default router;