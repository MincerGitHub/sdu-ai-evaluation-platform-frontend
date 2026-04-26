<template>
  <div class="report-page">
    <header class="page-header report-header">
      <div>
        <h2>个人综测报告</h2>
        <p class="report-subtitle">{{ announcementTitle }}</p>
      </div>
      <el-button class="btn-plain" @click="goBack">返回</el-button>
    </header>

    <div v-loading="loading" class="report-body">
      <template v-if="report">
        <section class="summary-band">
          <div>
            <div class="student-name">{{ report.student?.name || '-' }}</div>
            <div class="student-meta">
              {{ report.student?.account || '-' }} · {{ report.student?.class_id || '-' }}班
            </div>
          </div>
          <div class="total-score">
            <span>官方总分</span>
            <strong>{{ scoreText(report.score_summary?.actual_score) }}</strong>
          </div>
        </section>

        <section class="report-section radar-section">
          <div class="section-title">素养雷达</div>
          <div class="radar-layout">
            <div ref="chartRef" class="radar-chart" />
            <div class="score-matrix">
              <div v-for="category in radarCategories" :key="category.key" class="score-group">
                <div class="score-group-title" :style="{ color: category.color }">
                  <span class="color-dot" :style="{ background: category.color }" />
                  {{ category.name }}
                  <strong>{{ scoreText(category.score) }}/{{ scoreText(category.max_score) }}</strong>
                </div>
                <div class="sub-score-row" v-for="item in category.submodules" :key="item.key">
                  <span>{{ item.name }}</span>
                  <span>
                    {{ scoreText(item.score) }}/{{ scoreText(item.max_score) }}
                    <template v-if="item.sub_type === 'achievement'">
                      · 含溢出 {{ scoreText(item.score_with_overflow) }}
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="report-section">
          <div class="section-title">奖项历史</div>
          <div v-if="awardHistory.length" class="timeline">
            <article v-for="item in awardHistory" :key="item.application_id" class="timeline-item">
              <div class="timeline-node" />
              <div class="timeline-content">
                <div class="timeline-date">{{ dateText(item.occurred_at) }}</div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.award_rule_name || item.award_rule?.rule_name || '-' }}</p>
                <div class="timeline-tags">
                  <span>{{ item.category_name }} · {{ item.sub_type_name }}</span>
                  <strong>{{ scoreText(item.score) }} 分</strong>
                </div>
              </div>
            </article>
          </div>
          <div v-else class="empty-panel">暂无除参与未获奖以外的奖项历史</div>
        </section>

        <section class="report-section evaluation-section">
          <div class="section-title">{{ report.evaluation?.title || '综合评价' }}</div>
          <div class="evaluation-placeholder" :class="{ generated: evaluationText }">
            {{ evaluationText || report.evaluation?.placeholder || '综合评价暂未生成' }}
          </div>
        </section>
      </template>

      <div v-else-if="!loading" class="empty-panel">暂无报告数据</div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import announcementService from '@/services/announcementService'

const route = useRoute()
const router = useRouter()
const chartRef = ref(null)
const loading = ref(false)
const report = ref(null)
let chart = null

const radarCategories = computed(() => report.value?.radar?.categories || [])
const radarIndicators = computed(() => report.value?.radar?.indicators || [])
const awardHistory = computed(() => report.value?.award_history || [])
const announcementTitle = computed(() => report.value?.announcement?.title || '公示个人报告')
const evaluationText = computed(() => (report.value?.evaluation?.content || '').trim())

