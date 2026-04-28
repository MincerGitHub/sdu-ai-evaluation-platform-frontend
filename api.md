# AI 介入的综测评分系统 API 文档（前端联调版）

## 1. 文档说明

本文档根据当前前端工程的 `src/services`、`src/router`、`src/views` 与 `mock/` 目录整理，用于前后端联调时对齐接口范围、请求字段、权限和主要返回结构。

后端接口原始文档位于：`../backend/docs/综测平台接口文档.md`。本文档在保持前端调用范围的同时，对齐后端文档中的 AI 审核、OCR 文件分析、审核流转和计分口径。

当前前端默认：

- API 前缀：`/api/v1`
- Vite 代理：`/api` -> `VITE_API_PROXY_TARGET`，默认 `http://127.0.0.1:8000`
- 认证方式：`Authorization: Bearer <access_token>`
- JSON 响应：`code` / `message` / `data` / `request_id`
- 文件类响应：文件流或 `blob`，不强制使用统一 JSON 包装

---

## 2. 全局协议约定

### 2.1 统一响应

成功：

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "request_id": "uuid"
}
```

失败：

```json
{
  "code": 1003,
  "message": "无权限",
  "request_id": "uuid"
}
```

失败（带详情）：

```json
{
  "code": 1001,
  "message": "参数校验失败",
  "request_id": "uuid",
  "error": {
    "reason": "attachments[].file_id 或 attachments[].file_url 至少提供一个"
  }
}
```

### 2.2 分页

通用分页参数：

- `page`：页码，默认 `1`
- `size`：每页条数，默认 `10`，建议最大 `100`

通用分页返回：

```json
{
  "page": 1,
  "size": 10,
  "total": 42,
  "list": []
}
```

### 2.3 业务码

- `0`：成功
- `1000`：通用业务错误（账号密码错误、状态不允许等）
- `1001`：参数校验失败
- `1002`：资源不存在
- `1003`：无权限
- `1004`：未登录或 token 缺失
- `1005`：access token 无效或过期
- `1006`：refresh token 无效或过期
- `1007`：业务冲突（账号已存在、并发版本冲突、令牌已激活等）
- `1008`：文件不合法
- `1009`：AI 审核服务异常
- `1010`：邮件发送失败

### 2.4 状态约定

当前前后端主要涉及的申报状态：

- `pending_ai`：待 AI 审核
- `ai_abnormal`：AI 异常
- `pending_review`：待人工审核
- `pending_teacher`：待教师终审（后端文档口径）
- `approved`：已通过
- `rejected`：已驳回
- `archived`：已归档
- `withdrawn`：已撤回

后端完整流程：

- 学生创建/修改申报后进入 `pending_ai`，并投递 AI 审核任务；
- AI 审核通过：`pending_ai -> pending_review`；
- AI 审核异常：`pending_ai -> ai_abnormal`；
- AI 审核失败：如后端开启 `fallback_to_manual`，可兜底进入 `pending_review`；
- 审核员处理：`pending_review/ai_abnormal -> pending_teacher 或 rejected`；
- 教师/管理员终审或复核：`pending_teacher/pending_review/ai_abnormal/approved/rejected -> approved 或 rejected`；
- 教师或管理员审核通过时正式入账并重算 `student_score_summary`，归档不重复计分。

---

## 3. 接口实现范围

### 3.1 健康检查

| 接口 | 前端状态 | 说明 |
|---|---|---|
| `GET /api/v1/health` | 已接入 | 管理员首页读取 API 健康状态 |
| `GET /health` | 已封装 | 根路径健康检查备用 |

### 3.2 认证与用户

| 接口 | 前端状态 | 说明 |
|---|---|---|
| `POST /api/v1/auth/register` | 已接入 | 学生注册，可带审核人令牌 |
| `POST /api/v1/auth/login` | 已接入 | 登录并返回双 token |
| `POST /api/v1/auth/refresh` | 已接入 | access token 过期自动刷新 |
| `POST /api/v1/auth/logout` | 已接入 | 退出登录 |
| `POST /api/v1/auth/change-password` | 后端已实现 | 修改当前用户密码，前端暂未提供入口 |
| `GET /api/v1/users/me` | 已接入 | 获取当前用户 |
| `PUT /api/v1/users/me` | 已接入 | 更新姓名、邮箱、手机号 |

### 3.3 学生申报

| 接口 | 前端状态 | 说明 |
|---|---|---|
| `GET /api/v1/applications/categories` | 已封装 | 获取分类树，当前页面主要使用本地奖项字典 |
| `POST /api/v1/applications` | 已接入 | 创建申报 |
| `GET /api/v1/applications/my` | 后端已实现 | 当前学生个人申报分页列表 |
| `GET /api/v1/applications/my/category-summary` | 已接入 | 学生首页分类汇总与分数面板 |
| `GET /api/v1/applications/my/by-category` | 已接入 | 学生按分类查看本人申报 |
| `GET /api/v1/applications/{application_id}` | 已接入 | 申报详情 |
| `PUT /api/v1/applications/{application_id}` | 已接入 | 更新申报 |
| `POST /api/v1/applications/{application_id}/withdraw` | 已接入 | 撤回申报 |
| `DELETE /api/v1/applications/{application_id}` | 已接入 | 删除/软删申报 |

### 3.4 文件

| 接口 | 前端状态 | 说明 |
|---|---|---|
| `POST /api/v1/files/upload` | 已接入 | 上传附件 |
| `GET /api/v1/files/{file_id}` | 已接入 | 获取文件信息或文件流 |
| `GET /api/v1/files/{file_id}/url` | 已接入 | 获取授权访问 URL |
| `DELETE /api/v1/files/{file_id}` | 已封装 | 删除文件 |

### 3.5 审核人令牌

| 接口 | 前端状态 | 说明 |
|---|---|---|
| `POST /api/v1/tokens/reviewer` | 已接入 | 教师/管理员创建审核人令牌 |
| `POST /api/v1/tokens/reviewer/activate` | 已接入 | 学生绑定审核人令牌 |
| `GET /api/v1/tokens` | 已接入 | 查询审核人令牌 |
| `POST /api/v1/tokens/{token_id}/revoke` | 已接入 | 撤销令牌 |
| `POST /api/v1/tokens/{token_id}/unbind` | 已接入 | 学生解绑已绑定令牌 |

### 3.6 人工审核

| 接口 | 前端状态 | 说明 |
|---|---|---|
| `GET /api/v1/reviews/pending` | 已接入 | 获取待审核/复核记录 |
| `GET /api/v1/reviews/pending/category-summary` | 已接入 | 分类汇总 |
| `GET /api/v1/reviews/pending/by-category` | 已接入 | 分类明细 |
| `GET /api/v1/reviews/pending-count` | 已接入 | 待审核数量 |
| `GET /api/v1/reviews/history` | 已接入 | 审核历史 |
| `GET /api/v1/reviews/{application_id}` | 已接入 | 审核详情 |
| `POST /api/v1/reviews/{application_id}/decision` | 已接入 | 单条审核决策 |
| `POST /api/v1/reviews/batch-decision` | 已接入 | 批量审核决策 |

### 3.7 教师统计、复核与导出

| 接口 | 前端状态 | 说明 |
|---|---|---|
| `GET /api/v1/teacher/applications` | 已接入 | 教师查看全部申报 |
| `POST /api/v1/teacher/applications/{application_id}/recheck` | 已接入 | 教师复核/改判 |
| `POST /api/v1/teacher/applications/archive` | 已接入 | 批量归档申报 |
| `GET /api/v1/teacher/statistics` | 已接入 | 教师首页汇总 |
| `GET /api/v1/teacher/statistics/classes` | 已接入 | 按班级统计 |
| `GET /api/v1/teacher/statistics/students` | 已接入 | 按学生统计 |
| `POST /api/v1/teacher/insights/analyze` | 已接入 | 综测画像与风险预警 |
| `POST /api/v1/teacher/exports` | 已接入 | 创建导出任务 |
| `GET /api/v1/teacher/exports/{task_id}` | 已接入 | 查询导出任务 |
| `GET /api/v1/teacher/exports/{task_id}/download` | 已接入 | 下载导出文件 |

### 3.8 归档与公示

| 接口 | 前端状态 | 说明 |
|---|---|---|
| `POST /api/v1/archives/exports` | 已接入 | 创建导出任务，可选择写入归档 |
| `GET /api/v1/archives/exports` | 已接入 | 查询归档列表 |
| `GET /api/v1/archives/exports/{archive_id}` | 后端已实现 | 归档详情 |
| `GET /api/v1/archives/exports/{archive_id}/download` | 已接入 | 下载归档文件 |
| `GET /api/v1/announcements` | 已接入 | 查询公示 |
| `POST /api/v1/announcements` | 已接入 | 发布公示 |
| `PUT /api/v1/announcements/{announcement_id}` | 已接入 | 更新公示 |
| `POST /api/v1/announcements/{announcement_id}/close` | 已接入 | 关闭公示 |
| `POST /api/v1/announcements/{announcement_id}/reopen` | 已接入 | 重开公示 |
| `DELETE /api/v1/announcements/{announcement_id}` | 已接入 | 删除公示 |
| `GET /api/v1/announcements/{announcement_id}/download` | 已接入 | 下载公示文件 |
| `GET /api/v1/announcements/{announcement_id}/my-report` | 已接入 | 学生个人公示报告 |
| `POST /api/v1/announcements/{announcement_id}/my-report/story-copy` | 已接入 | 生成个人报告文案 |
| `GET /api/v1/announcements/{announcement_id}/applications` | 已接入 | 公示范围内公开申报 |
| `GET /api/v1/announcements/{announcement_id}/applications/{application_id}` | 已接入 | 公示申报详情 |
| `GET /api/v1/announcements/{announcement_id}/applications/{application_id}/files/{file_id}` | 后端已实现 | 公示申报附件下载 |

### 3.9 申诉与通知

| 接口 | 前端状态 | 说明 |
|---|---|---|
| `POST /api/v1/appeals` | 已接入 | 学生提交申诉 |
| `GET /api/v1/appeals` | 已接入 | 查询申诉 |
| `GET /api/v1/appeals/application-options` | 已接入 | 搜索可关联申报 |
| `POST /api/v1/appeals/{appeal_id}/process` | 已接入 | 教师处理申诉 |
| `DELETE /api/v1/appeals/{appeal_id}` | 已接入 | 删除未处理申诉 |
| `POST /api/v1/notifications/reject-email` | 已接入 | 发送驳回/申诉结果通知 |
| `GET /api/v1/notifications/email-logs` | 已接入 | 查询邮件日志 |

### 3.10 AI 审核

| 接口 | 前端状态 | 说明 |
|---|---|---|
| `GET /api/v1/ai-audits/{application_id}/report` | 已接入 | 获取 AI 审核报告 |
| `GET /api/v1/ai-audits/logs` | 已接入 | AI 审核日志 |
| `POST /api/v1/ai-audits/image-authenticity` | 已封装 | 独立图片真实性/P 图/AI 生成风险检测 |

### 3.11 系统管理

| 接口 | 前端状态 | 说明 |
|---|---|---|
| `GET /api/v1/system/configs` | 已接入 | 系统配置 |
| `PUT /api/v1/system/configs` | 已接入 | 新增/更新配置 |
| `GET /api/v1/system/logs` | 已接入 | 系统日志 |
| `GET /api/v1/system/users` | 已接入 | 用户列表 |
| `POST /api/v1/system/users` | 已接入 | 创建用户 |
| `PUT /api/v1/system/users/{user_id}` | 已接入 | 更新用户 |
| `DELETE /api/v1/system/users/{user_id}` | 已接入 | 删除用户 |
| `GET /api/v1/system/classes` | 已接入 | 班级列表 |
| `GET /api/v1/system/classes/public` | 已接入 | 注册页公开班级列表 |
| `POST /api/v1/system/classes` | 已接入 | 创建班级 |
| `PUT /api/v1/system/classes/{class_id}` | 已接入 | 更新班级 |
| `DELETE /api/v1/system/classes/{class_id}` | 已接入 | 删除班级 |
| `GET /api/v1/system/award-dicts` | 已接入 | 奖项字典 |
| `POST /api/v1/system/award-dicts` | 已接入 | 创建奖项 |
| `PUT /api/v1/system/award-dicts/{award_id}` | 已接入 | 更新奖项 |
| `DELETE /api/v1/system/award-dicts/{award_id}` | 已接入 | 删除奖项 |

---

## 4. 接口明细

### 4.1 认证与用户

#### 注册

- 接口：`POST /api/v1/auth/register`
- 权限：无需登录

请求：

```json
{
  "account": "20260001",
  "password": "12345678",
  "name": "张三",
  "role": "student",
  "class_id": 301,
  "is_reviewer": false,
  "reviewer_token": null,
  "email": "zhangsan@example.com",
  "phone": "13800000000"
}
```

返回：

```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "account": "20260001",
      "name": "张三",
      "role": "student",
      "class_id": 301,
      "is_reviewer": false
    }
  },
  "request_id": "uuid"
}
```

#### 登录

- 接口：`POST /api/v1/auth/login`
- 权限：无需登录

请求：

```json
{
  "account": "20260001",
  "password": "12345678"
}
```

返回：

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "account": "20260001",
      "name": "张三",
      "role": "student",
      "class_id": 301,
      "is_reviewer": false,
      "reviewer_token_id": null,
      "email": "zhangsan@example.com",
      "phone": "13800000000"
    },
    "access_token": "<jwt>",
    "refresh_token": "<jwt>",
    "expires_in": 7200
  },
  "request_id": "uuid"
}
```

