

## 2. 全局协议约定

- Base URL：`/api/v1`
- 认证方案：`Authorization: Bearer <access_token>`
- 统一响应：`code` / `message` / `data` / `request_id`
- 分页参数：`page`（默认1）/ `size`（默认10，最大100）

主要业务码：

- `0` 成功
- `1000` 通用业务错误（如账号密码错误、状态不允许）
- `1001` 参数校验失败
- `1002` 资源不存在
- `1003` 无权限
- `1004` 未登录或 token 缺失
- `1005` access token 无效或过期
- `1006` refresh token 无效或过期
- `1007` 业务冲突（如并发版本冲突、账号已存在）

---

## 3. 实现范围（对齐接口文档）

### 3.1 认证与权限

| 接口 | 状态 | 说明 |
|---|---|---|
| `POST /api/v1/auth/register` | ✅ 已实现 | 扩展接口，便于联调与测试 |
| `POST /api/v1/auth/login` | ✅ 已实现 | 返回 access/refresh token |
| `POST /api/v1/auth/refresh` | ✅ 已实现 | 使用 refresh token 刷新 access token |
| `POST /api/v1/auth/logout` | ✅ 已实现 | 需 `Authorization` + body中的 `refresh_token` |
| `POST /api/v1/auth/change-password` | ⏳ 未实现 | 文档有定义 |
| `GET /api/v1/users/me` | ⏳ 未实现 | 文档有定义 |
| `PUT /api/v1/users/me` | ⏳ 未实现 | 文档有定义 |

### 3.2 学生申报

| 接口 | 状态 | 说明 |
|---|---|---|
| `POST /api/v1/applications` | ✅ 已实现 | 创建申报 |
| `GET /api/v1/applications/my/category-summary` | ✅ 已实现 | 分类汇总 |
| `GET /api/v1/applications/my/by-category` | ✅ 已实现 | 分类明细 |
| `GET /api/v1/applications/{application_id}` | ✅ 已实现 | 详情 |
| `PUT /api/v1/applications/{application_id}` | ✅ 已实现 | 更新申报 |
| `POST /api/v1/applications/{application_id}/withdraw` | ✅ 已实现 | 撤回 |
| `DELETE /api/v1/applications/{application_id}` | ✅ 已实现 | 软删 |

### 3.3 文件模块

| 接口 | 状态 | 说明 |
|---|---|---|
| `POST /api/v1/files/upload` | ✅ 已实现 | 上传文件，返回 `file_id` 和访问 URL |
| `GET /api/v1/files/{file_id}` | ✅ 已实现 | 下载/预览文件（`FileResponse`） |

### 3.4 评审令牌模块

| 接口 | 状态 | 说明 |
|---|---|---|
| `POST /api/v1/tokens/reviewer` | ✅ 已实现 | 教师/管理员创建评审令牌 |
| `POST /api/v1/tokens/reviewer/activate` | ✅ 已实现 | 学生激活评审身份 |
| `GET /api/v1/tokens` | ✅ 已实现 | 教师/管理员分页查看令牌 |
| `POST /api/v1/tokens/{token_id}/revoke` | ✅ 已实现 | 教师/管理员令牌失效 |

### 3.5 审核员审核模块

| 接口 | 状态 | 说明 |
|---|---|---|
| `GET /api/v1/reviews/pending` | ✅ 已实现 | 获取待审核列表 |
| `GET /api/v1/reviews/pending/category-summary` | ✅ 已实现 | 待审核分类汇总 |
| `GET /api/v1/reviews/pending/by-category` | ✅ 已实现 | 按分类查看待审核明细 |
| `GET /api/v1/reviews/{application_id}` | ✅ 已实现 | 审核详情 |
| `POST /api/v1/reviews/{application_id}/decision` | ✅ 已实现 | 提交审核决策 |
| `POST /api/v1/reviews/batch-decision` | ✅ 已实现 | 批量提交审核决策 |
| `GET /api/v1/reviews/history` | ✅ 已实现 | 我的审核历史 |
| `GET /api/v1/reviews/pending-count` | ✅ 已实现 | 待审核数量 |

---

## 4. 当前业务规则

### 4.1 认证模块

- JWT 双令牌：Access + Refresh
- Refresh Token 落库（可撤销）
- 密码哈希：`bcrypt`
- 已处理密码 72-byte 限制（按 UTF-8 字节长度校验）

### 4.2 学生申报模块

- 学生仅可操作本人申报
- 管理员可执行软删
- 创建后默认状态：`pending_review`（当前阶段跳过 AI 审核）
- 编辑与撤回仅允许状态：`pending_ai` / `pending_review`


