# 功能分支合并说明（负责人审阅版，第三版）

## 1. 文档信息

- 文档日期：2026-03-02
- 基线分支：`main`（对比 `origin/main`）
- 当前功能分支：`feature/teacher-query-module`
- 文档定位：在第二版基础上，补充“教师申报查询模块”最新可提审改动与测试步骤

---

## 2. 本轮目标（增量）

本轮主要交付教师端申报查询模块的两项能力，并完成弹窗样式对齐：

1. 教师对全部申报进行筛查、复核、归档
2. 教师按班级查看申报统计信息
3. 教师点击“审核申报”后，弹窗样式与原型对齐（重点）

---

## 3. 相对上一版的核心改动

### 3.1 教师全部申报页（`/teacher/all-applications`）

文件：`src/views/teacher/TeacherAllApplicationsPage.vue`

已实现：

- 列表筛选：关键词、状态、班级
- 表格字段：年级、班级、学号、申报名称、项目、审核状态
- 行级操作：`审核申报`、`归档`
- 批量操作：批量归档

本次重点修正（按原型）：

- 原“复核申报（单选 + 备注）”弹窗，调整为“审核申报”弹窗
- 弹窗字段改为：
  - 申报名称
  - 项目
  - 证明材料（支持链接查看）
  - AI 自动检测结果
  - 评价（可编辑，默认空）
- 底部按钮改为：
  - 通过
  - 拒绝
  - 返回

### 3.2 教师申报统计页（`/teacher/statistics`）

文件：`src/views/teacher/TeacherStatisticsPage.vue`

已实现：

- 按年级/班级筛选
- 统计指标展示：总申报数、拒绝申报数、待审核申报数、平均分、总分

### 3.3 服务与 Mock 数据联动

文件：

- `src/services/statisticService.js`
- `mock/statistic.mock.js`

本次补充：

- 教师查询列表接口返回增加字段：`attachments`、`ai_result`、`description`
- 确保“审核申报”弹窗可直接展示证明材料和 AI 结果
- 复核提交接口继续复用：`approved` / `rejected`

### 3.4 废弃服务移除

文件：`src/services/counselorService.js`

- 已确认弃用，已从项目中移除

---

## 4. 本轮文件变更清单（审阅入口）

### 新增文件

- `src/services/statisticService.js`
- `mock/statistic.mock.js`
- `src/views/teacher/TeacherStatisticsPage.vue`
- `src/views/teacher/TeacherAllApplicationsPage.vue`

### 主要修改文件

- `src/components/layout/TeacherLayout.vue`
- `src/router/index.js`
- `src/services/index.js`
- `src/views/auth/LoginPage.vue`
- `.gitignore`

### 删除文件

- `src/services/counselorService.js`

---

## 5. 测试与验证记录

### 5.1 构建验证

- 执行 `npm run build`：通过

### 5.2 手工回归步骤（负责人可直接复现）

#### A. 教师审核弹窗样式与交互

1. 启动项目：`npm run dev`
2. 登录教师账号：`teacher01 / 12345678`
3. 进入：`/teacher/all-applications`
4. 点击任意一行 `审核申报`
5. 预期：弹窗标题为“审核申报”，字段包含
   - 申报名称
   - 项目
   - 证明材料
   - AI 自动检测结果
   - 评价
6. 预期：底部按钮为 `通过`、`拒绝`、`返回`

#### B. 教师复核动作

1. 在弹窗点击 `通过` 或 `拒绝`
2. 预期：提示“审核成功”
3. 预期：列表对应行状态刷新为“已通过”或“已驳回”

#### C. 教师统计页

1. 进入：`/teacher/statistics`
2. 使用年级/班级筛选后点击查询
3. 预期：表格统计数据正常刷新

---

## 6. 已知事项

1. 当前数据来源为 Mock，证明材料链接与 AI 结果同样为 Mock 数据展示
2. 提交后若切换到真实后端，需要将 `statisticService` 对接正式接口并校对字段命名

---

## 7. 合并建议（Feature Branch Workflow，无 PR）

```bash
git switch main
git pull origin main
git merge --no-ff feature/teacher-query-module
git push origin main
```

合并后建议最少执行 5 分钟冒烟：

1. `/teacher/all-applications` 打开审核弹窗并执行一次通过/拒绝
2. `/teacher/statistics` 执行一次筛选查询
3. `/teacher/announcement` 确认公示入口与页面可用