#### 刷新 Access Token

- 接口：`POST /api/v1/auth/refresh`
- 权限：无需 access token，需要合法 `refresh_token`

请求：

```json
{
  "refresh_token": "<jwt>"
}
```

返回：

```json
{
  "code": 0,
  "message": "刷新成功",
  "data": {
    "access_token": "<jwt>",
    "expires_in": 7200
  },
  "request_id": "uuid"
}
```

#### 退出登录

- 接口：`POST /api/v1/auth/logout`
- 权限：已登录

请求：

```json
{
  "refresh_token": "<jwt>"
}
```

返回：

```json
{
  "code": 0,
  "message": "退出成功",
  "data": {},
  "request_id": "uuid"
}
```

#### 修改密码

- 接口：`POST /api/v1/auth/change-password`
- 权限：已登录
- 前端状态：后端已实现，当前前端暂未提供入口

请求：

```json
{
  "old_password": "Passw0rd!",
  "new_password": "NewPassw0rd!"
}
```

返回：

```json
{
  "code": 0,
  "message": "修改成功",
  "data": {},
  "request_id": "uuid"
}
```

#### 当前用户

- 接口：`GET /api/v1/users/me`
- 权限：已登录

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": 1,
    "account": "20260001",
    "name": "张三",
    "role": "student",
    "class_id": 301,
    "is_reviewer": true,
    "reviewer_token_id": 1,
    "email": "zhangsan@example.com",
    "phone": "13800000000"
  },
  "request_id": "uuid"
}
```

#### 更新当前用户

- 接口：`PUT /api/v1/users/me`
- 权限：已登录

请求：

```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800000000"
}
```

---

### 4.2 学生申报

#### 创建申报

- 接口：`POST /api/v1/applications`
- 权限：学生

请求：

```json
{
  "award_uid": 111,
  "title": "全国大学生数学建模竞赛",
  "description": "省级一等奖，团队成员之一",
  "occurred_at": "2026-01-15",
  "attachments": [
    {
      "file_id": "f_0000000000000001"
    }
  ],
  "category": "innovation",
  "sub_type": "achievement",
  "score": 5
}
```

返回：

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 10,
    "application_id": 10,
    "status": "pending_ai",
    "score": 5,
    "item_score": 5,
    "total_score": 5,
    "score_rule_version": "v2_four_categories_two_subtypes",
    "award_uid": 111,
    "created_at": "2026-02-21T10:00:00+00:00"
  },
  "request_id": "uuid"
}
```

