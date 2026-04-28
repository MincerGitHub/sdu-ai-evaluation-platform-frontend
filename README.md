# AI 介入的综测评分系统-前端

## 1. 工程简介

本项目是一个基于 **Vite + Vue3 + Pinia + Vue Router + Element Plus** 的单页应用，用于支持山东大学计算机科学与技术学院“综测智能评定”业务的前端界面。

核心目标：

- 支持学生在线申报各类综测加分项目，并上传证明材料；
- 支持审核人按班级范围审核申报，必要时参考 AI 审核报告；
- 为教师提供申报复核、班级/学生统计、综测画像、导出、归档、公示、申诉处理与令牌管理能力；
- 为管理员提供系统配置、用户管理、班级管理、奖项字典与系统日志查看能力。

当前工程运行环境：

- Node.js：`v20.19.1`
- 前端端口：`3000`
- 后端代理：默认转发到 `http://127.0.0.1:8000`
- 接口规范：见仓库内的 [`api.md`](./api.md)
- 后端文档：`../backend/docs/综测平台接口文档.md`
- 后端仓库地址：<https://github.com/DarkStars1922/zcpt>

---

## 2. 技术栈

- 构建工具：`Vite`
- 框架：`Vue 3`
- 状态管理：`Pinia`
- 路由：`Vue Router`
- UI 组件：`Element Plus`
- HTTP：`axios`
- 图表：`ECharts`
- 文档预览辅助：`mammoth`
- Mock 样例：`mock/` 目录下的 `*.mock.js`

前端请求统一由 `src/services/http.js` 封装，默认 `baseURL` 为 `/api/v1`。响应拦截器会处理统一业务码，并在 `access_token` 过期时自动使用 `refresh_token` 续期后重试原请求。

---

## 3. 业务角色

系统内主要有 4 类角色：

- `student`：学生
  - 可发起/管理本人申报、查看公示、发起申诉、维护个人信息；
  - 可通过审核人令牌绑定审核权限，绑定后仍保持学生账号身份。
- `reviewer`：审核人视图
  - 不是独立账号角色，而是 `student + is_reviewer=true`；
  - 可在审核人视图中查看并审核令牌绑定班级范围内的申报。
- `teacher`：教师/辅导员
  - 可查看全部申报、复核结果、统计分析、导出归档、发布公示、处理申诉、管理审核人令牌和班级。
- `admin`：管理员
  - 可查看管理员首页，维护系统配置、系统日志、奖项字典、班级与账号信息。

前端通过登录后返回的 `user.role`、`user.is_reviewer` 控制路由访问、菜单展示与学生/审核人视图切换。

---

## 4. 当前功能模块

### 4.1 登录与认证

- 页面：`/login`、`/register`
- 接口：
  - `POST /auth/login`
  - `POST /auth/register`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - `POST /auth/change-password`（后端已支持，当前前端暂未提供入口）
  - `GET /users/me`
  - `PUT /users/me`
- 能力：
  - 登录后持久化 `access_token` / `refresh_token` / `auth_user`；
  - 刷新页面后自动拉取当前用户；
  - 通过路由守卫拦截未登录和无权限访问；
  - 学生、教师、管理员均可维护姓名、邮箱、手机号等个人信息。

### 4.2 学生申报

- 页面：
  - `/student/dashboard`
  - `/student/application/:category/:subType`
  - `/student/profile`
- 分类：
  - `physical_mental`：身心素养，基础性评价/成果性评价；
  - `art`：文艺素养，基础性评价/成果性评价；
  - `labor`：劳动素养，基础性评价/成果性评价；
  - `innovation`：创新素养，基础素养/突破提升。
- 接口：
  - `GET /applications/my/category-summary`
  - `GET /applications/my`
  - `GET /applications/my/by-category`
  - `GET /applications/{application_id}`
  - `POST /applications`
  - `PUT /applications/{application_id}`
  - `DELETE /applications/{application_id}`
  - `POST /applications/{application_id}/withdraw`
  - `POST /files/upload`
  - `GET /files/{file_id}`
  - `GET /files/{file_id}/url`
- 当前规则：
  - 学生只能操作本人申报；
  - 文件上传后后端会创建 OCR 文件分析任务，申报审核时复用分析结果；
  - 创建和修改后进入 `pending_ai`，后端异步执行 AI 审核；
  - AI 通过后流转到 `pending_review`，AI 异常流转到 `ai_abnormal`，AI 服务失败时可按后端配置兜底到人工审核；
  - 附件支持 `pdf/jpg/jpeg/png/webp/docx`，前端限制单文件不超过 `25MB`。

### 4.3 AI 审核

- 接口：
  - `GET /ai-audits/{application_id}/report`
  - `GET /ai-audits/logs`
  - `POST /ai-audits/image-authenticity`
