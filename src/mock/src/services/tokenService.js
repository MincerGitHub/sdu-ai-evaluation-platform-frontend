import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const SECRET_KEY = 'your_secret_key';       // 实际项目请放到环境变量
const TOKEN_EXPIRATION = '2h';              // AccessToken 过期时间

// 内存中保存 refresh token 与用户映射（简单 mock）
const refreshTokens = new Map();

export function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role },
        SECRET_KEY,
        { expiresIn: TOKEN_EXPIRATION },
    );
}

export function generateRefreshToken(user) {
    const refreshToken = uuidv4();
    refreshTokens.set(refreshToken, user.id);
    return refreshToken;
}

export function validateAccessToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
}

export function validateRefreshToken(token) {
    const userId = refreshTokens.get(token);
    if (!userId) return null;
    return userId;
}

export function revokeRefreshToken(token) {
    refreshTokens.delete(token);
}