创建后端行为：

- 写入申报记录，初始状态为 `pending_ai`；
- 绑定附件并创建/更新 AI 审核报告占位记录；
- 投递异步 AI 审核任务；
- AI 审核完成后更新申报状态与报告内容。

#### 我的申报列表

- 接口：`GET /api/v1/applications/my`
- 权限：学生
- Query：`status`、`award_type`、`category`、`keyword`、`page`、`size`

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "page": 1,
    "size": 10,
    "total": 1,
    "list": [
      {
        "application_id": 10,
        "id": 10,
        "category": "innovation",
        "sub_type": "achievement",
        "award_uid": 111,
        "title": "全国大学生数学建模竞赛",
        "status": "pending_review",
        "score": 5,
        "item_score": 5,
        "total_score": 5,
        "comment": null,
        "version": 1,
        "created_at": "2026-02-21T10:00:00+00:00",
        "updated_at": "2026-02-21T10:03:00+00:00"
      }
    ]
  },
  "request_id": "uuid"
}
```

#### 分类汇总

- 接口：`GET /api/v1/applications/my/category-summary`
- 权限：学生
- Query：`term`

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "term": "2025-2026-1",
    "categories": [
      {
        "category": "innovation",
        "sub_type": "achievement",
        "count": 3,
        "approved": 1,
        "pending": 2,
        "rejected": 0,
        "category_score": 5
      }
    ],
    "total_score": 5,
    "actual_score": 5,
    "score_summary": {
      "raw_total_score": 6,
      "actual_score": 5,
      "overflow_score": 1,
      "category_scores": {}
    }
  },
  "request_id": "uuid"
}
```

