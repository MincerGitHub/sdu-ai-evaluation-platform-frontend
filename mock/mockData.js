// ============================================================
// 统一 Mock 数据源
// 所有 *.mock.js 均从此文件导入，禁止在各自文件内定义业务数据
// ============================================================

// ------------------------------------------------------------
// 表1：用户表（与 auth.mock.js 保持完全一致）
// id 体系：学生 1~3，教师 4，管理员 5
// 学生2 是审核员（is_reviewer=true），绑定 reviewer_token_id=1
// ------------------------------------------------------------
export const users = [
    {
        id: 1,
        account: '20260001',
        password: '12345678',
        name: '学生1',
        role: 'student',
        class_id: 301,
        is_reviewer: false,
        reviewer_token_id: null,   // 未激活审核令牌
        email: 'xuesheng1@example.com',
        phone: '13800000001',
    },
    {
        id: 2,
        account: '20260002',
        password: '12345678',
        name: '学生2',
        role: 'student',
        class_id: 302,
        is_reviewer: true,
        reviewer_token_id: 1,      // 已激活令牌 id=1，class_ids=[301,302]
        email: 'xuesheng2@example.com',
        phone: '13800000002',
    },
    {
        id: 3,
        account: '20260003',
        password: '12345678',
        name: '学生3',
        role: 'student',
        class_id: 303,
        is_reviewer: false,
        reviewer_token_id: null,
        email: 'xuesheng3@example.com',
        phone: '13800000003',
    },
    {
        id: 4,
        account: 'teacher01',
        password: '12345678',
        name: '老师1',
        role: 'teacher',
        class_id: null,
        is_reviewer: false,
        reviewer_token_id: null,
        email: 'teacher01@example.com',
        phone: '13800000004',
    },
    {
        id: 5,
        account: 'admin01',
        password: '12345678',
        name: '管理员1',
        role: 'admin',
        class_id: null,
        is_reviewer: false,
        reviewer_token_id: null,
        email: 'admin01@example.com',
        phone: '13800000005',
    },
]

// ------------------------------------------------------------
// 表2：评审令牌表
// 令牌1：由教师(id=4)创建，覆盖班级 301/302/303，已被学生2(id=2)激活
// 令牌2：由教师(id=4)创建，覆盖班级 301，尚未激活
// 令牌3：由管理员(id=5)创建，已过期
// 令牌4：由教师(id=4)创建，已失效(revoked)
// ------------------------------------------------------------
export const reviewerTokens = [
    {
        id: 1,
        token: 'rvw_a1b2c3d4e5f6g7h8',
        type: 'reviewer',
        class_ids: [301, 302],
        status: 'active',
        created_by: 4,                              // 创建人：老师1
        expired_at: '2026-03-31T23:59:59+00:00',
        created_at: '2026-02-24T03:00:00+00:00',
        activated_at: '2026-02-24T03:10:23+00:00',
        activated_user_id: 2,                       // 激活人：学生2
        revoked_at: null,
        revoked_by: null,
    },
    {
        id: 2,
        token: 'rvw_b2c3d4e5f6g7h8i9',
        type: 'reviewer',
        class_ids: [301],
        status: 'active',
        created_by: 4,
        expired_at: '2026-03-31T23:59:59+00:00',
        created_at: '2026-02-25T10:00:00+00:00',
        activated_at: null,
        activated_user_id: null,
        revoked_at: null,
        revoked_by: null,
    },
    {
        id: 3,
        token: 'rvw_c3d4e5f6g7h8i9j0',
        type: 'reviewer',
        class_ids: [301, 302],
        status: 'expired',
        created_by: 5,
        expired_at: '2026-01-31T23:59:59+00:00',   // 已过期
        created_at: '2026-01-15T08:00:00+00:00',
        activated_at: null,
        activated_user_id: null,
        revoked_at: null,
        revoked_by: null,
    },
    {
        id: 4,
        token: 'rvw_d4e5f6g7h8i9j0k1',
        type: 'reviewer',
        class_ids: [303],
        status: 'revoked',
        created_by: 4,
        expired_at: '2026-03-31T23:59:59+00:00',
        created_at: '2026-02-10T09:00:00+00:00',
        activated_at: null,
        activated_user_id: null,
        revoked_at: '2026-02-20T12:00:00+00:00',
        revoked_by: 4,
    },
]