### 4.3 状态流转

- 已落地：`pending_review -> withdrawn`
- 已支持编辑区间：`pending_ai` / `ai_abnormal` / `pending_review`
- 审核员（班委）审核：`pending_review` / `ai_abnormal` -> `pending_teacher` / `rejected`
- 教师复核：`pending_teacher` -> `approved` / `rejected`

---

## 5. 数据模型（当前）

- `user_info`：用户基础信息
- `refresh_token_record`：refresh token 记录与状态
- `comprehensive_apply`：申报信息（含 `is_deleted`、`attachments_json`）
- `reviewer_token_record`：评审令牌记录（含状态、激活信息、失效信息）
- `review_record`：审核记录（审核人、决策、驳回原因、时间等）

---


## 7. 接口明细（请求/权限/返回）

### 7.1 通用响应格式

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

失败（带 error 详情）：

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

---

### 7.2 认证与权限（Auth）

#### 1) 注册

- 接口：`POST /api/v1/auth/register`
- 权限：无需登录

请求 JSON：

```json
{
	"account": "20260001",
	"password": "12345678",
	"name": "张三",
	"role": "student",
	"class_id": 1,
	"is_reviewer": false,
	"email": "zhangsan@example.com",
	"phone": "13800000000"
}
```

返回 JSON（成功）：

```json
{
	"code": 0,
	"message": "注册成功",
	"data": {
		"user": {
			"id": 1,
			"name": "张三",
			"role": "student",
			"class_id": 1
		}
	},
	"request_id": "uuid"
}
```

#### 2) 登录

- 接口：`POST /api/v1/auth/login`
- 权限：无需登录

请求 JSON：

```json
{
	"account": "20260001",
	"password": "12345678"
}
```

返回 JSON（成功）：

```json
{
	"code": 0,
	"message": "登录成功",
	"data": {
		"user": {
			"id": 1,
			"name": "张三",
			"role": "student",
			"class_id": 1
		},
		"access_token": "<jwt>",
		"refresh_token": "<jwt>",
		"expires_in": 7200
	},
	"request_id": "uuid"
}
```

#### 3) 刷新 Access Token

- 接口：`POST /api/v1/auth/refresh`
- 权限：无需登录（仅需要合法 refresh_token）

请求 JSON：

```json
{
	"refresh_token": "<jwt>"
}
```

返回 JSON（成功）：

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

#### 4) 退出登录

- 接口：`POST /api/v1/auth/logout`
- 权限：已登录用户（`Authorization: Bearer <access_token>`）

请求 JSON：

```json
{
	"refresh_token": "<jwt>"
}
```

返回 JSON（成功）：

```json
{
	"code": 0,
	"message": "退出成功",
	"data": {},
	"request_id": "uuid"
}
```

---

### 7.3 学生申报（Applications）

#### 1) 创建申报

- 接口：`POST /api/v1/applications`
- 权限：仅学生（已登录，`role=student`）

请求 JSON：

```json
{
	"award_uid": 111,
	"title": "让用户输入申报标题",
	"description": "让用户输入细节描述，对已选的award做一些补充说明",
	"occurred_at": "2026-01-15",
	"attachments": [
		{
			"file_id": "file_abc123"
		}
	],
	"category": "physical_mental",
	"sub_type": "basic",
	"score": 5.0
}
```

返回 JSON（成功）：

```json
{
	"code": 0,
	"message": "创建成功",
	"data": {
		"id": 10,
		"status": "pending_review",
		"score": 5.0,
		"award_uid": 111,
		"created_at": "2026-02-21T10:00:00+00:00"
	},
	"request_id": "uuid"
}
```

#### 2) 分类汇总

- 接口：`GET /api/v1/applications/my/category-summary`
- 权限：仅学生（已登录，`role=student`）
- Query：`term`（可选）

返回 JSON（成功）：

```json
{
	"code": 0,
	"message": "获取成功",
	"data": {
		"term": "2025-2026-1",
		"categories": [
			{
				"category": "physical_mental",
				"sub_type": "basic",
				"count": 3,
				"approved": 1,
				"pending": 2,
				"rejected": 0,
				"category_score": 2.0
			}
		],
		"total_score": 2.0
	},
	"request_id": "uuid"
}
```

#### 3) 分类明细

- 接口：`GET /api/v1/applications/my/by-category`
- 权限：仅学生（已登录，`role=student`）
- Query：`category`（必填）、`sub_type`、`status`、`term`、`page`、`size`