#### 分类明细

- 接口：`GET /api/v1/applications/my/by-category`
- 权限：学生
- Query：`category`（必填）、`sub_type`、`status`、`term`、`page`、`size`

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "category": "innovation",
    "term": "2025-2026-1",
    "list": [
      {
        "application_id": 10,
        "award_uid": 111,
        "title": "全国大学生数学建模竞赛",
        "status": "pending_review",
        "score": 5
      }
    ]
  },
  "request_id": "uuid"
}
```

#### 申报详情

- 接口：`GET /api/v1/applications/{application_id}`
- 权限：已登录；学生仅本人，审核人/教师/管理员按数据权限

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": 10,
    "category": "innovation",
    "sub_type": "achievement",
    "award_uid": 111,
    "title": "全国大学生数学建模竞赛",
    "description": "省级一等奖，团队成员之一",
    "occurred_at": "2026-01-15",
    "attachments": [
      {
        "file_id": "f_0000000000000001",
        "name": "award.pdf"
      }
    ],
    "status": "pending_review",
    "score": 5,
    "comment": null,
    "version": 1,
    "created_at": "2026-02-21T10:00:00+00:00",
    "updated_at": "2026-02-21T10:00:00+00:00"
  },
  "request_id": "uuid"
}
```

#### 更新申报

- 接口：`PUT /api/v1/applications/{application_id}`
- 权限：学生本人
- 状态限制：建议仅允许 `pending_ai` / `ai_abnormal` / `pending_review`

请求字段同创建申报，可额外携带 `version`。更新成功后状态重新进入 `pending_ai`，后端会再次投递 AI 审核任务。

#### 撤回申报

- 接口：`POST /api/v1/applications/{application_id}/withdraw`
- 权限：学生本人

返回：

```json
{
  "code": 0,
  "message": "撤回成功",
  "data": {
    "id": 10,
    "status": "withdrawn"
  },
  "request_id": "uuid"
}
```

#### 删除申报

- 接口：`DELETE /api/v1/applications/{application_id}`
- 权限：学生本人或管理员

返回：

```json
{
  "code": 0,
  "message": "删除成功",
  "data": {},
  "request_id": "uuid"
}
```

---

### 4.3 文件

#### 上传文件

- 接口：`POST /api/v1/files/upload`
- 权限：已登录
- Content-Type：`multipart/form-data`
- 表单字段：`file`
- 支持类型：`pdf`、`docx`、`jpg`、`jpeg`、`png`、`webp`

行为说明：

- 文件保存成功后会写入 `queued` 文件分析记录；
- 后端通过 Celery 异步执行 OCR 文件分析；
- 上传接口不等待 OCR 完成，分析状态可通过 `GET /files/{file_id}` JSON 模式查看。

返回：

```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "file_id": "f_0000000000000001",
    "filename": "award.pdf",
    "content_type": "application/pdf",
    "size": 245761,
    "url": "/api/v1/files/f_0000000000000001",
    "created_at": "2026-02-21T09:58:00+00:00",
    "analysis_status": "queued",
    "analysis": {
      "status": "queued",
      "provider": "paddleocr"
    }
  },
  "request_id": "uuid"
}
```

#### 获取文件信息/文件流

- 接口：`GET /api/v1/files/{file_id}`
- 权限：已登录或按业务授权
- Query：
  - `raw=false`：返回文件元信息 JSON；
  - `raw=true`：返回文件流。
- JSON 模式会附带最近一次文件分析结果，如 `document_title`、`recognized_levels`、姓名命中、文件名匹配、印章/落款检测等。

#### 获取授权访问 URL

- 接口：`GET /api/v1/files/{file_id}/url`
- 权限：已登录或按业务授权

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "url": "/api/v1/files/f_0000000000000001"
  },
  "request_id": "uuid"
}
```

---

### 4.4 审核人令牌

#### 创建令牌

- 接口：`POST /api/v1/tokens/reviewer`
- 权限：教师或管理员

请求：

```json
{
  "class_ids": [301, 302],
  "expired_at": "2026-03-31T23:59:59+08:00"
}
```

返回：

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "token_id": 1,
    "token": "rvw_a1b2c3d4e5f6g7h8",
    "type": "reviewer",
    "class_ids": [301, 302],
    "expired_at": "2026-03-31T23:59:59+08:00"
  },
  "request_id": "uuid"
}
```

#### 激活令牌

