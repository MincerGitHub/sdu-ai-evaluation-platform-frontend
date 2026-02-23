const API_BASE_URL = '/api/v1';

const ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin',
};

const APPLICATION_STATUSES = {
    PENDING_AI: 'pending_ai',
    AI_ABNORMAL: 'ai_abnormal',
    PENDING_REVIEW: 'pending_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ARCHIVED: 'archived',
    WITHDRAWN: 'withdrawn',
};

const ERROR_CODES = {
    SUCCESS: 0,
    GENERAL_FAILURE: 1000,
    PARAMETER_VALIDATION_FAILED: 1001,
    RESOURCE_NOT_FOUND: 1002,
    NO_PERMISSION: 1003,
    NOT_LOGGED_IN: 1004,
    ACCESS_TOKEN_INVALID: 1005,
    REFRESH_TOKEN_INVALID: 1006,
    CONCURRENT_CONFLICT: 1007,
    INVALID_FILE: 1008,
    AI_AUDIT_SERVICE_EXCEPTION: 1009,
    EMAIL_SEND_FAILURE: 1010,
};

export {
    API_BASE_URL,
    ROLES,
    APPLICATION_STATUSES,
    ERROR_CODES,
};