import { ERROR_CODES } from '../utils/constants.js';
import { validateAccessToken } from '../services/tokenService.js';
import { findUserById } from '../services/mockDb.js';

export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            code: ERROR_CODES.NOT_LOGGED_IN,
            message: '请先登录',
        });
    }

    const decoded = validateAccessToken(token);
    if (!decoded) {
        return res.status(403).json({
            code: ERROR_CODES.ACCESS_TOKEN_INVALID,
            message: 'Access Token 无效或已过期',
        });
    }

    const user = findUserById(decoded.id);
    if (!user) {
        return res.status(404).json({
            code: ERROR_CODES.RESOURCE_NOT_FOUND,
            message: '用户未找到',
        });
    }

    req.user = user;
    next();
};

export const authorize = (roles = []) => (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
            code: ERROR_CODES.NO_PERMISSION,
            message: '无权限访问该资源',
        });
    }
    next();
};