- 接口：`POST /api/v1/tokens/reviewer/activate`
- 权限：学生

请求：

```json
{
  "token": "rvw_a1b2c3d4e5f6g7h8"
}
```

返回：

```json
{
  "code": 0,
  "message": "激活成功",
  "data": {
    "token_id": 1,
    "status": "active",
    "activated_user_id": 1001,
    "activated_at": "2026-02-24T03:10:23+08:00",
    "is_reviewer": true,
    "reviewer_token_id": 1
  },
  "request_id": "uuid"
}
```

#### 查询令牌

- 接口：`GET /api/v1/tokens`
- 权限：教师、管理员；学生个人页当前也会读取 reviewer 类型令牌用于展示
- Query：`type=reviewer`、`status`、`page`、`size`

#### 撤销/解绑令牌

- 撤销：`POST /api/v1/tokens/{token_id}/revoke`
- 解绑：`POST /api/v1/tokens/{token_id}/unbind`

---

### 4.5 人工审核

#### 待审核列表

- 接口：`GET /api/v1/reviews/pending`
- 权限：审核人、教师、管理员
- Query：`class_id`、`category`、`sub_type`、`status`、`keyword`、`page`、`size`

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "page": 1,
    "size": 10,
    "total": 1,
    "list": [
      {
        "application_id": 12,
        "student_id": 1002,
        "student_name": "李四",
        "class_id": 301,
        "title": "数学建模竞赛",
        "category": "innovation",
        "sub_type": "achievement",
        "status": "pending_review",
        "score": 4,
        "created_at": "2026-02-26T10:00:00+08:00"
      }
    ]
  },
  "request_id": "uuid"
}
```

#### 分类汇总

- 接口：`GET /api/v1/reviews/pending/category-summary`
- 权限：审核人、教师、管理员
- Query：`class_id`、`term`

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "class_id": 301,
    "term": "2025-2026-1",
    "categories": [
      {
        "category": "innovation",
        "category_name": "创新素养",
        "pending_count": 8,
        "approved_count": 23,
        "rejected_count": 5
      }
    ]
  },
  "request_id": "uuid"
}
```

#### 分类明细

- 接口：`GET /api/v1/reviews/pending/by-category`
- 权限：审核人、教师、管理员
- Query：`category`（必填）、`class_id`、`sub_type`、`status`、`term`、`page`、`size`

#### 审核详情

- 接口：`GET /api/v1/reviews/{application_id}`
- 权限：审核人、教师、管理员

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": 12,
    "student": {
      "id": 1002,
      "name": "李四",
      "account": "20230002",
      "class_id": 301,
      "email": "lisi@example.com"
    },
    "category": "innovation",
    "sub_type": "achievement",
    "award_uid": 111,
    "title": "数学建模竞赛",
    "description": "省赛二等奖",
    "occurred_at": "2026-01-10",
    "attachments": [
      {
        "file_id": "f_0000000000000001"
      }
    ],
    "status": "pending_review",
    "score": 4,
    "comment": null,
    "created_at": "2026-02-26T10:00:00+08:00",
    "updated_at": "2026-02-26T10:00:00+08:00"
  },
  "request_id": "uuid"
}
```

#### 提交审核决策

- 接口：`POST /api/v1/reviews/{application_id}/decision`
- 权限：审核人、教师、管理员

请求：

```json
{
  "decision": "approved",
  "comment": "材料齐全"
}
```

返回（审核员通过示例）：

```json
{
  "code": 0,
  "message": "审核完成",
  "data": {
    "application_id": 12,
    "status": "pending_teacher",
    "review_id": 9,
    "reviewed_at": "2026-02-26T10:30:00+08:00"
  },
  "request_id": "uuid"
}
```

说明：

- 审核员通过后按后端文档流转为 `pending_teacher`，等待教师终审；
- 审核员驳回后流转为 `rejected`；
- 教师/管理员通过后流转为 `approved`，并立即重算学生官方综测分；
- 教师/管理员驳回后流转为 `rejected`。

#### 批量提交审核决策

- 接口：`POST /api/v1/reviews/batch-decision`
- 权限：审核人、教师、管理员

请求：

```json
{
  "application_ids": [12, 13, 14],
  "decision": "rejected",
  "comment": "证明材料不完整"
}
```

说明：

- `application_ids` 必填，建议最多 200 条；
- `decision` 取值：`approved` / `rejected`。

#### 审核历史

- 接口：`GET /api/v1/reviews/history`
- 权限：审核人、教师、管理员
- Query：`class_id`、`result`、`from`、`to`、`page`、`size`

---

### 4.6 教师统计、复核与导出

#### 全部申报

- 接口：`GET /api/v1/teacher/applications`
- 权限：教师、管理员
- Query：`grade`、`class_id`、`status`、`category`、`sub_type`、`keyword`、`page`、`size`

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "page": 1,
    "size": 10,
    "total": 1,
    "list": [
      {
        "application_id": 12,
        "grade": 2023,
        "class_id": 301,
        "student_id": 1002,
        "student_account": "20230002",
        "student_name": "李四",
        "title": "数学建模竞赛",
        "category": "innovation",
        "sub_type": "achievement",
        "project": "创新素养 · 成果性评价",
        "attachments": [],
        "ai_result": "未见异常",
        "status": "approved",
        "score": 4,
        "comment": "材料齐全",
        "created_at": "2026-02-26T10:00:00+08:00",
        "updated_at": "2026-02-26T10:30:00+08:00"
      }
    ]
  },
  "request_id": "uuid"
}
```

#### 教师复核

- 接口：`POST /api/v1/teacher/applications/{application_id}/recheck`
- 权限：教师、管理员

