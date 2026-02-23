export const mockAiAuditReports = [
    {
        application_id: 9001,
        result: 'pass',
        score: 95,
        audited_at: '2026-02-13T10:03:30Z',
    },
    {
        application_id: 9002,
        result: 'abnormal',
        score: 60,
        audited_at: '2026-02-14T11:00:00Z',
    },
];

export const users = [
    {
        id: 1,
        account: 'student1',
        name: '张三',
        role: 'student',
        is_reviewer: false,
        class_id: 301,
    },
    {
        id: 2,
        account: 'student2',
        name: '王五',
        role: 'student',
        is_reviewer: true,
        class_id: 301,
    },
    {
        id: 3,
        account: 'teacher',
        name: '李四',
        role: 'teacher',
        is_reviewer: false,
        class_id: null,
    },
    {
        id: 4,
        account: 'admin',
        name: '管理员',
        role: 'admin',
        is_reviewer: false,
        class_id: null,
    },
];

// 简单的查找工具函数
export function findUserByAccount(account) {
    return users.find((u) => u.account === account) || null;
}

export function findUserById(id) {
    return users.find((u) => u.id === id) || null;
}