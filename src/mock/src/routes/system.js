import express from 'express';

const router = express.Router();

// Mock system configuration data
const systemConfig = {
    award_types: ["discipline_competition", "volunteer", "paper"],
    award_levels: ["school", "city", "province", "national"],
    upload_limit_mb: 20,
    upload_accept: ["pdf", "jpg", "jpeg", "png"],
    email_template: "Default email template content"
};

// Fetch system configuration
router.get('/configs', (req, res) => {
    res.json({
        code: 0,
        message: "获取成功",
        data: systemConfig
    });
});

// Update system configuration
router.put('/configs', (req, res) => {
    const { award_types, award_levels, upload_limit_mb, upload_accept, email_template } = req.body;

    // Update the mock configuration
    if (award_types) systemConfig.award_types = award_types;
    if (award_levels) systemConfig.award_levels = award_levels;
    if (upload_limit_mb) systemConfig.upload_limit_mb = upload_limit_mb;
    if (upload_accept) systemConfig.upload_accept = upload_accept;
    if (email_template) systemConfig.email_template = email_template;

    res.json({
        code: 0,
        message: "更新成功",
        data: systemConfig
    });
});

export default router;