请求：

```json
{
  "decision": "approved",
  "comment": "复核通过",
  "score": 4
}
```

#### 批量归档

- 接口：`POST /api/v1/teacher/applications/archive`
- 权限：教师、管理员

请求：

```json
{
  "application_ids": [12, 13, 14]
}
```

返回：

```json
{
  "code": 0,
  "message": "归档完成",
  "data": {
    "total": 3,
    "success_count": 3,
    "skipped_count": 0,
    "archived_application_ids": [12, 13, 14],
    "skipped": []
  },
  "request_id": "uuid"
}
```

#### 教师首页汇总

- 接口：`GET /api/v1/teacher/statistics`
- 权限：教师、管理员
- Query：`term`、`grade`、`class_id`

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "total_count": 120,
    "total_score": 456.5,
    "status_summary": {
      "pending_ai": 2,
      "pending_review": 18,
      "pending_teacher": 12,
      "approved": 92,
      "rejected": 10
    }
  },
  "request_id": "uuid"
}
```

#### 班级统计

- 接口：`GET /api/v1/teacher/statistics/classes`
- 权限：教师、管理员
- Query：`grade`、`class_id`

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "grade": 2023,
        "class_id": 301,
        "total_count": 48,
        "rejected_count": 3,
        "pending_count": 5,
        "average_score": 7.32,
        "total_score": 351.5
      }
    ]
  },
  "request_id": "uuid"
}
```

#### 学生统计

- 接口：`GET /api/v1/teacher/statistics/students`
- 权限：教师、管理员
- Query：`grade`、`class_id`

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "grade": 2023,
        "class_id": 301,
        "student_id": 1002,
        "student_account": "20230002",
        "student_name": "李四",
        "total_count": 6,
        "rejected_count": 1,
        "pending_count": 0,
        "actual_score": 18.5,
        "raw_total_score": 20.5,
        "overflow_score": 2,
        "score_summary": {
          "category_scores": {
            "physical_mental_score": 3,
            "art_score": 2,
            "labor_score": 5,
            "innovation_score": 8.5
          }
        }
      }
    ]
  },
  "request_id": "uuid"
}
```

#### 综测画像

- 接口：`POST /api/v1/teacher/insights/analyze`
- 权限：教师、管理员
- 超时：前端设置 `180000ms`

请求：

```json
{
  "grade": 2023,
  "class_ids": [301, 302],
  "max_risk_students": 12,
  "force_refresh": false
}
```

返回建议包含：

```json
{
  "code": 0,
  "message": "生成成功",
  "data": {
    "term": "2025-2026-1",
    "source": "llm",
    "summary": "整体参与度较高，创新素养分布差异较明显。",
    "overall_risk_level": "medium",
    "scope": {
      "grade": 2023,
      "class_ids": [301, 302],
      "label": "2023级 301/302班"
    },
    "metrics": {
      "student_count": 78,
      "average_score": 18.2,
      "meaningful_count": 210,
      "meaningful_per_student": 2.69,
      "micro_count": 32,
      "micro_ratio": 0.13
    },
    "module_findings": [],
    "class_findings": [],
    "risk_students": [],
    "action_plan": [],
    "cache": {
      "hit": false
    }
  },
  "request_id": "uuid"
}
```

#### 创建导出任务

- 接口：`POST /api/v1/teacher/exports`
- 权限：教师、管理员
- Header：前端会携带 `Idempotency-Key`

请求：

```json
{
  "scope": "teacher_statistics",
  "format": "xlsx",
  "filters": {
    "grade": 2023,
    "class_id": 301
  },
  "store_to_archive": false
}
```

返回：

```json
{
  "code": 0,
  "message": "导出任务已创建",
  "data": {
    "task_id": "exp_10001"
  },
  "request_id": "uuid"
}
```

#### 查询导出任务

- 接口：`GET /api/v1/teacher/exports/{task_id}`
- 权限：教师、管理员

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "task_id": "exp_10001",
    "scope": "teacher_statistics",
    "format": "xlsx",
    "filters": {
      "grade": 2023
    },
    "status": "completed",
    "file_url": "/api/v1/teacher/exports/exp_10001/download",
    "file_name": "2023级综测统计.xlsx",
    "created_at": "2026-02-24T10:00:00+08:00",
    "completed_at": "2026-02-24T10:00:05+08:00",
    "error_message": null
  },
  "request_id": "uuid"
}
```

#### 下载导出文件

- 接口：`GET /api/v1/teacher/exports/{task_id}/download`
- 权限：教师、管理员
- 返回：文件流

---

### 4.7 归档与公示

#### 创建导出归档

- 接口：`POST /api/v1/archives/exports`
- 权限：教师、管理员

当前前端导出页主要使用 `POST /teacher/exports`；归档服务仍保留该接口，用于“创建导出任务 + 可选写入归档”的后端实现。

请求：

```json
{
  "scope": "teacher_statistics",
  "format": "xlsx",
  "filters": {
    "grade": 2023,
    "class_id": 301
  },
  "store_to_archive": true
}
```

#### 查询归档列表