const scoreText = (value) => {
  const number = Number(value || 0)
  if (!Number.isFinite(number)) return '0'
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

const dateText = (value) => {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleDateString('zh-CN')
}

const fetchReport = async () => {
  const announcementId = route.params.announcementId
  if (!announcementId) return
  loading.value = true
  try {
    const res = await announcementService.getMyReport(announcementId)
    report.value = res?.data || null
    await nextTick()
    renderChart()
  } catch (error) {
    report.value = null
    ElMessage.error(error?.message || '获取个人报告失败')
  } finally {
    loading.value = false
  }
}

const renderChart = () => {
  if (!chartRef.value || !report.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  const indicators = radarIndicators.value.map((item) => ({
    name: item.name,
    max: Number(item.max || 1),
  }))
  const categories = radarCategories.value
  const series = categories.map((category) => {
    const value = radarIndicators.value.map((indicator) => {
      const hit = category.submodules.find((item) => item.key === indicator.key)
      return hit ? Number(hit.score || 0) : 0
    })
    return {
      name: category.name,
      type: 'radar',
      symbol: 'circle',
      symbolSize: 7,
      data: [{ value, name: category.name }],
      lineStyle: { width: 3, color: category.color },
      itemStyle: { color: category.color },
      areaStyle: { color: category.color, opacity: 0.08 },
    }
  })
  chart.setOption({
    color: categories.map((item) => item.color),
    tooltip: {
      trigger: 'item',
      formatter(params) {
        const category = categories.find((item) => item.name === params.seriesName)
        if (!category) return params.seriesName
        const rows = category.submodules
          .map((item) => {
            const overflowText =
              item.sub_type === 'achievement' ? `，含溢出 ${scoreText(item.score_with_overflow)}` : ''
            return `${item.name}：${scoreText(item.score)}/${scoreText(item.max_score)}${overflowText}`
          })
          .join('<br/>')
        return `<strong>${category.name}</strong><br/>总分：${scoreText(category.score)}/${scoreText(category.max_score)}<br/>${rows}`
      },
    },
    legend: {
      bottom: 0,
      itemWidth: 12,
      itemHeight: 8,
      textStyle: { color: '#606266' },
    },
    radar: {
      indicator: indicators,
      radius: '62%',
      center: ['50%', '48%'],
      splitNumber: 4,
      axisName: {
        color: '#303133',
        fontSize: 12,
        lineHeight: 16,
      },
      axisLine: { lineStyle: { color: 'rgba(80, 80, 80, 0.18)' } },
      splitLine: { lineStyle: { color: 'rgba(80, 80, 80, 0.14)' } },
      splitArea: {
        areaStyle: {
          color: ['rgba(156, 12, 19, 0.04)', 'rgba(15, 159, 122, 0.04)'],
        },
      },
    },
    series,
  })
}

const handleResize = () => {
  chart?.resize()
}

const goBack = () => {
  router.back()
}

watch(report, async () => {
  await nextTick()
  renderChart()
})

onMounted(() => {
  fetchReport()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.report-page {
  width: 100%;
  min-height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.report-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.report-subtitle {
  margin: 6px 0 0;
  color: #606266;
  font-size: 14px;
}

.report-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-band {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
  border: 1px solid #ebeef5;
  background: linear-gradient(90deg, #fff7f7 0%, #f4fbff 52%, #f7fff9 100%);
  box-shadow: 0 6px 18px rgba(18, 32, 54, 0.06);
}

.student-name {
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
}

.student-meta {
  margin-top: 6px;
  color: #606266;
  font-size: 14px;
}

.total-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: #606266;
  font-size: 13px;
}

.total-score strong {
  color: #9c0c13;
  font-size: 34px;
  line-height: 1.1;
}

.report-section {
  padding: 18px 20px;
  border: 1px solid #ebeef5;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(18, 32, 54, 0.04);
}

.section-title {
  margin-bottom: 14px;
  color: #9c0c13;
  font-size: 18px;
  font-weight: 700;
}

.radar-layout {
  display: grid;
  grid-template-columns: minmax(320px, 1.1fr) minmax(280px, 0.9fr);
  gap: 18px;
  align-items: stretch;
}

.radar-chart {
  min-height: 420px;
}

.score-matrix {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  align-content: start;
}

.score-group {
  padding: 12px;
  border: 1px solid #ebeef5;
  background: #fbfcff;
}

.score-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 700;
}

.score-group-title strong {
  margin-left: auto;
  color: #303133;
  font-size: 13px;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.sub-score-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 5px 0;
  color: #606266;
  font-size: 13px;
}

.sub-score-row span:last-child {
  color: #303133;
  white-space: nowrap;
}

.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-left: 26px;
}

.timeline::before {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 7px;
  width: 2px;
  background: linear-gradient(180deg, #c0392b, #7c3aed, #0f9f7a, #2563eb);
  content: '';
}

.timeline-item {
  position: relative;
}

.timeline-node {
  position: absolute;
  top: 16px;
  left: -25px;
  width: 14px;
  height: 14px;
  border: 3px solid #ffffff;
  border-radius: 50%;
  background: #9c0c13;
  box-shadow: 0 0 0 2px rgba(156, 12, 19, 0.2);
}

.timeline-content {
  padding: 14px 16px;
  border: 1px solid #ebeef5;
  background: linear-gradient(90deg, #ffffff, #fbfcff);
}

.timeline-date {
  color: #909399;
  font-size: 12px;
}

.timeline-content h3 {
  margin: 4px 0 6px;
  color: #1f2937;
  font-size: 16px;
}

.timeline-content p {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
}

.timeline-tags {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  color: #606266;
  font-size: 13px;
}

.timeline-tags strong {
  color: #9c0c13;
  white-space: nowrap;
}

.evaluation-placeholder,
.empty-panel {
  padding: 22px;
  border: 1px dashed #dcdfe6;
  background: #fafafa;
  color: #909399;
  text-align: center;
}

.evaluation-placeholder.generated {
  border-style: solid;
  background: #fffdf8;
  color: #303133;
  line-height: 1.8;
  text-align: left;
  white-space: pre-wrap;
}

@media (max-width: 900px) {
  .radar-layout {
    grid-template-columns: 1fr;
  }

  .radar-chart {
    min-height: 360px;
  }

  .summary-band,
  .report-header,
  .timeline-tags {
    flex-direction: column;
    align-items: flex-start;
  }

  .total-score {
    align-items: flex-start;
  }
}
</style>
