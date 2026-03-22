const ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin',
};

const APPLICATION_STATUSES = {
    PENDING_AI: 'pending_ai',
    PENDING_REVIEW: 'pending_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ARCHIVED: 'archived',
    WITHDRAWN: 'withdrawn', // 撤回状态没用到
};

// 统一的状态元信息（文案 + tag 样式）
const APPLICATION_STATUS_META = {
    pending_ai: {
        label: '待AI评价',
        tagType: 'info',
    },
    pending_review: {
        label: '待审核',
        tagType: 'warning',
    },
    approved: {
        label: '已通过',
        tagType: 'success',
    },
    rejected: {
        label: '已驳回',
        tagType: 'danger',
    },
    archived: {
        label: '已归档',
        tagType: 'info',
    },
    withdrawn: {
        label: '已撤回',
        tagType: 'default',
    }
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
    ROLES,
    APPLICATION_STATUSES,
    APPLICATION_STATUS_META,
    ERROR_CODES,
};