// ------------------------------------------------------------
// 表3：申报表（综测申报）
// user_id 全部对应 users 表中的学生（id 1~3）
// file_id 对应 表5：文件表
// ------------------------------------------------------------
export const applications = [
    // 学生1（id=1，class_id=301）的申报
    {
        id: 1,
        user_id: 1,
        category: 'physical_mental',
        sub_type: 'basic',
        award_uid: 1,
        title: '全国大学生数学建模竞赛',
        description: '团队获奖，获得省级一等奖',
        occurred_at: '2026-01-15',
        attachments: [{ file_id: 'file_001' }],
        status: 'pending_review',
        score: 5.0,
        comment: null,
        // version: 1,
        is_deleted: false,
        created_at: '2026-02-21T10:00:00+00:00',
        updated_at: '2026-02-21T10:00:00+00:00',
    },
    {
        id: 2,
        user_id: 1,
        category: 'physical_mental',
        sub_type: 'achievement',
        award_uid: 3,
        title: '校运动会 100 米第一名',
        description: '短跑项目冠军',
        occurred_at: '2026-03-10',
        attachments: [{ file_id: 'file_002' }],
        status: 'approved',
        score: 2.0,
        comment: '材料齐全，符合要求',
        // version: 2,
        is_deleted: false,
        created_at: '2026-02-20T08:00:00+00:00',
        updated_at: '2026-02-22T09:00:00+00:00',
    },
    {
        id: 3,
        user_id: 1,
        category: 'innovation',
        sub_type: 'basic',
        award_uid: 273,
        title: '大学生创新训练项目',
        description: '国家级大创项目结题',
        occurred_at: '2026-02-01',
        attachments: [],
        status: 'pending_review',
        score: 3.0,
        comment: null,
        // version: 1,
        is_deleted: false,
        created_at: '2026-02-19T12:00:00+00:00',
        updated_at: '2026-02-19T12:00:00+00:00',
    },
    {
        id: 4,
        user_id: 1,
        category: 'art',
        sub_type: 'basic',
        award_uid: 31,
        title: '校级合唱比赛二等奖',
        description: '获得二等奖',
        occurred_at: '2026-01-20',
        attachments: [{ file_id: 'file_003' }],
        status: 'rejected',
        score: 1.5,
        comment: '证明材料不清晰',
        // version: 2,
        is_deleted: false,
        created_at: '2026-02-18T14:00:00+00:00',
        updated_at: '2026-02-23T16:00:00+00:00',
    },
    {
        id: 5,
        user_id: 1,
        category: 'labor',
        sub_type: 'basic',
        award_uid: 60,
        title: '农场劳动实践',
        description: '劳动时长 36 小时',
        occurred_at: '2026-01-25',
        attachments: [],
        status: 'pending_review',
        score: 2.0,
        comment: null,
        // version: 1,
        is_deleted: false,
        created_at: '2026-02-17T09:00:00+00:00',
        updated_at: '2026-02-17T09:00:00+00:00',
    },
    // 学生2（id=2，class_id=302）的申报
    {
        id: 6,
        user_id: 2,
        category: 'physical_mental',
        sub_type: 'basic',
        award_uid: 2,
        title: '篮球联赛 MVP',
        description: '校级篮球联赛最有价值球员',
        occurred_at: '2026-02-05',
        attachments: [{ file_id: 'file_004' }],
        status: 'pending_review',
        score: 1.5,
        comment: null,
        // version: 1,
        is_deleted: false,
        created_at: '2026-02-16T11:00:00+00:00',
        updated_at: '2026-02-16T11:00:00+00:00',
    },
    {
        id: 7,
        user_id: 2,
        category: 'innovation',
        sub_type: 'achievement',
        award_uid: 318,
        title: 'ACM 区域赛银牌',
        description: '团队参赛获奖',
        occurred_at: '2026-02-15',
        attachments: [{ file_id: 'file_005' }],
        status: 'pending_review',
        score: 5.0,
        comment: null,
        // version: 1,
        is_deleted: false,
        created_at: '2026-02-21T10:00:00+00:00',
        updated_at: '2026-02-21T10:00:00+00:00',
    },
    {
        id: 8,
        user_id: 2,
        category: 'physical_mental',
        sub_type: 'basic',
        award_uid: 2,
        title: '太极拳比赛市级三等奖',
        description: '市级比赛',
        occurred_at: '2026-01-12',
        attachments: [],
        status: 'pending_teacher',           // 已过审核员，待教师复核
        score: 1.5,
        comment: '材料齐全',
        // version: 1,
        is_deleted: false,
        created_at: '2026-02-20T09:00:00+00:00',
        updated_at: '2026-02-27T10:00:00+00:00',
    },
    // 学生3（id=3，class_id=303）的申报
    {
        id: 9,
        user_id: 3,
        category: 'physical_mental',
        sub_type: 'basic',
        award_uid: 1,
        title: '羽毛球赛校级冠军',
        description: '校级单打冠军',
        occurred_at: '2026-03-01',
        attachments: [],
        status: 'pending_review',
        score: 3.0,
        comment: null,
        // version: 1,
        is_deleted: false,
        created_at: '2026-02-19T08:00:00+00:00',
        updated_at: '2026-02-19T08:00:00+00:00',
    },
    {
        id: 10,
        user_id: 3,
        category: 'innovation',
        sub_type: 'basic',
        award_uid: 316,
        title: '互联网+省赛金奖',
        description: '省级赛事金奖',
        occurred_at: '2026-02-20',
        attachments: [{ file_id: 'file_006' }],
        status: 'pending_teacher',           // 已过审核员，待教师复核
        score: 5.0,
        comment: '审核通过，材料齐全',
        // version: 1,
        is_deleted: false,
        created_at: '2026-02-18T12:00:00+00:00',
        updated_at: '2026-02-27T11:00:00+00:00',
    },
    {
        id: 11,
        user_id: 3,
        category: 'art',
        sub_type: 'basic',
        award_uid: 31,
        title: '书法比赛校级一等奖',
        description: '校级书法大赛',
        occurred_at: '2026-01-20',
        attachments: [],
        status: 'approved',
        score: 3.5,
        comment: '符合要求',
        // version: 2,
        is_deleted: false,
        created_at: '2026-02-23T14:00:00+00:00',
        updated_at: '2026-02-25T10:00:00+00:00',
    },
]

