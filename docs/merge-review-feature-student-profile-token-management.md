# 功能分支合并说明（负责人审阅版）

## 1. 文档信息

- 文档日期：2026-02-28
- 基线分支：`main`（对比 `origin/main`）
- 功能分支：`feature/student-profile-token-binding`
- 关键提交：`14bfdee` (`feat: add profile pages and teacher token management`)
- Diff 统计：12 个文件，新增 877 行，删除 157 行

---

## 2. 本次改动目标

相对于原项目，本次聚焦完成以下四类工作：

1. 学生个人信息页（含绑定审核人令牌）
2. 教师个人信息页（含邮箱编辑）
3. 管理员个人信息页
4. 教师端令牌管理页（列表/筛选/新建/失效）

并修复两个影响体验/稳定性的关键问题：

1. 刷新后偶发跳转 `/forbidden`
2. 令牌失效操作触发 `Network Error` 且开发服务崩溃

---

## 3. 相对于原项目的主要变化

### 3.1 用户中心能力补齐

新增 3 个角色的个人信息页：

- 学生页：`/student/profile`
  - 支持查看姓名/学号（只读）
  - 支持编辑邮箱、手机号
  - 支持输入令牌并绑定审核人身份
- 教师页：`/teacher/profile`
  - 支持查看姓名/工号（只读）
  - 支持编辑邮箱
- 管理员页：`/admin/profile`
  - 支持查看姓名/账号（只读）
  - 支持编辑邮箱

### 3.2 教师端令牌管理能力新增

新增页面：`/teacher/tokens`

功能点：

- 列表查看令牌（令牌、权限范围、状态、失效时间）
- 状态筛选 + 分页
- 新建令牌（班级范围多选、失效时间可选）
- 令牌失效（确认弹窗）

### 3.3 路由与布局接线补齐

- 补齐管理员路由组：`/admin/dashboard`、`/admin/profile`
- 学生、教师、管理员布局中“个人信息”菜单均接到真实路由
- 教师布局侧边栏改为教师语义导航（首页/个人信息/令牌管理）
- 增加 `requiresReviewer` 的守卫执行逻辑

### 3.4 认证与刷新稳定性修复

修复刷新后被误判无权限的问题：

- `auth.user` 增加本地持久化（`localStorage.auth_user`）
- 路由守卫增加兜底：有 token 但无 user 时先拉取 `/users/me`
- 拉取失败时执行登出并回登录页，避免停在错误状态

### 3.5 Mock 数据与接口稳定性修复

- `mock/auth.mock.js`
  - 登录返回补全 `account`
  - 新增 `/users/me` 的 `GET/PUT` mock
  - `refresh` 令牌刷新后保留用户 id 关联
- `mock/tokens.mock.js`
  - 新增 `rvw_demo_pending_token`（便于联调）
  - 修复失效接口参数兼容（`params/query`），避免进程崩溃

---

## 4. 文件变更清单（审阅入口）

### 新增文件

- `src/views/student/StudentProfilePage.vue`
- `src/views/teacher/TeacherProfilePage.vue`
- `src/views/admin/AdminProfilePage.vue`
- `src/views/teacher/TokenManagementPage.vue`

### 修改文件

- `src/router/index.js`
- `src/stores/auth.js`
- `src/views/auth/LoginPage.vue`
- `src/components/layout/StudentLayout.vue`
- `src/components/layout/TeacherLayout.vue`
- `src/components/layout/AdminLayout.vue`
- `mock/auth.mock.js`
- `mock/tokens.mock.js`

---

## 5. 测试与验证记录

### 5.1 构建验证

- 执行 `npm run build`：通过

### 5.2 业务冒烟（已执行）

- 学生链路
  - 登录 -> 个人信息 -> 修改资料 -> 绑定令牌 -> 切换审核人视图
- 教师链路
  - 登录 -> 个人信息 -> 修改邮箱
  - 登录 -> 令牌管理 -> 列表/筛选/新建/失效
- 管理员链路
  - 登录 -> 个人信息 -> 修改邮箱

### 5.3 缺陷闭环验证

- 缺陷 1：刷新跳 `/forbidden`
  - 根因：token 恢复但 user 丢失，角色守卫误判
  - 结果：已修复并回归
- 缺陷 2：令牌失效触发 `Network Error` 且服务退出
  - 根因：mock 动态参数读取不兼容导致抛异常
  - 结果：已修复并回归

---

## 6. 已知限制与后续建议

1. 令牌管理页中的班级选项当前为前端静态枚举，后续建议改为接口驱动。
2. 当前以 mock 为主完成联调，接入真实后端后建议补一次全链路回归。
3. 路由/权限已具备基础可用性，后续可补细粒度按钮级权限。

---

## 7. 合并建议（Feature Branch Workflow，无 PR）

建议由有主干权限的同事执行：

```bash
git switch main
git pull origin main
git merge --no-ff feature/student-profile-token-binding
git push origin main
```

合并后建议立即做一次 5 分钟冒烟：

1. 学生个人信息+令牌绑定
2. 教师令牌管理（新建+失效）
3. 管理员个人信息

---

## 8. 回滚方案

若主干发现异常，可快速回滚本次合并提交（示意）：

```bash
git switch main
git log --oneline
git revert <merge_commit_sha>
git push origin main
```