返回 JSON（成功）：

```json
{
	"code": 0,
	"message": "获取成功",
	"data": {
		"category": "physical_mental",
		"term": "2025-2026-1",
		"list": [
			{
				"award_uid": 123,
				"application_id": 10,
				"title": "全国大学生数学建模竞赛",
				"status": "pending_review",
				"score": 5.0
			}
		]
	},
	"request_id": "uuid"
}
```

#### 4) 申报详情

- 接口：`GET /api/v1/applications/{application_id}`
- 权限：已登录且角色属于 `student/teacher/admin/reviewer`
- 额外限制：学生仅可查看本人申报

返回 JSON（成功）：

```json
{
	"code": 0,
	"message": "获取成功",
	"data": {
		"id": 10,
		"category": "physical_mental",
		"sub_type": "basic",
		"award_uid": 111,
		"title": "全国大学生数学建模竞赛",
		"description": "团队获奖",
		"occurred_at": "2026-01-15",
		"attachments": [
			{
				"file_id": "file_abc123"
			}
		],
		"status": "pending_review",
		"score": 5.0,
		"comment": "审核人/教师 的评论（可为空）",
		"created_at": "2026-02-21T10:00:00+00:00"
	},
	"request_id": "uuid"
}
```

#### 5) 更新申报

- 接口：`PUT /api/v1/applications/{application_id}`
- 权限：仅学生（已登录，`role=student`）且仅本人数据
- 状态限制：仅 `pending_ai` / `pending_review`

请求 JSON：

```json
{
	"award_uid": 123,
	"title": "全国大学生数学建模竞赛（修订）",
	"description": "补充说明",
	"occurred_at": "2026-01-15",
	"attachments": [
		{
			"file_id": "file_abc123"
		}
	],
	"category": "physical_mental",
	"sub_type": "basic",
	"score": 5.0
}
```

返回 JSON（成功）：

```json
{
	"code": 0,
	"message": "更新成功",
	"data": {
		"id": 10,
		"status": "pending_review",
		"updated_at": "2026-02-21T10:05:00+00:00"
	},
	"request_id": "uuid"
}
```

#### 6) 撤回申报

- 接口：`POST /api/v1/applications/{application_id}/withdraw`
- 权限：仅学生（已登录，`role=student`）且仅本人数据
- 状态限制：仅 `pending_ai` / `pending_review`

返回 JSON（成功）：

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

#### 7) 删除申报（软删）

- 接口：`DELETE /api/v1/applications/{application_id}`
- 权限：
	- 学生：仅可删除本人申报
	- 管理员：可删除任意申报

返回 JSON（成功）：

```json
{
	"code": 0,
	"message": "删除成功",
	"data": {},
	"request_id": "uuid"
}
```

---

### 7.4 文件模块（Files）

#### 1) 上传文件

- 接口：`POST /api/v1/files/upload`
- 权限：已登录用户（`Authorization: Bearer <access_token>`）
- Content-Type：`multipart/form-data`
- 表单字段：`file`

返回 JSON（成功）：

```json
{
	"code": 0,
	"message": "上传成功",
	"data": {
		"file_id": "f_3b6e4b08fd5c4e6f9d",
		"filename": "award.pdf",
		"content_type": "application/pdf",
		"size": 245761,
		"url": "http://127.0.0.1:8000/api/v1/files/f_3b6e4b08fd5c4e6f9d"
	},
	"request_id": "uuid"
}
```

#### 2) 获取文件

- 接口：`GET /api/v1/files/{file_id}`
- 权限：当前实现无需登录
- 返回：文件流（`FileResponse`），非统一 JSON 结构

---

### 7.5 评审令牌（Tokens）

#### 1) 创建评审令牌

- 接口：`POST /api/v1/tokens/reviewer`
- 权限：教师或管理员（`role in {teacher, admin}`）

请求 JSON：

```json
{
	"class_ids": [1, 2, 3],
	"expired_at": "2026-03-01T23:59:59Z"
}
```

返回 JSON（成功）：

```json
{
	"code": 0,
	"message": "创建成功",
	"data": {
		"token_id": 1,
		"token": "rvw_a1b2c3d4e5f6g7h8",
		"type": "reviewer",
		"class_ids": [1, 2, 3],
		"expired_at": "2026-03-01T23:59:59+00:00"
	},
	"request_id": "uuid"
}
```

#### 2) 激活评审令牌

- 接口：`POST /api/v1/tokens/reviewer/activate`
- 权限：学生（`role=student`）

请求 JSON：

```json
{
	"token": "rvw_a1b2c3d4e5f6g7h8"
}
```

