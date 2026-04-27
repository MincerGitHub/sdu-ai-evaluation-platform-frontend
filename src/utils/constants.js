const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
}

const APPLICATION_STATUSES = {
  PENDING_AI: 'pending_ai',
  AI_ABNORMAL: 'ai_abnormal',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
  WITHDRAWN: 'withdrawn',
}

const APPLICATION_STATUS_META = {
  pending_ai: {
    label: '待AI审核',
    tagType: 'info',
  },
  ai_abnormal: {
    label: 'AI异常',
    tagType: 'danger',
  },
  pending_review: {
    label: '待人工审核',
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
  },
}

const SCORE_CATEGORY_META = {
  physical_mental: {
    label: '身心素养',
    maxScore: 15,
    basicMaxScore: 9,
    achievementMaxScore: 6,
    achievementLabel: '成果',
  },
  art: {
    label: '文艺素养',
    maxScore: 15,
    basicMaxScore: 9,
    achievementMaxScore: 6,
    achievementLabel: '成果',
  },
  labor: {
    label: '劳动素养',
    maxScore: 25,
    basicMaxScore: 15,
    achievementMaxScore: 10,
    achievementLabel: '成果',
  },
  innovation: {
    label: '创新素养',
    maxScore: 45,
    basicMaxScore: 5,
    achievementMaxScore: 40,
    achievementLabel: '突破',
  },
}

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
}

export {
  ROLES,
  APPLICATION_STATUSES,
  APPLICATION_STATUS_META,
  SCORE_CATEGORY_META,
  ERROR_CODES,
}
