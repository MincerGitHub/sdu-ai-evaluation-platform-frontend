<template>
  <section class="score-board">
    <div class="score-board-header">
      <h3>计分板</h3>
      <div class="score-totals">
        <span>官方总分：{{ formatScore(summary.actual_score) }}</span>
        <span>原始分：{{ formatScore(summary.raw_total_score) }}</span>
        <span>成果/突破额外分：{{ formatScore(summary.overflow_score) }}</span>
      </div>
    </div>

    <el-table :data="rows" border stripe size="small">
      <el-table-column prop="categoryName" label="模块" min-width="110" />
      <el-table-column label="基础" min-width="130" align="center">
        <template #default="{ row }">
          {{ formatScore(row.basic.score) }} / {{ formatScore(row.basic.maxScore) }}
          <span class="raw-score">原始 {{ formatScore(row.basic.rawScore) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成果/突破" min-width="140" align="center">
        <template #default="{ row }">
          {{ formatScore(row.achievement.score) }} / {{ formatScore(row.achievement.maxScore) }}
          <span class="raw-score">原始 {{ formatScore(row.achievement.rawScore) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="achievementOverflow" label="成果/突破额外分" width="140" align="center">
        <template #default="{ row }">{{ formatScore(row.achievementOverflow) }}</template>
      </el-table-column>
      <el-table-column label="成果/突破+额外" width="150" align="center">
        <template #default="{ row }">{{ formatScore(row.achievementWithOverflow) }}</template>
      </el-table-column>
      <el-table-column label="模块总分" width="120" align="center">
        <template #default="{ row }">{{ formatScore(row.score) }} / {{ formatScore(row.maxScore) }}</template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { SCORE_CATEGORY_META } from '@/utils/constants'

const CATEGORY_KEYS = ['physical_mental', 'art', 'labor', 'innovation']

const props = defineProps({
  scoreSummary: {
    type: Object,
    default: null,
  },
})

const summary = computed(() => props.scoreSummary || {})

const rows = computed(() => {
  const categories = Array.isArray(summary.value.categories) ? summary.value.categories : []
  const categoriesByKey = new Map(categories.map((category) => [category?.category, category]))
  return CATEGORY_KEYS.map((categoryKey) => buildRow(categoryKey, categoriesByKey.get(categoryKey)))
})

function buildRow(categoryKey, category) {
  const meta = SCORE_CATEGORY_META[categoryKey] || {}
  const basic = findSubType(category, 'basic', meta.basicMaxScore)
  const achievement = findSubType(category, 'achievement', meta.achievementMaxScore)
  const fallback = buildFallbackFromSummary(categoryKey, meta)
  const achievementOverflow = toNumber(
    category?.achievement_overflow_score ?? category?.overflow_score ?? achievement.overflowScore ?? fallback.achievementOverflow,
  )
  const achievementScore = category ? achievement.score : fallback.achievement.score

  return {
    categoryKey,
    categoryName: category?.category_name || meta.label || categoryKey,
    maxScore: toNumber(category?.max_score ?? meta.maxScore),
    score: toNumber(category?.score ?? fallback.score),
    achievementOverflow,
    achievementWithOverflow: achievementScore + achievementOverflow,
    basic: category ? basic : fallback.basic,
    achievement: category ? achievement : fallback.achievement,
  }
}

function buildFallbackFromSummary(categoryKey, meta) {
  const subScores = summary.value.sub_scores || {}
  const categoryScores = summary.value.category_scores || {}
  const overflowScores = summary.value.achievement_overflow_scores || {}
  const basicScore = toNumber(subScores[`${categoryKey}_basic`])
  const achievementScore = toNumber(subScores[`${categoryKey}_achievement`])
  const achievementOverflow = toNumber(overflowScores[`${categoryKey}_achievement_overflow`])

  return {
    score: toNumber(categoryScores[`${categoryKey}_score`]),
    achievementOverflow,
    basic: {
      score: basicScore,
      rawScore: basicScore,
      maxScore: toNumber(meta.basicMaxScore),
      overflowScore: 0,
    },
    achievement: {
      score: achievementScore,
      rawScore: achievementScore + achievementOverflow,
      maxScore: toNumber(meta.achievementMaxScore),
      overflowScore: achievementOverflow,
    },
  }
}

function findSubType(category, subType, fallbackMaxScore = 0) {
  const item = Array.isArray(category?.sub_types)
    ? category.sub_types.find((sub) => sub?.sub_type === subType)
    : null
  return {
    score: toNumber(item?.score),
    rawScore: toNumber(item?.raw_score ?? item?.score),
    maxScore: toNumber(item?.max_score ?? fallbackMaxScore),
    overflowScore: toNumber(item?.overflow_score),
  }
}

function toNumber(value) {
  return Number(value || 0)
}

function formatScore(value) {
  const number = toNumber(value)
  return Number.isInteger(number) ? String(number) : number.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
}
</script>

<style scoped>
.score-board {
  margin-top: 16px;
}

.score-board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.score-board-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.score-totals {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #606266;
  font-size: 13px;
}

.raw-score {
  display: block;
  margin-top: 2px;
  color: #909399;
  font-size: 12px;
}
</style>