返回 JSON（成功）：

```json
{
	"code": 0,
	"message": "激活成功",
	"data": {
		"token_id": 1,
		"status": "active",
		"activated_user_id": 1001,
		"activated_at": "2026-02-24T03:10:23.325193+00:00",
		"is_reviewer": true,
		"reviewer_token_id": 1
	},
	"request_id": "uuid"
}
```

#### 3) 令牌列表

- 接口：`GET /api/v1/tokens`
- 权限：教师或管理员（`role in {teacher, admin}`）
- Query：`type=reviewer`、`status`（可选：`active/expired/revoked`）、`page`、`size`

返回 JSON（成功）：

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
				"id": 1,
				"token": "rvw_a1b2c3d4e5f6g7h8",
				"type": "reviewer",
				"class_ids": [1, 2, 3],
				"status": "active",
				"expired_at": "2026-03-01T23:59:59+00:00",
				"created_at": "2026-02-24T03:00:00+00:00",
				"activated_at": "2026-02-24T03:10:23.325193+00:00",
				"activated_user_id": 1001
			}
		]
	},
	"request_id": "uuid"
}
```

#### 4) 令牌失效

- 接口：`POST /api/v1/tokens/{token_id}/revoke`
- 权限：教师或管理员（`role in {teacher, admin}`）

返回 JSON（成功）：

```json
{
	"code": 0,
	"message": "失效成功",
	"data": {},
	"request_id": "uuid"
}
```

---

## 7.7 审核员审核模块（班委）

### 1. 获取待审核列表（按管辖班级）

- **URL**: `/reviews/pending`
- **Method**: `GET`
- **权限**: `reviewer`
- **Query**: `class_id=&category=&sub_type=&page=&size=&keyword=`

---

### 1.1 按分类获取待审核汇总

- **URL**: `/reviews/pending/category-summary`
- **Method**: `GET`
- **权限**: `reviewer`
- **Query**: `class_id=&term=`

**成功响应 (200)**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "class_id": 301,
    "term": "2025-2026-1",
    "categories": [
      {
        "category": "physical_mental",
        "sub_type": "basic",
        "pending_count": 8,
        "approved_count": 23,
        "rejected_count": 5,
        "category_score": 122.0
      },
      {
        "category": "physical_mental",
        "sub_type": "achivement",
        "pending_count": 4,
        "approved_count": 18,
        "rejected_count": 2,
        "category_score": 65.5
      }
    ],
    "total_score": 187.5
  }
}
```

---

### 1.2 按分类获取待审核明细

- **URL**: `/reviews/pending/by-category`
- **Method**: `GET`
- **权限**: `reviewer`
- **Query**: `class_id=&category=&sub_type=&term=&page=&size=`

**成功响应 (200)**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "class_id": 301,
    "category": "physical_mental",
    "term": "2025-2026-1",
    "list": [
      {
        "application_id": 9012,
        "student_name": "王五",
        "status": "pending_review",
        "score": 3.0,
        "score_rule_version": "v2026.02"
      }
    ]
  }
}
```

---

### 2. 获取审核详情

- **URL**: `/reviews/{application_id}`
- **Method**: `GET`
- **权限**: `reviewer`

---

### 3. 审核决策（通过/驳回合并）

- **URL**: `/reviews/{application_id}/decision`
- **Method**: `POST`
- **权限**: `reviewer`

**请求参数**
```json
{
  "decision": "approved",
}
```

---

### 4. 获取我的审核记录

- **URL**: `/reviews/history`
- **Method**: `GET`
- **权限**: `reviewer`
- **Query**: `result=approved|rejected&from=&to=&page=&size=`

---

### 5. 获取待审核数量（首页红点）

- **URL**: `/reviews/pending-count`
- **Method**: `GET`
- **权限**: `reviewer`

---

## 7.8. 教师管理申报模块

### 1. 全局查询申报记录

- **URL**: `/teacher/applications`
- **Method**: `GET`
- **权限**: `teacher`
- **Query**: `grade=&class_id=&award_type=&status=&page=&size=&keyword=`

---

### 2. 审核异常复核（改判）

- **URL**: `/teacher/applications/{application_id}/recheck`
- **Method**: `POST`
- **权限**: `teacher`

**请求参数**
```json
{
  "target_status": "rejected",
}
```

---

### 3. 批量归档

- **URL**: `/teacher/applications/archive`
- **Method**: `POST`
- **权限**: `teacher`

**请求参数**
```json
{
  "application_ids": [9001, 9002, 9003]
}
```

---

### 4. 统计看板

- **URL**: `/teacher/statistics`
- **Method**: `GET`
- **权限**: `teacher`
- **Query**: `grade=&class_id=&from=&to=`

**成功响应 (200)**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "total": 1234,
    "approved": 1010,
    "rejected": 180,
    "pending": 44,
    "total_score": 6512.0,
    "avg_score": 5.28,
    "by_award_type": [
      {"type": "discipline_competition", "count": 330, "score": 2010.0},
      {"type": "volunteer", "count": 240, "score": 980.0}
    ]
  }
}
```