// ------------------------------------------------------------
// 表4：审核记录表
// reviewer_id：执行审核的用户 id
//   - 审核员操作：学生2（id=2，is_reviewer=true）
//   - 教师操作：老师1（id=4）
// application_id 对应 表3：申报表
// ------------------------------------------------------------
export const reviewRecords = [
    // 学生2（审核员）审核通过 -> application_id=2（学生1的申报），进入 approved
    {
        review_id: 1,
        application_id: 2,
        reviewer_id: 2,             // 审核员：学生2
        reviewer_role: 'reviewer',
        student_name: '学生1',
        class_id: 301,
        title: '校运动会 100 米第一名',
        decision: 'approved',
        result: 'approved',         // 最终结果（教师未改判，同 decision）
        comment: '材料齐全，符合要求',
        reviewed_at: '2026-02-22T09:00:00+00:00',
    },
    // 学生2（审核员）驳回 -> application_id=4（学生1的art申报）
    {
        review_id: 2,
        application_id: 4,
        reviewer_id: 2,
        reviewer_role: 'reviewer',
        student_name: '学生1',
        class_id: 301,
        title: '校级合唱比赛二等奖',
        decision: 'rejected',
        result: 'rejected',
        comment: '证明材料不清晰',
        reviewed_at: '2026-02-23T16:00:00+00:00',
    },
    // 学生2（审核员）审核通过 -> application_id=8（学生2自己的申报？）
    // 注意：审核员不能审核自己的申报，此条改为由 审核员 审核 学生3 的申报
    // application_id=11（学生3的art申报），进入 approved（已由教师复核）
    {
        review_id: 3,
        application_id: 11,
        reviewer_id: 2,
        reviewer_role: 'reviewer',
        student_name: '学生3',
        class_id: 303,
        title: '书法比赛校级一等奖',
        decision: 'approved',
        result: 'approved',
        comment: '符合要求',
        reviewed_at: '2026-02-24T10:00:00+00:00',
    },
    // 教师（id=4）复核通过 -> application_id=11
    {
        review_id: 4,
        application_id: 11,
        reviewer_id: 4,             // 教师：老师1
        reviewer_role: 'teacher',
        student_name: '学生3',
        class_id: 303,
        title: '书法比赛校级一等奖',
        decision: 'approved',
        result: 'approved',
        comment: '复核通过',
        reviewed_at: '2026-02-25T10:00:00+00:00',
    },
    // 学生2（审核员）审核通过 -> application_id=8（学生2太极拳），进入 pending_teacher
    // 但审核员不能审核自己的申报 -> 此条应由另一个审核员审核
    // mock 阶段暂时保留，真实后端会校验权限
    {
        review_id: 5,
        application_id: 8,
        reviewer_id: 2,
        reviewer_role: 'reviewer',
        student_name: '学生2',
        class_id: 302,
        title: '太极拳比赛市级三等奖',
        decision: 'approved',
        result: 'pending_teacher',  // 审核员通过后进入教师复核
        comment: '材料齐全',
        reviewed_at: '2026-02-27T10:00:00+00:00',
    },
    // 学生2（审核员）审核通过 -> application_id=10（学生3互联网+），进入 pending_teacher
    {
        review_id: 6,
        application_id: 10,
        reviewer_id: 2,
        reviewer_role: 'reviewer',
        student_name: '学生3',
        class_id: 303,
        title: '互联网+省赛金奖',
        decision: 'approved',
        result: 'pending_teacher',
        comment: '审核通过，材料齐全',
        reviewed_at: '2026-02-27T11:00:00+00:00',
    },
]

