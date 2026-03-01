# 功能分支合并说明（负责人审阅版，第二版）

## 1. 文档信息

- 文档日期：2026-03-01
- 基线分支：`main`（对比 `origin/main`）
- 当前功能分支：`feature/student-appeal-create-page`
- 文档定位：在上一版“个人信息页 + 令牌管理”合并说明基础上，补充本轮“申诉管理 + 公示页”增量改动总结。

---

## 2. 本轮改动目标

本轮主要交付 3 类能力：

1. 学生端申诉页（列表 + 新建）
2. 教师端申诉处理页（审核 + 通知）
3. 公示页实现（学生/教师/管理员三角色统一视图效果）

并处理了与这三项相关的导航与 Mock 稳定性问题。

---

## 3. 相对原项目的主要变化

### 3.1 学生申诉页：`/student/appeals`

新增页面：`src/views/student/AppealCreatePage.vue`

实现内容：

- 默认进入“我的申诉”列表页，展示已提交申诉
- 点击“+ 新建”后切换到新建表单（按原型“先列表再新建”）
- 新建表单包含：
  - 公示选择
  - 申诉内容（必填）
  - 证明材料上传（Mock）
- 支持查看申诉详情弹窗（状态、内容、附件、处理备注）

路由：

- `StudentAppeals`: `/student/appeals`
- `StudentAppealCreate`: `/student/appeals/create`（重定向到 `/student/appeals?mode=create`）

---

### 3.2 教师申诉处理页：`/teacher/appeals`

新增页面：`src/views/teacher/AppealProcessPage.vue`

实现内容：

- 申诉列表查询（状态筛选 + 分页）
- 查看申诉详情与证明材料
- 处理动作：通过 / 拒绝
- 可选发送结果邮件通知
- 列表导出（CSV）

新增 Store：

- `src/stores/appeal.js`
  - `fetchAppeals`
  - `processAppeal`
  - 处理过程 loading / error 管理

服务联动：

- `src/services/notificationService.js` 补充申诉结果邮件发送能力

---

### 3.3 公示页实现（统一视图）

新增服务：

- `src/services/announcementService.js`
  - `getAnnouncements()`
  - `getDownloadUrl(archiveId)`

页面实现：

- `src/views/announcement/AnnouncementPage.vue`
  - 标题“公示”
  - 下载链接列表（来自 `/announcements`）
  - 空态和异常提示

字体与视觉调整（根据反馈）：

- 公示标题、链接字体从过大尺寸调整为后台页面常规尺寸
- 保留与系统整体风格一致的简洁展示

---

### 3.4 路由与布局接线（公示页）

为保证“同内容、不同角色布局一致展示”，新增角色内路由：

- 学生：`/student/announcement`
- 教师：`/teacher/announcement`
- 管理员：`/admin/announcement`

并保留全局入口：

- `/announcement` 会按当前登录角色自动重定向到对应角色路由

布局导航调整：

- `StudentLayout` 顶栏公示入口改为 `/student/announcement`
- `TeacherLayout` 顶栏公示入口改为 `/teacher/announcement`
- `AdminLayout` 顶栏公示入口改为 `/admin/announcement`
- 按最新需求，教师端顶栏已移除“申诉列表”，仅保留“公示”与用户菜单（侧边栏仍保留“申诉列表”）

---

### 3.5 Mock 稳定性修复

修改：`mock/appeals.mock.js`

- 修复教师处理申诉时，动态参数缺失导致的 `Network Error` / 开发服务中断问题
- 提升处理接口参数读取兼容性，保障“失效/处理”等动作可稳定回包

---

## 4. 本轮文件变更清单（审阅入口）

### 新增文件

- `src/services/announcementService.js`
- `src/stores/appeal.js`
- `src/views/student/AppealCreatePage.vue`
- `src/views/teacher/AppealProcessPage.vue`

### 主要修改文件

- `src/views/announcement/AnnouncementPage.vue`
- `src/router/index.js`
- `src/services/index.js`
- `src/services/notificationService.js`
- `mock/appeals.mock.js`
- `src/components/layout/StudentLayout.vue`
- `src/components/layout/TeacherLayout.vue`
- `src/components/layout/AdminLayout.vue`

---

## 5. 测试与验证记录

### 5.1 构建验证

- 执行 `npm run build`：通过

### 5.2 业务冒烟（已执行）

- 学生链路
  - 登录 -> 我的申诉列表 -> 新建申诉 -> 提交成功 -> 列表可见
- 教师链路
  - 登录 -> 申诉列表 -> 处理通过/拒绝 -> 状态刷新
  - 可选发送邮件通知链路可走通（Mock）
- 公示链路
  - 学生/教师/管理员分别进入各自公示路由，页面内容结构一致

### 5.3 已闭环问题

1. 教师处理申诉时出现 `Network Error` 且服务中断：已修复
2. 教师顶栏误出现“申诉列表”：已按需求移除
3. 公示页字体过大：已调整为常规阅读尺寸

---

## 6. 已知限制与后续建议

1. 公示下载当前为 Mock 链接，后续需对接真实文件下载能力。
2. 公示数据目前由 Mock 提供，默认条目较少；若要与原型“多条下载项”一致，可补充 Mock 数据。
3. 学生端“删除申诉”当前仍为占位提示，后续若需求确认可补真实删除接口与交互。

---

## 7. 合并建议（Feature Branch Workflow，无 PR）

建议由有主干权限同学执行：

```bash
git switch main
git pull origin main
git merge --no-ff feature/student-appeal-create-page
git push origin main
```

合并后建议做 5~10 分钟冒烟：

1. 学生：`/student/appeals` 新建申诉
2. 教师：`/teacher/appeals` 处理申诉
3. 三角色：各自公示入口与下载链接显示

---

## 8. 回滚方案

如主干出现异常，可快速回滚本次合并提交：

```bash
git switch main
git log --oneline
git revert <merge_commit_sha>
git push origin main
```