- 能力：
  - 文件上传后执行 OCR 分析，识别证明材料中的标题、等级、姓名候选、印章、落款等信息；
  - 申报创建/修改后生成 AI 审核报告，报告包含 `identity_check`、`consistency_check`、`risk_points`、`score_breakdown` 等字段；
  - 教师首页读取 AI 审核日志，展示通过、异常、处理中和失败概览；
  - 图片真实性检测作为独立风险提示，不自动改变申报、审核、归档或计分结果。

### 4.4 审核人视图

- 页面：
  - `/reviewer/dashboard`
  - `/reviewer/application/:category/:subType`
- 进入条件：
  - 当前用户 `role=student`；
  - 当前用户 `is_reviewer=true`。
- 接口：
  - `GET /reviews/pending-count`
  - `GET /reviews/pending/category-summary`
  - `GET /reviews/pending/by-category`
  - `GET /reviews/{application_id}`
  - `POST /reviews/{application_id}/decision`
  - `POST /reviews/batch-decision`
  - `GET /reviews/history`
- 能力：
  - 查看绑定班级范围内的待审核申报；
  - 按分类、状态筛选；
  - 查看申报详情、附件预览、AI 报告；
  - 单条或批量通过/驳回申报；
  - 按后端文档口径，审核员通过后进入教师终审状态，教师/管理员终审通过后才正式入账。

### 4.5 教师端

- 页面：
  - `/teacher/dashboard`
  - `/teacher/application/:category/:subType`
  - `/teacher/statistics`
  - `/teacher/statistics/students`
  - `/teacher/insights`
  - `/teacher/all-applications`
  - `/teacher/export`
  - `/teacher/archive`
  - `/teacher/announcement`
  - `/teacher/appeals`
  - `/teacher/classes`
  - `/teacher/tokens`
  - `/teacher/profile`
- 接口：
  - `GET /teacher/applications`
  - `POST /teacher/applications/{application_id}/recheck`
  - `POST /teacher/applications/archive`
  - `GET /teacher/statistics`
  - `GET /teacher/statistics/classes`
  - `GET /teacher/statistics/students`
  - `POST /teacher/insights/analyze`
  - `POST /teacher/exports`
  - `GET /teacher/exports/{task_id}`
  - `GET /teacher/exports/{task_id}/download`
- 能力：
  - 教师首页展示申报总数、状态统计、总分与 AI 审核概览；
  - 按班级统计申报数、驳回数、待审数、平均分和总分；
  - 按学生统计官方总分、原始总分、超额分与四类素养得分；
  - 生成综测画像与风险预警，支持全年级或部分班级范围；
  - 查询全部申报，支持筛选、复核与归档；
  - 创建导出任务，轮询任务状态并下载导出文件。

### 4.6 导出、归档与公示

- 页面：
  - `/teacher/export`
  - `/teacher/archive`
  - `/teacher/announcement`
  - `/student/announcement`
  - `/student/announcement/:announcementId/report`
  - `/student/announcement/:announcementId/applications`
- 接口：
  - `POST /archives/exports`
  - `GET /archives/exports`
  - `GET /archives/exports/{archive_id}/download`
  - `GET /announcements`
  - `POST /announcements`
  - `PUT /announcements/{announcement_id}`
  - `POST /announcements/{announcement_id}/close`
  - `POST /announcements/{announcement_id}/reopen`
  - `DELETE /announcements/{announcement_id}`
  - `GET /announcements/{announcement_id}/download`
  - `GET /announcements/{announcement_id}/my-report`
  - `POST /announcements/{announcement_id}/my-report/story-copy`
  - `GET /announcements/{announcement_id}/applications`
  - `GET /announcements/{announcement_id}/applications/{application_id}`
- 能力：
  - 导出页可按年级/班级预览学生统计并创建 `xlsx` 导出任务；
  - 归档页可查看归档记录、下载归档文件；
  - 公示绑定一个或多个归档范围，支持年级/班级范围、开始结束时间、关闭、重开、删除；
  - 学生可下载公示文件、查看个人公示报告、查看公示范围内的公开申报列表。

### 4.7 申诉

- 页面：
  - `/student/appeals`
  - `/teacher/appeals`
- 接口：
  - `POST /appeals`
  - `GET /appeals`
  - `GET /appeals/application-options`
  - `POST /appeals/{appeal_id}/process`
  - `DELETE /appeals/{appeal_id}`
  - `POST /notifications/reject-email`
- 能力：
  - 学生可选择公示、关联申报、匿名标记、填写申诉内容并上传附件；
  - 教师可按状态和学生姓名筛选申诉；
  - 教师处理申诉时可填写处理意见，选择是否调整关联申报分数，并可发送邮件通知；
  - 未处理申诉支持删除，已处理申诉保留处理记录。

### 4.8 管理员与系统管理

- 页面：
  - `/admin/dashboard`
  - `/admin/config`
  - `/admin/logs`
  - `/admin/award-dicts`
  - `/admin/classes`
  - `/admin/announcement`
  - `/admin/profile`