// ------------------------------------------------------------
// 表5：文件表
// uploader_id 对应 users 表
// ------------------------------------------------------------
export const files = [
    {
        file_id: 'file_001',
        filename: '数学建模获奖证书.pdf',
        content_type: 'application/pdf',
        size: 245761,
        uploader_id: 1,
        url: '/api/v1/files/file_001',
        created_at: '2026-02-21T09:50:00+00:00',
    },
    {
        file_id: 'file_002',
        filename: '运动会成绩证明.jpg',
        content_type: 'image/jpeg',
        size: 102400,
        uploader_id: 1,
        url: '/api/v1/files/file_002',
        created_at: '2026-02-20T07:55:00+00:00',
    },
    {
        file_id: 'file_003',
        filename: '合唱比赛获奖证书.jpg',
        content_type: 'image/jpeg',
        size: 98304,
        uploader_id: 1,
        url: '/api/v1/files/file_003',
        created_at: '2026-02-18T13:45:00+00:00',
    },
    {
        file_id: 'file_004',
        filename: '篮球MVP证书.png',
        content_type: 'image/png',
        size: 153600,
        uploader_id: 2,
        url: '/api/v1/files/file_004',
        created_at: '2026-02-16T10:50:00+00:00',
    },
    {
        file_id: 'file_005',
        filename: 'ACM获奖证书.pdf',
        content_type: 'application/pdf',
        size: 312320,
        uploader_id: 2,
        url: '/api/v1/files/file_005',
        created_at: '2026-02-21T09:45:00+00:00',
    },
    {
        file_id: 'file_006',
        filename: '互联网+获奖证书.pdf',
        content_type: 'application/pdf',
        size: 276480,
        uploader_id: 3,
        url: '/api/v1/files/file_006',
        created_at: '2026-02-18T11:55:00+00:00',
    },
]

// ------------------------------------------------------------
// 表6：申诉表
// student_id 对应 users 表中的学生（id 1~3）
// announcement_id 对应公示（暂用固定值 1）
// attachments 中的 file_id 对应 表5：文件表
// ------------------------------------------------------------
export const appeals = [
    // 学生1（id=1）对公示1发起申诉：体育加分未统计（待处理）
    {
        id: 1,
        announcement_id: 1,
        student_id: 1,              // 学生1
        student_name: '学生1',
        content: '我认为体育加分项未统计，校运动会 100 米第一名的加分没有体现',
        attachments: [{ file_id: 'file_002' }],  // 运动会成绩证明.jpg
        result: null,
        result_comment: null,
        status: 'pending',
        created_at: '2026-02-28T10:00:00+00:00',
        processed_at: null,
        processed_by: null,         // 处理人 user_id（教师/管理员）
    },
    // 学生2（id=2）对公示1发起申诉：篮球联赛 MVP 加分有误（已驳回）
    {
        id: 2,
        announcement_id: 1,
        student_id: 2,              // 学生2
        student_name: '学生2',
        content: '篮球联赛 MVP 加分有误，应计 1.5 分但公示中为 0',
        attachments: [{ file_id: 'file_004' }],  // 篮球MVP证书.png
        result: 'rejected',
        result_comment: '该申报尚在审核流程中，公示数据以最终审定结果为准',
        status: 'processed',
        created_at: '2026-02-28T11:00:00+00:00',
        processed_at: '2026-02-28T15:00:00+00:00',
        processed_by: 4,            // 处理人：老师1
    },
    // 学生3（id=3）对公示1发起申诉：互联网+奖项分值有误（已通过）
    {
        id: 3,
        announcement_id: 1,
        student_id: 3,              // 学生3
        student_name: '学生3',
        content: '互联网+省赛金奖应计 5.0 分，公示中显示 3.0 分，请核实',
        attachments: [{ file_id: 'file_006' }],  // 互联网+获奖证书.pdf
        result: 'approved',
        result_comment: '核实后确认分值有误，已更正为 5.0 分',
        status: 'processed',
        created_at: '2026-02-28T12:00:00+00:00',
        processed_at: '2026-02-28T16:00:00+00:00',
        processed_by: 4,            // 处理人：老师1
    },
]

