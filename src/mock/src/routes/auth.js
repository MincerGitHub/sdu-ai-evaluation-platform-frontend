import express from 'express';
import { findUserByAccount } from '../services/mockDb.js';
import {
    generateAccessToken,
    generateRefreshToken,
    validateRefreshToken,
    revokeRefreshToken,
} from '../services/tokenService.js';
import { ERROR_CODES } from '../utils/constants.js';

const router = express.Router();

// 登录
router.post('/login', (req, res) => {
    const { account, password } = req.body;

    // 简化：密码固定为 "password"
    const user = findUserByAccount(account);
    if (!user || password !== 'password') {
        return res.status(401).json({
            code: ERROR_CODES.NOT_LOGGED_IN,
            message: '账号或密码错误',
        });
    }

    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    return res.json({
        code: 0,
        message: '登录成功',
        data: {
            user,
            access_token,
            refresh_token,
            expires_in: 7200, // 与 TOKEN_EXPIRATION 对应的秒数
        },
    });
});

// 退出登录
router.post('/logout', (req, res) => {
    const { refresh_token } = req.body;

    if (refresh_token) {
        revokeRefreshToken(refresh_token);
    }

    return res.json({
        code: 0,
        message: '退出成功',
    });
});

// 刷新 AccessToken
router.post('/refresh', (req, res) => {
    const { refresh_token } = req.body;

    const userId = validateRefreshToken(refresh_token);
    if (!userId) {
        return res.status(400).json({
            code: ERROR_CODES.REFRESH_TOKEN_INVALID,
            message: 'refresh token 无效或过期',
        });
    }

    // 直接构造简化用户对象（或用 findUserById）
    const access_token = generateAccessToken({ id: userId, role: 'student' });

    return res.json({
        code: 0,
        message: '刷新成功',
        data: {
            access_token,
            expires_in: 7200,
        },
    });
});

export default router;