- 接口：
  - `GET /health`
  - `GET /system/configs`
  - `PUT /system/configs`
  - `GET /system/logs`
  - `GET /system/users`
  - `POST /system/users`
  - `PUT /system/users/{user_id}`
  - `DELETE /system/users/{user_id}`
  - `GET /system/classes`
  - `GET /system/classes/public`
  - `POST /system/classes`
  - `PUT /system/classes/{class_id}`
  - `DELETE /system/classes/{class_id}`
  - `GET /system/award-dicts`
  - `POST /system/award-dicts`
  - `PUT /system/award-dicts/{award_id}`
  - `DELETE /system/award-dicts/{award_id}`

---

## 5. 关键业务流程

1. 学生注册/登录
   - 注册时选择班级，可选填写邮箱、手机号；
   - 若持有审核人令牌，可注册时填写或登录后在个人信息页绑定。

2. 学生提交申报
   - 在四类素养的具体子模块下选择奖项、填写说明、发生日期、分数并上传附件；
   - 证明文件上传后先进入 OCR 分析队列；
   - 申报创建后进入 `pending_ai`，后端投递 AI 审核任务。

3. AI 审核
   - AI 审核结合 OCR 文本、姓名/学号命中、奖项标题、等级、文件名、印章、落款等信息生成报告；
   - AI 通过后流转 `pending_review`；
   - AI 异常流转 `ai_abnormal`，供审核人和教师重点查看；
   - AI 服务失败时，如后端开启 `fallback_to_manual`，可兜底进入人工审核。

4. 审核人审核
   - 已绑定令牌的学生可切换到审核人视图；
   - 审核人只能看到令牌授权班级范围内、且不属于自己的申报；
   - 可结合申报详情、附件预览和 AI 审核报告通过或驳回；
   - 审核员通过后进入教师终审，驳回则进入 `rejected` 并可触发邮件通知。

5. 教师复核与统计
   - 教师可在全部申报中筛选、查看详情、终审/复核结果；
   - 教师或管理员审核通过时正式入账并重算学生综测分；
   - 班级统计、学生统计、综测画像用于发现班级差异、分数异常和低参与学生。

6. 导出与归档
   - 教师按年级/班级创建导出任务；
   - 可选择 `store_to_archive=true` 将导出结果写入归档；
   - 已归档申报不再作为普通复核对象处理。

7. 公示与申诉
   - 教师基于归档记录发布公示；
   - 学生查看公示和个人报告后，可关联公示和具体申报发起申诉；
   - 教师处理申诉，必要时调整关联申报分数并发送邮件通知。

8. 管理员维护
   - 管理员维护系统配置、班级、奖项字典、账号和系统日志；
   - 教师也可进入班级管理与令牌管理页面完成日常配置。

---

## 6. 项目结构

仅列出与业务强相关的目录：

- `src/`
  - `views/auth/`：登录、注册、个人信息、审核人令牌管理；
  - `views/dashboard/`：学生、审核人、教师、管理员首页；
  - `views/application/`：学生申报、审核列表、教师统计、全部申报、综测画像；
  - `views/announcement/`：公示列表、个人报告、公示申报、申诉创建与处理；
  - `views/archive/`：导出与归档；
  - `views/system/`：系统配置、日志、奖项字典、班级管理；
  - `components/layout/`：四类角色布局；
  - `components/application/`：申报表单和申报表格；
  - `components/review/`：审核表格、审核详情弹窗；
  - `components/score/`：综测分数展示；
  - `stores/`：Pinia 状态管理；
  - `services/`：REST API 封装；
  - `router/`：路由与权限守卫；
  - `utils/`：角色/状态常量、班级映射、奖项字典和分值映射。
- `mock/`
  - 保存本地 mock 数据和接口样例，便于对照联调；
  - 当前 `vite.config.mjs` 未启用 `vite-plugin-mock`，开发服务默认通过代理访问真实后端。

---

## 7. 本地开发与构建

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

构建生产包：

```bash
npm run build
```

本地预览生产包：

```bash
npm run serve
```

如需切换后端地址，可设置环境变量：

```bash
VITE_API_PROXY_TARGET=http://127.0.0.1:8000 npm run dev
```

Windows PowerShell 示例：

```powershell
$env:VITE_API_PROXY_TARGET="http://127.0.0.1:8000"
npm run dev
```

---

## 8. 联调提示

- 前端所有业务接口默认以 `/api/v1` 为前缀；
- Vite 代理会把 `/api` 请求转发到 `VITE_API_PROXY_TARGET`；
- 文件下载、导出下载、归档下载、公示下载使用 `blob` 方式请求，后端需正确返回文件流；
- 统一 JSON 响应建议保持 `code/message/data/request_id`；
- `code=1005` 会触发 access token 自动刷新，`code=1006` 会清空登录态并要求重新登录；
- `mock/mockData.js` 中保留了示例账号和业务数据，可作为后端联调样例参考。