// ------------------------------------------------------------
// 表7：导出任务表
// 由教师发起导出操作后生成
// ------------------------------------------------------------
export const exportTasks = [
    {
        task_id: 'exp_1',
        scope: 'applications',
        format: 'xlsx',
        filters: { grade: 2023, class_id: 301, status: 'approved' },
        status: 'completed',          // pending | processing | completed | failed
        created_by: 4,                // 老师1
        file_url: '/api/v1/teacher/exports/exp_10001/download',
        created_at: '2026-02-25T09:00:00+00:00',
        completed_at: '2026-02-25T09:05:00+00:00',
    },
    {
        task_id: 'exp_2',
        scope: 'statistic',
        format: 'pdf',
        filters: { grade: 2023, class_id: 302 },
        status: 'completed',
        created_by: 4,
        file_url: '/api/v1/teacher/exports/exp_10002/download',
        created_at: '2026-02-26T09:00:00+00:00',
        completed_at: '2026-02-26T09:08:00+00:00',
    },
]

// ------------------------------------------------------------
// 表8：归档表
// 由教师/管理员基于导出任务创建归档记录
// export_task_id 对应 表7：导出任务表
// class_ids 对应班级
// ------------------------------------------------------------
export const archives = [
    {
        archive_id: 'arc_1',
        archive_name: '2025-2026-1_2023级_综测统计表',
        term: '2025-2026-1',
        grade: 2023,
        class_ids: [301, 302],
        is_announced: true,
        export_task_id: 'exp_10001',
        created_at: '2026-02-25T10:00:00+00:00',
    },
    {
        archive_id: 'arc_2',
        archive_name: '2025-2026-2_2023级_综测统计表',
        term: '2025-2026-2',
        grade: 2023,
        class_ids: [301, 302],
        is_announced: false,
        export_task_id: 'exp_10002',
        created_at: '2026-02-26T10:00:00+00:00',
    },
]

// ------------------------------------------------------------
// 表9：公示表
// archive_id 对应 表8：归档表
// ------------------------------------------------------------
export const announcements = [
    {
        id: 1,
        title: '2025-2026学年第一学期综测公示',
        archive_id: 'arc_9001',
        start_at: '2026-02-15T00:00:00+00:00',
        end_at: '2026-02-20T23:59:59+00:00',
        status: 'active',
        created_at: '2026-02-14T10:00:00+00:00',
    },
]

// ------------------------------------------------------------
// 表10：邮件日志表
// application_id 对应 表3：申报表
// to 对应 users 表中学生邮箱
// ------------------------------------------------------------
export const emailLogs = [
    {
        id: 1,
        application_id: 4,           // 学生1的"校级合唱比赛二等奖"被驳回
        to: 'xuesheng1@example.com',  // 学生1
        subject: '申报驳回通知',
        status: 'success',
        sent_at: '2026-02-23T16:05:00+00:00',
    },
    {
        id: 2,
        application_id: 3,           // 学生1的"大学生创新训练项目"
        to: 'xuesheng1@example.com',
        subject: 'AI 异常通知',
        status: 'success',
        sent_at: '2026-02-17T09:10:00+00:00',
    },
    {
        id: 3,
        application_id: 9,           // 学生3的"羽毛球赛校级冠军"
        to: 'xuesheng3@example.com',  // 学生3
        subject: '申报驳回通知',
        status: 'failed',
        sent_at: '2026-02-20T11:00:00+00:00',
    },
]

// ------------------------------------------------------------
// 序列号（各 mock 文件通过引用修改，保持运行时状态）
// ------------------------------------------------------------
export const seq = {
    application: 11,   // 下一个 application id = ++seq.application
    reviewRecord: 6,   // 下一个 review_record id = ++seq.reviewRecord
    token: 4,          // 下一个 token id = ++seq.token
    appeal: 3,         // 下一个 appeal id = ++seq.appeal
    file: 6,           // 下一个 file id = ++seq.file
    emailLog: 3,       // 下一个 email_log id = ++seq.emailLog
    archive: 2,     // 下一个 archive 序号 = ++seq.archive -> arc_{seq.archive}
    announcement: 1,   // 下一个 announcement id = ++seq.announcement
    exportTask: 2, // 下一个 export_task 序号 = ++seq.exportTask -> exp_{seq.exportTask}
}

// ------------------------------------------------------------
// 工具：按 id 查用户（供各 mock 文件使用）
// ------------------------------------------------------------
export function getUserById(id) {
    return users.find((u) => u.id === id) || null
}