- 接口：`GET /api/v1/archives/exports`
- 权限：教师、管理员
- Query：`term`、`grade`、`class_id`、`page`、`size`

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": [
    {
      "archive_id": "arc_9001",
      "archive_name": "2025-2026-1_2023级_综测统计表",
      "term": "2025-2026-1",
      "grade": 2023,
      "class_ids": [301, 302],
      "is_announced": true,
      "export_task_id": "exp_10001",
      "created_at": "2026-02-24T10:00:05+08:00"
    }
  ],
  "request_id": "uuid"
}
```

#### 归档详情与下载

- 详情：`GET /api/v1/archives/exports/{archive_id}`
- 下载：`GET /api/v1/archives/exports/{archive_id}/download`
- 权限：教师、管理员
- 下载返回：文件流

#### 发布公示

- 接口：`POST /api/v1/announcements`
- 权限：教师、管理员

请求：

```json
{
  "title": "2025-2026学年第一学期综测公示",
  "archive_id": "arc_9001",
  "scope": {
    "grade": 2023,
    "class_ids": [301, 302]
  },
  "scopes": [
    {
      "archive_id": "arc_9001",
      "grade": 2023,
      "class_ids": [301, 302]
    }
  ],
  "start_at": "2026-02-15T00:00:00+08:00",
  "end_at": "2026-02-20T23:59:59+08:00"
}
```

返回：

```json
{
  "code": 0,
  "message": "发布成功",
  "data": {
    "id": 100,
    "title": "2025-2026学年第一学期综测公示",
    "archive_id": "arc_9001",
    "scope": {
      "grade": 2023,
      "class_ids": [301, 302]
    },
    "status": "active",
    "start_at": "2026-02-15T00:00:00+08:00",
    "end_at": "2026-02-20T23:59:59+08:00"
  },
  "request_id": "uuid"
}
```

#### 公示列表

- 接口：`GET /api/v1/announcements`
- 权限：已登录
- Query：`grade`、`status`、`page`、`size`

前端兼容数组返回或分页返回。

#### 更新/关闭/重开/删除公示

- 更新：`PUT /api/v1/announcements/{announcement_id}`
- 关闭：`POST /api/v1/announcements/{announcement_id}/close`
- 重开：`POST /api/v1/announcements/{announcement_id}/reopen`
- 删除：`DELETE /api/v1/announcements/{announcement_id}`

#### 学生个人公示报告

- 接口：`GET /api/v1/announcements/{announcement_id}/my-report`
- 权限：学生
- 超时：前端设置 `180000ms`

返回建议包含：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "announcement": {
      "id": 100,
      "title": "2025-2026学年第一学期综测公示"
    },
    "student": {
      "id": 1,
      "name": "张三",
      "account": "20260001",
      "class_id": 301
    },
    "rank": {
      "class_rank": 5,
      "class_size": 30
    },
    "score_summary": {
      "actual_score": 18.5,
      "raw_total_score": 20.5,
      "overflow_score": 2,
      "category_scores": {}
    },
    "applications": []
  },
  "request_id": "uuid"
}
```

#### 公示范围内申报

- 列表：`GET /api/v1/announcements/{announcement_id}/applications`
- 详情：`GET /api/v1/announcements/{announcement_id}/applications/{application_id}`
- 附件：`GET /api/v1/announcements/{announcement_id}/applications/{application_id}/files/{file_id}`
- 权限：已登录且在公示可见范围内
- Query：`keyword`、`page`、`size`

---

### 4.8 申诉与通知

#### 提交申诉

- 接口：`POST /api/v1/appeals`
- 权限：学生

请求：

```json
{
  "announcement_id": 100,
  "application_id": 12,
  "is_anonymous": false,
  "content": "我认为该项加分未被统计。",
  "attachments": [
    {
      "file_id": "f_0000000000000002"
    }
  ]
}
```

返回：

```json
{
  "code": 0,
  "message": "提交成功",
  "data": {
    "id": 1,
    "announcement_id": 100,
    "application_id": 12,
    "status": "pending",
    "created_at": "2026-02-25T10:00:00+08:00"
  },
  "request_id": "uuid"
}
```

#### 查询申诉

- 接口：`GET /api/v1/appeals`
- 权限：学生、教师、管理员
- Query：`page`、`size`、`status`、`student_id`、`student_name`、`keyword`、`announcement_id`

说明：

- 学生只能查看本人申诉；
- 教师/管理员可查看全部或按条件筛选。

#### 搜索可关联申报

- 接口：`GET /api/v1/appeals/application-options`
- 权限：学生、教师、管理员
- Query：`announcement_id`、`appeal_id`、`keyword`、`limit`

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": [
    {
      "application_id": 12,
      "student_id": 1002,
      "student_name": "李四",
      "student_account": "20230002",
      "title": "数学建模竞赛",
      "score": 4,
      "occurred_at": "2026-01-10"
    }
  ],
  "request_id": "uuid"
}
```

#### 处理申诉

- 接口：`POST /api/v1/appeals/{appeal_id}/process`
- 权限：教师、管理员

请求：

```json
{
  "result": "approved",
  "result_comment": "申诉材料属实，已调整对应申报分数。",
  "score_action": "adjust_score",
  "application_id": 12,
  "score": 5
}
```

字段说明：

- `result`：`approved` / `rejected`
- `score_action`：`none` / `adjust_score` / 后端约定的其它处理动作
- `application_id`：需要调整或关联的申报 ID
- `score`：调整后的分数，仅在 `score_action=adjust_score` 时必填

#### 删除申诉

- 接口：`DELETE /api/v1/appeals/{appeal_id}`
- 权限：学生本人、教师、管理员
- 状态限制：建议仅允许删除 `pending` 状态申诉

#### 邮件通知

- 发送：`POST /api/v1/notifications/reject-email`
- 日志：`GET /api/v1/notifications/email-logs`

发送请求：

```json
{
  "application_id": 12,
  "appeal_id": 1,
  "to": "student@example.com"
}
```

邮件日志 Query：`status`、`page`、`size`

---

### 4.9 AI 审核

后端 AI 审核链路包括两层：

- 文件上传后的 OCR 文件分析：识别文本、标题、等级、姓名候选、印章、落款等；
- 申报创建/修改后的 AI 审核：结合申报字段和附件分析结果生成报告，并更新申报状态。

#### 获取 AI 报告

- 接口：`GET /api/v1/ai-audits/{application_id}/report`
- 权限：学生本人、审核人、教师、管理员

返回：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "application_id": 10,
    "provider": "paddleocr",
    "status": "completed",
    "ocr_text": "全国大学生数学建模竞赛 省级一等奖 张三 20260001",
    "identity_check": {
      "expected_name": "张三",
      "matched": true,
      "status": "matched",
      "matched_fields": ["姓名", "学号"]
    },
    "consistency_check": {
      "matched": true,
      "diff": []
    },
    "result": "pass",
    "risk_points": [],
    "score_breakdown": [
      {
        "rule_code": "R_COMPETITION_LEVEL",
        "rule_name": "竞赛级别",
        "score": 4
      }
    ],
    "score": 6,
    "total_score": 26.5,
    "error_message": null,
    "audited_at": "2026-02-21T10:03:30+08:00"
  },
  "request_id": "uuid"
}
```

