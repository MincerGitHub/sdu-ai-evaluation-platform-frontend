<template>
  <section class="score-board">
    <div class="score-board-header">
      <h3>计分板</h3>
      <div class="score-totals">
        <span>官方总分：{{ formatScore(summary.actual_score) }}</span>
        <span>原始分：{{ formatScore(summary.raw_total_score) }}</span>
        <span>成果额外分：{{ formatScore(summary.overflow_score) }}</span>
      </div>
    </div>

    <el-table :data="rows" border stripe size="small" empty-text="暂无计分数据">
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
      <el-table-column prop="achievementOverflow" label="成果额外分" width="120" align="center">
        <template #default="{ row }">{{ formatScore(row.achievementOverflow) }}</template>
      </el-table-column>
      <el-table-column label="模块总分" width="120" align="center">
        <template #default="{ row }">{{ formatScore(row.score) }} / {{ formatScore(row.maxScore) }}</template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  scoreSummary: {
    type: Object,
    default: null,
  },
})

const summary = computed(() => props.scoreSummary || {})

const rows = computed(() => {
  const categories = Array.isArray(summary.value.categories) ? summary.value.categories : []
  return categories.map((category) => {
    const basic = findSubType(category, 'basic')
    const achievement = findSubType(category, 'achievement')
    return {
      categoryName: category.category_name || category.category || '-',
      maxScore: Number(category.max_score || 0),
      score: Number(category.score || 0),
      achievementOverflow: Number(category.achievement_overflow_score ?? category.overflow_score ?? 0),
      basic,
      achievement,
    }
  })
})

function findSubType(category, subType) {
  const item = Array.isArray(category?.sub_types)
    ? category.sub_types.find((sub) => sub?.sub_type === subType)
    : null
  return {
    score: Number(item?.score || 0),
    rawScore: Number(item?.raw_score || 0),
    maxScore: Number(item?.max_score || 0),
  }
}

function formatScore(value) {
  const number = Number(value || 0)
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
