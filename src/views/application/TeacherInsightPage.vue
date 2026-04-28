<template>
  <div class="teacher-insight-page page-container">
    <header class="page-header insight-hero">
      <div>
        <p class="eyebrow">AI 综合画像</p>
        <h2>综测画像与风险预警</h2>
        <p class="hero-copy">
          选择年级和班级后，系统会按当前填报学期清洗申报数据，分别分析整体、班级、四类素养和需关注学生。
        </p>
      </div>
      <el-tag :type="riskTagType(result?.overall_risk_level)" effect="dark" size="large">
        {{ riskLabel(result?.overall_risk_level) }}
      </el-tag>
    </header>

    <section class="filter-bar">
      <el-select v-model="query.grade" placeholder="选择年级" clearable style="width: 150px">
        <el-option v-for="item in gradeOptions" :key="item" :label="`${item}级`" :value="item" />
      </el-select>
      <el-select
        v-model="query.class_ids"
        multiple
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="3"
        placeholder="班级（不选则全年级）"
        :disabled="!query.grade"
        style="width: 320px"
      >
        <el-option v-for="item in classOptions" :key="item.class_id" :label="item.label" :value="item.class_id" />
      </el-select>
      <el-input-number v-model="query.max_risk_students" :min="3" :max="30" controls-position="right" />
      <el-button class="btn-main" :loading="loading" @click="runAnalysis">生成分析</el-button>
      <el-button class="btn-plain" :disabled="loading || !query.grade" @click="runAnalysis({ forceRefresh: true })">重新生成</el-button>
      <el-button class="btn-plain" :disabled="loading" @click="resetFilters">重置</el-button>
      <span class="scope-hint">{{ scopeHint }}</span>
    </section>

    <el-empty v-if="!result && !loading" description="请选择年级后生成综测画像" />
    <el-skeleton v-if="loading && !result" :rows="8" animated />

    <template v-if="result">
      <section class="summary-grid">
        <article class="summary-card main-summary">
          <span>整体画像</span>
          <strong>{{ result.summary }}</strong>
          <small>
            来源：{{ result.source === 'llm' ? '大模型分析' : '本地规则兜底' }} · {{ result.term }}
            <template v-if="result.cache"> · {{ result.cache.hit ? '已读取缓存' : '新生成缓存' }}</template>
          </small>
        </article>
        <article v-for="item in metricCards" :key="item.key" class="summary-card metric-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.hint }}</small>
        </article>
      </section>

      <section class="content-grid">
        <el-card class="module-card">
          <template #header>
            <div class="card-header">
              <span>四类积极性分析</span>
              <small>基础与成果/突破分开判断</small>
            </div>
          </template>
          <div class="module-list">
            <article v-for="item in result.module_findings || []" :key="item.module" class="module-item">
              <div class="module-title">
                <strong>{{ item.module }}</strong>
                <el-tag :type="activityTagType(item.activity_level)" size="small">{{ item.activity_level || '中' }}</el-tag>
              </div>
              <p>{{ item.observation || buildModuleObservation(item) }}</p>
              <small>{{ item.suggestion || '建议结合申报明细继续观察。' }}</small>
              <div class="module-metrics">
                <span>有效 {{ item.meaningful_count || 0 }}</span>
                <span>微分 {{ item.micro_count || 0 }}</span>
                <span>微分占比 {{ percent(item.micro_ratio) }}</span>
              </div>
            </article>
          </div>
        </el-card>

        <el-card class="quality-card">
          <template #header>
            <div class="card-header">
              <span>数据清洗提示</span>
              <small>降低微分条目污染</small>
            </div>
          </template>
          <div class="quality-stat">
            <strong>{{ percent(result.data_quality?.micro_ratio) }}</strong>
            <span>微分/参与痕迹占比</span>
          </div>
          <p>{{ result.data_quality?.note || '当前没有明显数据质量风险。' }}</p>
          <div class="key-categories">
            <h4>有效类别 Top</h4>
            <el-tag v-for="item in result.key_category_summary?.meaningful_top || []" :key="item.name" effect="plain">
              {{ item.name }} · {{ item.count }}
            </el-tag>
          </div>
          <div class="key-categories">
            <h4>微分条目 Top</h4>
            <el-tag v-for="item in result.key_category_summary?.micro_top || []" :key="item.name" type="warning" effect="plain">
              {{ item.name }} · {{ item.count }}
            </el-tag>
          </div>
        </el-card>
      </section>

      <el-card class="class-card">
        <template #header>
          <div class="card-header">
            <span>班级分项画像</span>
            <small>即使选择全年级，也会按班级拆分描述</small>
          </div>
        </template>
        <div class="class-grid">
          <article v-for="item in result.class_findings || []" :key="item.class_id" class="class-item">
            <div class="class-title">
              <strong>{{ item.label || `${item.class_id}班` }}</strong>
              <el-tag :type="riskTagType(item.risk_level)" size="small">{{ riskLabel(item.risk_level) }}</el-tag>
            </div>
            <p>{{ item.summary }}</p>
            <div class="class-focus">
              <span>重点模块</span>
              <el-tag v-for="module in item.focus_modules || []" :key="module" size="small" effect="plain">
                {{ module }}
              </el-tag>
              <em v-if="!(item.focus_modules || []).length">暂无集中短板</em>
            </div>
            <small>{{ item.suggestion }}</small>
          </article>
        </div>
      </el-card>

      <section class="content-grid">
        <el-card class="action-card">
          <template #header>
            <div class="card-header">
              <span>行动建议</span>
              <small>适合班会、提醒和个别沟通</small>
            </div>
          </template>
          <ol class="action-list">
            <li v-for="item in result.action_plan || []" :key="item">{{ item }}</li>
          </ol>
        </el-card>
      </section>

      <el-card class="risk-card">
        <template #header>
          <div class="card-header">
            <span>需关注学生</span>
            <small>已由系统回填姓名、学号和班级</small>
          </div>
        </template>
        <el-table :data="result.risk_students || []" border stripe empty-text="暂无需重点关注学生">
          <el-table-column label="风险" width="100">
            <template #default="{ row }">
              <el-tag :type="riskTagType(row.risk_level)" size="small">{{ riskLabel(row.risk_level) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="student.student_name" label="姓名" width="120" />
          <el-table-column prop="student.student_account" label="学号" width="150" />
          <el-table-column prop="student.class_id" label="班级" width="100" />
          <el-table-column prop="risk_type" label="类型" width="120" />
          <el-table-column label="数据" width="220">
            <template #default="{ row }">
              <span>
                {{ row.metrics?.official_score || 0 }}分 /
                有效{{ row.metrics?.meaningful_count || 0 }} /
                微分{{ row.metrics?.micro_count || 0 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="evidence" label="证据" min-width="260" />
          <el-table-column prop="suggestion" label="建议" min-width="300" />
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import teacherService from '@/services/teacherService'
import classService from '@/services/classService'
import { CLASSMAP } from '@/utils/classMap'

const loading = ref(false)
const result = ref(null)
const classRows = ref(CLASSMAP)
const query = reactive({
  grade: '',
  class_ids: [],
  max_risk_students: 12,
})

const gradeOptions = computed(() => {
  const set = new Set(classRows.value.map((item) => item.grade).filter(Boolean))
  return [...set].sort((a, b) => b - a)
})

const classOptions = computed(() => {
  if (!query.grade) return []
  return classRows.value.filter((item) => Number(item.grade) === Number(query.grade))
})

const scopeHint = computed(() => {
  if (!query.grade) return '请先选择年级'
  if (!query.class_ids.length) return `将分析 ${query.grade} 级全部班级`
  return `将分析 ${query.class_ids.length} 个班级`
})

const metricCards = computed(() => {
  const metrics = result.value?.metrics || {}
  return [
    { key: 'students', label: '学生数', value: metrics.student_count || 0, hint: result.value?.scope?.label || '当前范围' },
    { key: 'average', label: '平均分', value: metrics.average_score || 0, hint: '官方总分口径' },
    { key: 'meaningful', label: '人均有效申报', value: metrics.meaningful_per_student || 0, hint: `${metrics.meaningful_count || 0} 条有效` },
    { key: 'micro', label: '微分占比', value: percent(metrics.micro_ratio), hint: `${metrics.micro_count || 0} 条微分/参与痕迹` },
  ]
})

watch(
  () => query.grade,
  () => {
    query.class_ids = []
    result.value = null
  }
)

const loadClasses = async () => {
  try {
    const rows = await classService.getClasses()
    if (rows.length) classRows.value = rows
  } catch {
    classRows.value = CLASSMAP
  }
}

const runAnalysis = async ({ forceRefresh = false } = {}) => {
  if (!query.grade) {
    ElMessage.warning('请先选择年级')
    return
  }
  loading.value = true
  try {
    const payload = {
      grade: query.grade,
      class_ids: query.class_ids,
      max_risk_students: query.max_risk_students,
      force_refresh: forceRefresh,
    }
    const res = await teacherService.analyzeInsights(payload)
    result.value = res?.data || null
    if (result.value?.cache?.hit) {
      ElMessage.success('已读取已有画像缓存')
    } else if (result.value?.cache) {
      ElMessage.success('画像已生成并写入缓存')
    }
    if (result.value?.source !== 'llm') {
      ElMessage.warning('大模型暂不可用，已使用本地规则生成兜底分析')
    }
  } catch (error) {
    ElMessage.error(error?.message || '生成综测画像失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  query.grade = ''
  query.class_ids = []
  query.max_risk_students = 12
  result.value = null
}

const riskLabel = (value) => {
  if (value === 'high') return '高风险'
  if (value === 'medium') return '中风险'
  if (value === 'low') return '低风险'
  return '待分析'
}

const riskTagType = (value) => {
  if (value === 'high') return 'danger'
  if (value === 'medium') return 'warning'
  if (value === 'low') return 'success'
  return 'info'
}

const activityTagType = (value) => {
  if (value === '低') return 'danger'
  if (value === '高') return 'success'
  return 'warning'
}

const percent = (value) => `${Math.round(Number(value || 0) * 1000) / 10}%`

const buildModuleObservation = (item) => {
  return `平均得分${item.average_score || 0}分，人均有效申报${item.meaningful_per_student || 0}条，微分占比${percent(item.micro_ratio)}。`
}

onMounted(loadClasses)
</script>

<style scoped>
.teacher-insight-page {
  width: 100%;
  box-sizing: border-box;
}

.insight-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 24px;
  border: 1px solid #f0d8d5;
  background: linear-gradient(135deg, #fffaf5, #fff 42%, #f8fbff);
  border-radius: 8px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #9d1f1b;
  font-size: 13px;
  font-weight: 700;
}

.hero-copy {
  max-width: 780px;
  margin: 8px 0 0;
  color: #606266;
  line-height: 1.7;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin: 18px 0;
}

.scope-hint {
  color: #909399;
  font-size: 13px;
}

.summary-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1.5fr) repeat(4, minmax(130px, 0.55fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  min-height: 104px;
  padding: 18px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(31, 45, 61, 0.06);
}

.summary-card span,
.summary-card small {
  display: block;
  color: #909399;
}

.summary-card strong {
  display: block;
  margin: 8px 0;
  color: #202532;
  font-size: 20px;
  line-height: 1.5;
}

.main-summary strong {
  font-size: 16px;
  font-weight: 600;
}

.metric-card strong {
  color: #9d1f1b;
  font-size: 28px;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.8fr);
  gap: 16px;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.card-header span {
  font-weight: 700;
}

.card-header small {
  color: #909399;
}

.module-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.module-item,
.class-item {
  padding: 14px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: linear-gradient(180deg, #fff, #fffaf8);
}

.module-title,
.class-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.module-item p,
.class-item p,
.quality-card p {
  margin: 10px 0;
  color: #303133;
  line-height: 1.6;
}

.module-item small,
.class-item small {
  color: #606266;
  line-height: 1.6;
}

.module-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.module-metrics span {
  padding: 4px 8px;
  border-radius: 4px;
  background: #f5f7fa;
  color: #606266;
  font-size: 12px;
}

.quality-stat {
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: #909399;
}

.quality-stat strong {
  color: #9d1f1b;
  font-size: 34px;
}

.key-categories {
  margin-top: 14px;
}

.key-categories h4 {
  margin: 0 0 8px;
  color: #606266;
  font-size: 14px;
}

.key-categories .el-tag {
  margin: 0 8px 8px 0;
}

.class-card,
.risk-card {
  margin-bottom: 16px;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.class-focus {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 10px 0;
}

.class-focus span {
  color: #909399;
  font-size: 12px;
}

.class-focus em {
  color: #909399;
  font-style: normal;
  font-size: 12px;
}

.action-list {
  margin: 0;
  padding-left: 18px;
  color: #303133;
  line-height: 1.8;
}

@media (max-width: 1200px) {
  .summary-grid,
  .content-grid,
  .class-grid {
    grid-template-columns: 1fr;
  }

  .module-list {
    grid-template-columns: 1fr;
  }
}
</style>