#### AI 日志

- 接口：`GET /api/v1/ai-audits/logs`
- 权限：教师、管理员
- Query：`result`、`page`、`size`

#### 图片真实性检测

- 接口：`POST /api/v1/ai-audits/image-authenticity`
- 权限：已登录
- 说明：该接口是独立辅助风险提示，不直接接入申报、审核、归档或计分自动决策。

请求：

```json
{
  "file_id": "f_0000000000000001",
  "run_c2pa": true,
  "run_external": true
}
```

---

### 4.10 系统管理

#### 系统配置

- 查询：`GET /api/v1/system/configs`
- 保存：`PUT /api/v1/system/configs`
- 权限：管理员

保存请求：

```json
{
  "config_key": "upload",
  "config_value": {
    "max_size_mb": 25,
    "allowed_extensions": ["pdf", "jpg", "jpeg", "png", "webp", "docx"]
  },
  "description": "上传配置"
}
```

#### 系统日志

- 接口：`GET /api/v1/system/logs`
- 权限：管理员
- Query：`action`、`page`、`size`

#### 用户管理

- 列表：`GET /api/v1/system/users`
- 创建：`POST /api/v1/system/users`
- 更新：`PUT /api/v1/system/users/{user_id}`
- 删除：`DELETE /api/v1/system/users/{user_id}`
- 权限：管理员

创建请求：

```json
{
  "account": "20260004",
  "password": "12345678",
  "name": "王五",
  "role": "student",
  "class_id": 301,
  "is_reviewer": false,
  "reviewer_token": null,
  "email": "wangwu@example.com",
  "phone": "13800000004"
}
```

#### 班级管理

- 公开列表：`GET /api/v1/system/classes/public`
- 管理列表：`GET /api/v1/system/classes`
- 创建：`POST /api/v1/system/classes`
- 更新：`PUT /api/v1/system/classes/{class_id}`
- 删除：`DELETE /api/v1/system/classes/{class_id}`

创建请求：

```json
{
  "class_id": null,
  "grade": 2023,
  "name": "2023级1班",
  "is_active": true
}
```

返回建议：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": [
    {
      "class_id": 301,
      "value": 301,
      "grade": 2023,
      "name": "2023级1班",
      "label": "2023级 301班",
      "is_active": true
    }
  ],
  "request_id": "uuid"
}
```

#### 奖项字典

- 列表：`GET /api/v1/system/award-dicts`
- 创建：`POST /api/v1/system/award-dicts`
- 更新：`PUT /api/v1/system/award-dicts/{award_id}`
- 删除：`DELETE /api/v1/system/award-dicts/{award_id}`

创建请求：

```json
{
  "award_uid": 111,
  "award_name": "全国大学生数学建模竞赛",
  "category": "innovation",
  "sub_type": "achievement",
  "score": 5,
  "max_score": 5
}
```

更新请求：

```json
{
  "award_name": "全国大学生数学建模竞赛",
  "category": "innovation",
  "sub_type": "achievement",
  "score": 5,
  "max_score": 5,
  "is_active": true
}
```

---

## 5. 数据权限规则

- 学生：
  - 仅访问本人申报、本人申诉、本人个人信息；
  - 仅查看自己可见范围内的公示与公示报告。
- 审核人：
  - 本质为学生账号；
  - 仅访问已激活审核人令牌覆盖班级内的申报；
  - 可提交单条/批量审核决策。
- 教师：
  - 可访问全局申报、统计、导出、归档、公示、申诉与令牌管理；
  - 可复核非归档申报。
- 管理员：
  - 可访问系统配置、系统日志、用户、班级、奖项字典；
  - 可按需要复用教师侧公示和系统级管理接口。

---

## 6. 当前前端联调注意事项

- `src/services/http.js` 会解包统一 JSON，但调用方仍按 `res.data` 读取业务数据；
- `code=1005` 会自动刷新 token 并重试原请求；
- `code=1006` 会触发退出登录；
- 文件、导出、归档、公示下载接口需支持鉴权 `blob` 响应；
- `GET /files/{file_id}/url`、`POST /tokens/{token_id}/unbind`、`GET /appeals/application-options` 已被前端调用，后端需要同步实现；
- `mock/` 目录中部分接口仍是样例实现，真实后端以本文档和前端 `services` 调用为准；
- 当前 `vite.config.mjs` 未启用 mock 插件，开发环境默认走真实后端代理。