---

## 7.9 教师查看年级班级统计数据模块

### 1. 查看某年级各班级整体情况

- **URL**: `/counselor/grades/{grade}/classes/overview`
- **Method**: `GET`
- **权限**: `teacher/admin`
- **Query**: `term=`

**成功响应 (200)**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "grade": 2023,
    "term": "2025-2026-1",
    "classes": [
      {
        "class_id": 301,
        "class_name": "23级1班",
        "total_students": 42,
        "submitted_students": 35,
        "submission_rate": 0.8333,
        "pending_review": 12,
        "approved": 60,
        "rejected": 14,
        "total_score": 187.5,
        "avg_score": 5.36
      }
    ]
  }
}
```

---

### 2. 查看某年级下单个班级明细

- **URL**: `/counselor/grades/{grade}/classes/{class_id}`
- **Method**: `GET`
- **权限**: `teacher/admin`
- **Query**: `term=&page=&size=`

---

## 7.10 导出-归档-公示模块

### 1. 创建导出归档记录

- **URL**: `/archives/exports`
- **Method**: `POST`
- **权限**: `teacher/admin`

**请求参数**
```json
{
  "export_task_id": "exp_10001", // 直接绑定到某次“导出”的export_task_id上
}
```

---

### 2. 查询归档列表

- **URL**: `/archives/exports`
- **Method**: `GET`
- **权限**: `teacher/admin`
- **Query**: `term=&grade=&class_id=&page=&size=`

**成功响应 (200)**
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
    },
    {
      "archive_id": "arc_9002",
      "archive_name": "2025-2026-2_2023级_综测统计表",
      "term": "2025-2026-2",
      "grade": 2023,
      "class_ids": [301, 302],
      "is_announced": false,
    },
  ]
}
```

---

### 3. 归档文件下载

- **URL**: `/archives/exports/{archive_id}/download`
- **Method**: `GET`
- **权限**: `teacher/admin`


### 4. 发布公示

- **URL**: `/announcements`
- **Method**: `POST`
- **权限**: `teacher`

**请求参数**
```json
{
  "title": "2025-2026学年第一学期综测公示",
  "archive_id": 111, // 公示直接绑定到归档上
  "start_at": "2026-02-15T00:00:00Z",
  "end_at": "2026-02-20T23:59:59Z",
}
```

---

### 5. 获取公示列表

- **URL**: `/announcements`
- **Method**: `GET`
- **权限**: 已登录

<!-- 返回所有有效的excel公示文件的名称、下载链接 -->

---


## 7.11. 邮件通知模块

### 1. 发送驳回通知（内部调用）

- **URL**: `/notifications/reject-email`
- **Method**: `POST`
- **权限**: `system/reviewer/teacher`

**请求参数**
```json
{
  "application_id": 9001,
  "to": "student@example.com",
}
```

---

### 2. 查询邮件日志

- **URL**: `/notifications/email-logs`
- **Method**: `GET`
- **权限**: `teacher/admin`
- **Query**: `status=success|failed&page=1&size=10`

---

## 7.12. 申诉模块

### 1. 提交申诉

- **URL**: `/appeals`
- **Method**: `POST`
- **权限**: `student`

**请求参数**
```json
{
  "announcement_id": 100,
  "content": "我认为某项加分未统计",
  "attachments": ["f_2001"]
}
```

---

### 2. 查询申诉记录

- **URL**: `/appeals`
- **Method**: `GET`
- **权限**: `student/reviewer/teacher`（按数据权限）

---

### 3. 处理申诉

- **URL**: `/appeals/{appeal_id}/process`
- **Method**: `POST`
- **权限**: `teacher`

**请求参数**
```json
{
  "result": "accepted",
}
```

---

## 8. 数据权限规则

- 学生：仅访问本人数据（申报、文件、申诉）
- 审核员：仅访问已绑定班级的数据
- 教师：访问全局数据（可二次复核、统计、导出，包含年级/班级查看能力）
- 管理员：系统级配置与日志权限

---


