<template>
  <div class="report-page">
    <div class="report-topbar">
      <div>
        <span class="topbar-kicker">综合测评个人报告</span>
        <strong>{{ announcementTitle }}</strong>
      </div>
      <el-button class="btn-plain" @click="goBack">返回</el-button>
    </div>

    <div ref="pageRef" class="report-scroll">
      <template v-if="!reportStarted">
        <section class="opening-section">
          <div class="opening-card">
            <span class="section-kicker">Annual Summary</span>
            <h1>你的综测报告已经抵达</h1>
            <p>
              点击开启后，我们将拾掇起你综测生活里的点点星芒，把每一次申报、每一份成绩与每段努力，穿联成一片属于你的璀璨星空。
            </p>
            <button type="button" class="open-report-button" :disabled="preparing" @click="startReport">
              {{ preparing ? preparingMessage.title : '开启你的报告' }}
            </button>
            <div v-if="preparing" class="preparing-panel">
              <div class="preparing-orbit">
                <i />
                <i />
                <i />
              </div>
              <div>
                <strong>{{ preparingMessage.title }}</strong>
                <span>{{ preparingMessage.description }}</span>
              </div>
            </div>
          </div>
        </section>
      </template>

      <template v-else-if="report">
        <nav class="section-dots" aria-label="报告章节">
          <button
            v-for="item in sectionDots"
            :key="item.key"
            type="button"
            :class="{ active: activeSection === item.key }"
            :aria-label="item.label"
            @click="scrollToSection(item.key)"
          />
        </nav>

        <section class="report-section cover-section" data-report-section="cover">
          <div class="cover-copy">
            <span class="section-kicker">{{ storyMetrics.term_label || '本次公示' }}</span>
            <h1>{{ report.student?.name || '同学' }}的综测星旅</h1>
            <p>
              {{ heroQuote }}
            </p>
            <div class="cover-tags">
              <span>{{ report.student?.account || '-' }}</span>
              <span>{{ report.student?.class_id || '-' }}班</span>
              <span>{{ generatedDate }}</span>
            </div>
          </div>
          <div class="score-planet">
            <div class="planet-ring ring-one" />
            <div class="planet-ring ring-two" />
            <div
              v-for="satellite in scoreSatellites"
              :key="satellite.key"
              class="score-satellite-track"
              :style="satellite.style"
            >
              <i />
            </div>
            <div class="planet-core">
              <span>官方总分</span>
              <strong>{{ scoreText(animatedTotal) }}</strong>
              <small>原始分 {{ scoreText(report.score_summary?.raw_total_score) }}</small>
            </div>
          </div>
        </section>

        <section class="report-section constellation-section" data-report-section="constellation">
          <div class="section-heading">
            <span class="section-kicker">Score Constellation</span>
            <h2>四个方向，组成你的学期星图</h2>
          </div>
          <div class="constellation-stage">
            <div class="star-orbit">
              <template v-if="starItems.length">
                <div class="star-system">
                  <svg class="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <line
                      v-for="line in constellationLines"
                      :key="line.key"
                      :x1="line.from.x"
                      :y1="line.from.y"
                      :x2="line.to.x"
                      :y2="line.to.y"
                    />
                  </svg>
                  <button
                    v-for="star in starItems"
                    :key="star.star_id"
                    type="button"
                    class="star-button"
                    :class="[star.shape, { active: selectedStarInfo?.star_id === star.star_id }]"
                    :style="starStyle(star)"
                    :title="`${star.title}：${scoreText(star.score)}分`"
                    :aria-label="`查看${star.title}的申报信息`"
                    @click="selectStar(star)"
                  >
                    <span />
                  </button>
                </div>
                <div class="star-center">
                  <strong>{{ starItems.length }}</strong>
                  <span>条申报</span>
                </div>
                <div class="star-legend">
                  <span><i class="legend-basic" />基础</span>
                  <span><i class="legend-achievement" />成果/突破</span>
                  <span><i class="legend-major" />高分成果</span>
                </div>
              </template>
              <div v-else class="empty-story constellation-empty">
                这里会把本次公示范围内的申报记录变成星星。现在还没有可展示的星轨。
              </div>
            </div>
            <aside class="star-detail-panel">
              <template v-if="selectedStarInfo">
                <span :style="{ color: selectedStarInfo.color }">
                  {{ selectedStarInfo.category_name }} · {{ selectedStarInfo.sub_type_name }}
                </span>
                <h3>{{ selectedStarInfo.title }}</h3>
                <dl>
                  <div>
                    <dt>评审规则</dt>
                    <dd>{{ selectedStarInfo.award_rule_name || '规则信息待补充' }}</dd>
                  </div>
                  <div>
                    <dt>得分</dt>
                    <dd>{{ scoreText(selectedStarInfo.score) }} 分</dd>
                  </div>
                  <div>
                    <dt>时间</dt>
                    <dd>{{ dateText(selectedStarInfo.occurred_at) }}</dd>
                  </div>
                </dl>
              </template>
              <template v-else>
                <span>星图详情</span>
                <h3>点击任意一颗星，查看对应申报</h3>
              </template>
              <div class="constellation-summary">
                <article v-for="category in radarCategories" :key="category.key" :style="{ '--accent': category.color }">
                  <strong>{{ scoreText(category.score) }}</strong>
                  <span>{{ category.name }}</span>
                </article>
              </div>
            </aside>
          </div>
        </section>

        <section class="report-section radar-section" data-report-section="radar">
          <div class="section-heading">
            <span class="section-kicker">Eight Signals</span>
            <h2>八个小模块，在同一张雷达里发光</h2>
          </div>
          <div class="radar-stage">
            <div ref="chartRef" class="radar-chart" />
            <div class="radar-caption">
              <div v-for="category in radarCategories" :key="category.key" class="radar-line">
                <span :style="{ background: category.color }" />
                <strong>{{ category.name }}</strong>
                <em>{{ scoreText(category.score) }}/{{ scoreText(category.max_score) }}</em>
              </div>
            </div>
          </div>
        </section>

        <section class="report-section story-section" data-report-section="story">
          <div class="section-heading">
            <span class="section-kicker">Semester Stories</span>
            <h2>把学期小故事化成漂浮星球</h2>
          </div>
          <div class="story-cosmos">
            <div class="story-nebula" aria-hidden="true" />
            <svg class="story-orbit-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M11 54 C24 18 50 15 69 31 S91 74 55 83 S18 84 11 54" />
              <path d="M18 25 C43 9 78 18 86 46 S66 90 35 80 S-2 45 18 25" />
            </svg>
            <article
              v-for="planet in storyPlanets"
              :key="planet.key"
              class="story-orb"
              :style="storyPlanetStyle(planet)"
            >
              <div class="story-orb-glow" aria-hidden="true" />
              <div class="story-orb-ring" aria-hidden="true">
                <i />
              </div>
              <div class="story-orb-body">
                <span>{{ planet.eyebrow }}</span>
                <strong>{{ planet.value }}<em>{{ planet.unit }}</em></strong>
                <h3>{{ planet.title }}</h3>
              </div>
              <div class="story-orb-cabin">
                <p>{{ planet.description }}</p>
                <blockquote v-if="planet.quote">{{ planet.quote }}</blockquote>
              </div>
            </article>
          </div>
        </section>

        <section class="report-section timeline-section" data-report-section="timeline">
          <div class="section-heading">
            <span class="section-kicker">Award Timeline</span>
            <h2>那些被时间串起来的奖项</h2>
          </div>
          <div v-if="awardHistory.length" class="timeline">
            <svg class="timeline-flow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M50 2 C18 13 18 28 50 39 S82 62 50 73 S18 88 50 98" />
            </svg>
            <article
              v-for="(item, index) in awardHistory"
              :key="item.application_id"
              class="timeline-item"
              :class="{ reverse: index % 2 === 1 }"
              :style="{ '--accent': timelineColor(item), '--delay': `${index * 70}ms` }"
            >
              <div class="timeline-date">{{ dateText(item.occurred_at) }}</div>
              <div class="timeline-card">
                <span>{{ item.category_name }} · {{ item.sub_type_name }}</span>
                <h3>{{ item.title }}</h3>
                <p>{{ item.award_rule_name || item.award_rule?.rule_name || '规则信息待补充' }}</p>
                <strong>{{ scoreText(item.score) }} 分</strong>
              </div>
            </article>
          </div>
          <div v-else class="empty-story">
            暂无除参与未获奖以外的奖项历史。新的学期，第一颗星可以从一次尝试开始。
          </div>
        </section>

        <section class="report-section letter-section" data-report-section="letter">
          <div class="letter-paper">
            <span class="section-kicker">Growth Letter</span>
            <h2>{{ report.evaluation?.title || '综合评价' }}</h2>
            <p>
              {{ evaluationText || report.evaluation?.placeholder || '综合评价正在随星图一起整理，稍后会写下一段专属鼓励。' }}
            </p>
          </div>
        </section>

        <section class="report-section ending-section" data-report-section="ending">
          <div class="ending-panel">
            <span class="section-kicker">Next Semester</span>
            <h2>新的学期，继续把自己写得更明亮</h2>
            <p>{{ endingText }}</p>
            <button type="button" class="ending-button" @click="scrollToSection('cover')">回到开头</button>
          </div>
        </section>
      </template>

      <div v-else class="empty-story full-empty">暂无报告数据</div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { RadarChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { init, use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import announcementService from '@/services/announcementService'

use([RadarChart, TooltipComponent, CanvasRenderer])

const route = useRoute()
const router = useRouter()
const pageRef = ref(null)
const chartRef = ref(null)
const report = ref(null)
const storyCopy = ref(null)
const reportStarted = ref(false)
const preparing = ref(false)
const activeSection = ref('cover')
const selectedStar = ref(null)
const animatedTotal = ref(0)
let chart = null
let observer = null
let animationFrame = 0
let preparingTimer = 0

const preparingMessages = [
  {
    title: '收集星芒中...',
    description: '正在从申报记录里拾起那些发光的瞬间。',
  },
  {
    title: '星空采光中...',
    description: '正在为你的分数、奖项与努力调校柔和的光。',
  },
  {
    title: '星图绘制中...',
    description: '正在把散落的综测足迹连成清晰的星座。',
  },
  {
    title: '串联星轨中...',
    description: '正在沿着时间顺序整理你走过的每一段轨迹。',
  },
  {
    title: '点亮星座中...',
    description: '正在让四类素养与八个小模块慢慢亮起来。',
  },
]
const preparingMessageIndex = ref(0)
const preparingMessage = computed(() => preparingMessages[preparingMessageIndex.value] || preparingMessages[0])

const sectionDots = [
  { key: 'cover', label: '封面' },
  { key: 'constellation', label: '星图' },
  { key: 'radar', label: '雷达' },
  { key: 'story', label: '故事' },
  { key: 'timeline', label: '时间线' },
  { key: 'letter', label: '评价' },
  { key: 'ending', label: '结尾' },
]

const radarCategories = computed(() => report.value?.radar?.categories || [])
const radarIndicators = computed(() => report.value?.radar?.indicators || [])
const awardHistory = computed(() => report.value?.award_history || [])
const constellationItems = computed(() => report.value?.constellation_items || [])
const starSourceItems = computed(() => {
  if (Array.isArray(constellationItems.value) && constellationItems.value.length) return constellationItems.value
  return awardHistory.value
})
const starItems = computed(() => {
  const source = starSourceItems.value.slice(0, 28)
  const categoryOrder = {
    physical_mental: 0,
    art: 1,
    labor: 2,
    innovation: 3,
  }
  return source.map((item, index) => {
    const categoryIndex = categoryOrder[item.category] ?? 0
    const angle = index * 2.399963229728653 + categoryIndex * 0.28 - Math.PI / 2
    const ring = index % 3
    const radius = 25 + ring * 9 + (index % 2) * 2
    const score = Number(item.score || 0)
    let x = 50 + Math.cos(angle) * radius
    let y = 50 + Math.sin(angle) * radius
    const dx = x - 50
    const dy = y - 50
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < 22) {
      const scale = 22 / Math.max(distance, 1)
      x = 50 + dx * scale
      y = 50 + dy * scale
    }
    const shape =
      item.sub_type === 'basic'
        ? 'shape-basic'
        : score >= 5
          ? 'shape-achievement-high'
          : score >= 2
            ? 'shape-achievement-mid'
            : 'shape-achievement-low'
    return {
      ...item,
      star_id: `${item.application_id || 'star'}-${index}`,
      x: Math.max(9, Math.min(91, x)),
      y: Math.max(9, Math.min(91, y)),
      size: Math.max(11, Math.min(24, 10 + Math.sqrt(Math.max(score, 0)) * (item.sub_type === 'basic' ? 1.9 : 2.7))),
      color: item.color || timelineColor(item),
      delay: `${(index % 9) * -0.42}s`,
      orbit_angle: angle,
      shape,
    }
  })
})
const constellationLines = computed(() => {
  const stars = [...starItems.value].sort((a, b) => a.orbit_angle - b.orbit_angle)
  if (stars.length < 2) return []
  const lines = stars.slice(1).map((star, index) => ({
    key: `${stars[index].star_id}-${star.star_id}`,
    from: stars[index],
    to: star,
  }))
  if (stars.length > 3) {
    lines.push({
      key: `${stars[stars.length - 1].star_id}-${stars[0].star_id}`,
      from: stars[stars.length - 1],
      to: stars[0],
    })
  }
  return lines
})
const selectedStarInfo = computed(() => {
  if (!starItems.value.length) return null
  if (selectedStar.value) {
    const hit = starItems.value.find((item) => item.star_id === selectedStar.value.star_id)
    if (hit) return hit
  }
  return starItems.value[0]
})
const storyMetrics = computed(() => report.value?.story_metrics || {})
const storyCards = computed(() => {
  const cards = storyCopy.value?.story_cards || report.value?.story_cards
  if (Array.isArray(cards) && cards.length) return cards
  return [
    {
      key: 'empty',
      eyebrow: '本次公示',
      title: '报告还在等待第一段故事',
      value: 0,
      unit: '条记录',
      description: '新的学期，可以从一次活动、一次比赛或一次创新尝试开始。',
      color: '#9c0c13',
    },
  ]
})
const storyPlanets = computed(() => {
  return storyCards.value.map((card, index) => {
    const numericValue = Number(card.value || 0)
    const bonusSize = Math.min(20, Math.sqrt(Math.max(numericValue, 0)) * 4.4)
    return {
      ...card,
      size: 184 + bonusSize,
      drift: index * -0.7,
      color: card.color || radarCategories.value[index % Math.max(1, radarCategories.value.length)]?.color || '#9c0c13',
    }
  })
})
const announcementTitle = computed(() => report.value?.announcement?.title || '公示个人报告')
const evaluationText = computed(() => (report.value?.evaluation?.content || '').trim())
const generatedDate = computed(() => dateText(report.value?.generated_at))
const scoreSatellites = computed(() => {
  const total = Number(report.value?.score_summary?.actual_score || 0)
  const count = total >= 80 ? 3 : total >= 45 ? 2 : total > 0 ? 1 : 0
  const colors = ['#d6a445', '#0f9f7a', '#2563eb']
  const insets = [8, 38, 68]
  return Array.from({ length: count }, (_, index) => ({
    key: `satellite-${index}`,
    style: {
      '--track-inset': `${insets[index] || 18}px`,
      '--satellite-size': `${13 + index * 2}px`,
      '--satellite-color': colors[index],
      '--duration': `${13 + index * 5}s`,
      '--delay': `${index * -2.7}s`,
    },
  }))
})
const heroQuote = computed(
  () =>
    storyCopy.value?.hero_quote ||
    `${storyMetrics.value?.term_label || '这个学期'}，你把校园里的努力写成了自己的星轨。`
)
const endingText = computed(() => {
  if (storyCopy.value?.ending_text) return storyCopy.value.ending_text
  const growth = storyMetrics.value?.growth_category?.name || '还没完全点亮的方向'
  return `${growth}会是下一段故事很好的入口。把目标放小一点，把行动做稳一点，下一次打开报告时，会看到更清晰的自己。`
})

const scoreText = (value) => {
  const number = Number(value || 0)
  if (!Number.isFinite(number)) return '0'
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

const scorePercent = (score, maxScore) => {
  const max = Number(maxScore || 0)
  if (!max) return '0%'
  return `${Math.max(0, Math.min(100, (Number(score || 0) / max) * 100))}%`
}

const dateText = (value) => {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleDateString('zh-CN')
}

const timelineColor = (item) => {
  const category = radarCategories.value.find((row) => row.key === item.category)
  return category?.color || '#9c0c13'
}

const starStyle = (star) => ({
  '--accent': star.color || '#9c0c13',
  '--size': `${star.size}px`,
  '--star-delay': star.delay || '0s',
  left: `${star.x}%`,
  top: `${star.y}%`,
})

const storyPlanetStyle = (planet) => ({
  '--accent': planet.color || '#9c0c13',
  '--orb-size': `${planet.size || 190}px`,
  '--float-delay': `${planet.drift || 0}s`,
})

const selectStar = (star) => {
  selectedStar.value = star
}

const startPreparingMessages = () => {
  if (preparingTimer) clearInterval(preparingTimer)
  preparingMessageIndex.value = 0
  preparingTimer = window.setInterval(() => {
    preparingMessageIndex.value = (preparingMessageIndex.value + 1) % preparingMessages.length
  }, 1800)
}

const stopPreparingMessages = () => {
  if (!preparingTimer) return
  clearInterval(preparingTimer)
  preparingTimer = 0
}

const startReport = async () => {
  const announcementId = route.params.announcementId
  if (!announcementId || preparing.value) return
  preparing.value = true
  startPreparingMessages()
  reportStarted.value = false
  report.value = null
  storyCopy.value = null
  try {
    const reportPromise = announcementService.getMyReport(announcementId)
    const storyPromise = announcementService.generateMyReportStoryCopy(announcementId).catch((error) => {
      console.warn('generate story copy failed, use rule based copy', error)
      return null
    })
    const [reportRes, storyRes] = await Promise.all([reportPromise, storyPromise])
    report.value = reportRes?.data || null
    if (!report.value) {
      throw new Error('暂无报告数据')
    }
    const generatedStory = storyRes?.data || null
    if (Array.isArray(generatedStory?.story_cards) && generatedStory.story_cards.length) {
      storyCopy.value = generatedStory
    }
    if (generatedStory?.evaluation) {
      report.value = {
        ...report.value,
        evaluation: generatedStory.evaluation,
      }
    }
    reportStarted.value = true
    await nextTick()
    selectedStar.value = starItems.value[0] || null
    renderChart()
    setupObserver()
    animateTotal()
  } catch (error) {
    report.value = null
    reportStarted.value = false
    ElMessage.error(error?.message || '获取个人报告失败')
  } finally {
    preparing.value = false
    stopPreparingMessages()
  }
}

const renderChart = () => {
  if (!chartRef.value || !report.value) return
  if (!chart) chart = init(chartRef.value)
  const categories = radarCategories.value
  const points = radarIndicators.value.map((indicator) => {
    const category = categories.find((item) => item.key === indicator.category)
    const submodule = category?.submodules?.find((item) => item.key === indicator.key) || {}
    const shortCategory = (category?.name || '').replace('素养', '')
    const shortSubType = (submodule.name || indicator.name || '')
      .replace('性评价', '')
      .replace('突破提升', '突破')
    return {
      ...indicator,
      ...submodule,
      category_name: category?.name || indicator.category,
      color: category?.color || submodule.color || '#9c0c13',
      axisLabel: `${shortCategory}\n${shortSubType}`,
    }
  })
  const indicators = points.map((item) => ({
    name: item.axisLabel,
    max: Number(item.max_score || item.max || 1),
  }))
  const value = points.map((item) => Number(item.score || 0))
  chart.setOption({
    color: categories.map((item) => item.color),
    tooltip: {
      trigger: 'item',
      borderWidth: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      textStyle: { color: '#1f2937' },
      formatter() {
        const rows = points
          .map((item) => {
            const overflowText =
              item.sub_type === 'achievement' && Number(item.overflow_score || 0) > 0
                ? `，含溢出后 ${scoreText(item.score_with_overflow)}`
                : ''
            return `${item.category_name} · ${item.name}：${scoreText(item.score)}/${scoreText(item.max_score)}${overflowText}`
          })
          .join('<br/>')
        return `<strong>八项得分轮廓</strong><br/>${rows}`
      },
    },
    radar: {
      indicator: indicators,
      radius: '58%',
      center: ['50%', '50%'],
      splitNumber: 4,
      axisName: {
        color: '#25324a',
        fontSize: 13,
        fontWeight: 700,
        lineHeight: 18,
      },
      axisLine: { lineStyle: { color: 'rgba(37, 50, 74, 0.18)' } },
      splitLine: { lineStyle: { color: 'rgba(37, 50, 74, 0.14)' } },
      splitArea: {
        areaStyle: {
          color: ['rgba(255,255,255,0.68)', 'rgba(238,245,255,0.78)'],
        },
      },
    },
    series: [
      {
        name: '八项得分',
        type: 'radar',
        symbol: 'circle',
        symbolSize: 10,
        data: [{ value, name: '八项得分' }],
        lineStyle: {
          width: 4,
          color: '#d6a445',
          shadowBlur: 18,
          shadowColor: 'rgba(214, 164, 69, 0.55)',
        },
        itemStyle: {
          color: '#fff7d6',
          borderColor: '#d6a445',
          borderWidth: 3,
          shadowBlur: 18,
          shadowColor: 'rgba(214, 164, 69, 0.75)',
        },
        areaStyle: {
          color: 'rgba(214, 164, 69, 0.2)',
          shadowBlur: 26,
          shadowColor: 'rgba(214, 164, 69, 0.28)',
        },
        emphasis: {
          lineStyle: { width: 5 },
          areaStyle: { color: 'rgba(214, 164, 69, 0.28)' },
        },
      },
    ],
  })
}

const animateTotal = () => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  const target = Number(report.value?.score_summary?.actual_score || 0)
  const start = performance.now()
  const duration = 900
  const tick = (now) => {
    const progress = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedTotal.value = target * eased
    if (progress < 1) {
      animationFrame = requestAnimationFrame(tick)
    } else {
      animatedTotal.value = target
      animationFrame = 0
    }
  }
  animationFrame = requestAnimationFrame(tick)
}

const setupObserver = () => {
  observer?.disconnect()
  if (!pageRef.value) return
  const sections = pageRef.value.querySelectorAll('[data-report-section]')
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        activeSection.value = entry.target.dataset.reportSection || activeSection.value
      })
    },
    { root: pageRef.value, threshold: 0.38 }
  )
  sections.forEach((section) => observer.observe(section))
}

const scrollToSection = (key) => {
  const target = pageRef.value?.querySelector(`[data-report-section="${key}"]`)
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  setupObserver()
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  stopPreparingMessages()
  observer?.disconnect()
  if (animationFrame) cancelAnimationFrame(animationFrame)
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.report-page {
  min-height: 100%;
  color: #182033;
  background:
    linear-gradient(120deg, rgba(156, 12, 19, 0.08), transparent 34%),
    linear-gradient(300deg, rgba(15, 159, 122, 0.1), transparent 38%),
    #f7f2ea;
  box-sizing: border-box;
}

.report-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 24px;
  border-bottom: 1px solid rgba(156, 12, 19, 0.14);
  background: rgba(255, 252, 245, 0.88);
  backdrop-filter: blur(16px);
}

.report-topbar div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.report-topbar strong {
  overflow: hidden;
  color: #1d2538;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-kicker,
.section-kicker {
  color: #9c0c13;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.report-scroll {
  position: relative;
  height: calc(100vh - 62px);
  overflow-y: auto;
  scroll-snap-type: y proximity;
  scroll-behavior: smooth;
}

.opening-section {
  display: grid;
  min-height: calc(100vh - 62px);
  place-items: center;
  padding: 34px;
  background:
    radial-gradient(circle at 22% 18%, rgba(156, 12, 19, 0.16), transparent 28%),
    radial-gradient(circle at 78% 72%, rgba(37, 99, 235, 0.14), transparent 28%),
    linear-gradient(120deg, rgba(255, 255, 255, 0.72), rgba(255, 250, 238, 0.82));
  box-sizing: border-box;
}

.opening-card {
  position: relative;
  width: min(760px, 100%);
  padding: 54px 48px;
  overflow: hidden;
  border: 1px solid rgba(156, 12, 19, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 28px 80px rgba(35, 45, 66, 0.14);
  text-align: center;
}

.opening-card::before {
  position: absolute;
  inset: -50% auto auto -20%;
  width: 360px;
  height: 360px;
  border: 1px solid rgba(156, 12, 19, 0.12);
  border-radius: 50%;
  content: '';
}

.opening-card h1 {
  margin: 12px 0 18px;
  color: #111827;
  font-size: 46px;
  line-height: 1.15;
}

.opening-card p {
  max-width: 560px;
  margin: 0 auto 30px;
  color: #4b5563;
  font-size: 17px;
  line-height: 1.8;
}

.open-report-button {
  position: relative;
  min-width: 168px;
  padding: 13px 24px;
  border: 0;
  border-radius: 6px;
  background: linear-gradient(135deg, #9c0c13, #d6a445);
  box-shadow: 0 16px 34px rgba(156, 12, 19, 0.22);
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
}

.open-report-button:disabled {
  cursor: wait;
  opacity: 0.82;
}

.preparing-panel {
  display: grid;
  grid-template-columns: 76px 1fr;
  gap: 16px;
  align-items: center;
  max-width: 460px;
  margin: 28px auto 0;
  padding: 14px 16px;
  border: 1px solid rgba(37, 99, 235, 0.16);
  border-radius: 8px;
  background: rgba(248, 251, 255, 0.84);
  text-align: left;
}

.preparing-panel strong {
  display: block;
  margin-bottom: 4px;
  color: #111827;
}

.preparing-panel span {
  color: #5b6475;
  font-size: 13px;
  line-height: 1.6;
}

.preparing-orbit {
  position: relative;
  width: 58px;
  height: 58px;
}

.preparing-orbit i {
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(156, 12, 19, 0.24);
  border-top-color: #9c0c13;
  border-radius: 50%;
  animation: spin 1.6s linear infinite;
}

.preparing-orbit i:nth-child(2) {
  inset: 14px;
  border-top-color: #2563eb;
  animation-duration: 1.1s;
  animation-direction: reverse;
}

.preparing-orbit i:nth-child(3) {
  inset: 23px;
  background: #d6a445;
  border: 0;
  animation: pulse-soft 1.2s ease-in-out infinite;
}

.section-dots {
  position: fixed;
  top: 50%;
  right: 22px;
  z-index: 18;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transform: translateY(-50%);
}

.section-dots button {
  width: 9px;
  height: 9px;
  padding: 0;
  border: 1px solid rgba(29, 37, 56, 0.22);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.78);
  cursor: pointer;
}

.section-dots button.active {
  height: 28px;
  border-radius: 999px;
  background: #9c0c13;
}

.report-section {
  position: relative;
  min-height: calc(100vh - 62px);
  padding: 56px 72px;
  scroll-snap-align: start;
  box-sizing: border-box;
  opacity: 1;
  transform: none;
  transition: background 0.7s ease;
}

.report-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.cover-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 430px;
  gap: 44px;
  align-items: center;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.76), rgba(255, 255, 255, 0.38)),
    repeating-linear-gradient(135deg, rgba(156, 12, 19, 0.08) 0 1px, transparent 1px 18px);
}

.cover-copy h1 {
  max-width: 720px;
  margin: 12px 0 18px;
  color: #111827;
  font-size: 56px;
  line-height: 1.08;
}

.cover-copy p {
  max-width: 620px;
  margin: 0;
  color: #4b5563;
  font-size: 18px;
  line-height: 1.8;
}

.cover-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 30px;
}

.cover-tags span {
  padding: 8px 12px;
  border: 1px solid rgba(156, 12, 19, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  color: #374151;
  font-size: 13px;
}

.score-planet {
  position: relative;
  display: grid;
  width: 360px;
  height: 360px;
  place-items: center;
  justify-self: center;
}

.planet-ring,
.planet-core {
  position: absolute;
  border-radius: 50%;
}

.planet-ring {
  border: 1px solid rgba(156, 12, 19, 0.28);
}

.ring-one {
  inset: 18px;
  animation: rotate-slow 18s linear infinite;
}

.ring-two {
  inset: 58px;
  border-color: rgba(15, 159, 122, 0.28);
  animation: rotate-slow 14s linear infinite reverse;
}

.score-satellite-track {
  position: absolute;
  inset: var(--track-inset);
  border: 1px dashed rgba(29, 37, 56, 0.16);
  border-radius: 50%;
  animation: satellite-rotate var(--duration) linear infinite;
  animation-delay: var(--delay);
}

.score-satellite-track i {
  position: absolute;
  top: calc(var(--satellite-size) / -2);
  left: 50%;
  width: var(--satellite-size);
  height: var(--satellite-size);
  border: 2px solid rgba(255, 255, 255, 0.86);
  border-radius: 50%;
  background: var(--satellite-color);
  box-shadow: 0 0 16px color-mix(in srgb, var(--satellite-color) 45%, transparent);
  transform: translateX(-50%);
}

.planet-core {
  inset: 112px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: linear-gradient(160deg, #9c0c13, #d6a445 58%, #0f9f7a);
  box-shadow: 0 20px 50px rgba(80, 31, 31, 0.25);
  color: #fff;
  text-align: center;
}

.planet-core span,
.planet-core small {
  font-size: 13px;
  opacity: 0.9;
}

.planet-core strong {
  margin: 8px 0 4px;
  font-size: 48px;
  line-height: 1;
}

.section-heading {
  max-width: 760px;
  margin-bottom: 28px;
}

.section-heading h2 {
  margin: 8px 0 0;
  color: #111827;
  font-size: 34px;
  line-height: 1.2;
}

.constellation-section,
.story-section {
  background: linear-gradient(180deg, rgba(255, 252, 245, 0.92), rgba(238, 248, 245, 0.9));
}

.story-section {
  display: flex;
  height: auto;
  min-height: auto;
  flex-direction: column;
  overflow: visible;
  scroll-snap-align: none;
}

.story-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.star-detail-panel,
.story-card,
.timeline-card,
.letter-paper,
.ending-panel {
  border: 1px solid rgba(29, 37, 56, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 42px rgba(35, 45, 66, 0.08);
}

.constellation-stage {
  display: grid;
  grid-template-columns: minmax(440px, 1fr) minmax(290px, 360px);
  gap: 26px;
  align-items: center;
}

.star-orbit {
  position: relative;
  min-height: 540px;
  overflow: hidden;
  border: 1px solid rgba(214, 164, 69, 0.18);
  border-radius: 8px;
  background:
    radial-gradient(circle at 30% 24%, rgba(214, 164, 69, 0.18), transparent 28%),
    radial-gradient(circle at 74% 70%, rgba(37, 99, 235, 0.18), transparent 30%),
    linear-gradient(145deg, #0d1420, #172033 52%, #0b0f18);
  box-shadow: inset 0 0 96px rgba(0, 0, 0, 0.45), 0 18px 42px rgba(35, 45, 66, 0.12);
}

.star-orbit::before,
.star-orbit::after {
  position: absolute;
  left: 50%;
  top: 50%;
  border: 1px dashed rgba(214, 164, 69, 0.22);
  border-radius: 50%;
  content: '';
  pointer-events: none;
  transform: translate(-50%, -50%) scaleY(0.64);
}

.star-orbit::before {
  width: 56%;
  height: 56%;
}

.star-orbit::after {
  width: 80%;
  height: 80%;
}

.star-system {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  width: min(92%, 560px);
  aspect-ratio: 1;
  transform-origin: center;
  transform: translate(-50%, -50%);
  animation: constellation-rotate 84s linear infinite;
}

.constellation-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.constellation-lines line {
  stroke: rgba(214, 164, 69, 0.58);
  stroke-dasharray: 2 7;
  stroke-linecap: round;
  stroke-width: 0.42;
  vector-effect: non-scaling-stroke;
}

.star-button {
  position: absolute;
  z-index: 3;
  width: var(--size);
  height: var(--size);
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform: translate(-50%, -50%);
  animation: star-breathe 4.6s ease-in-out infinite;
  animation-delay: var(--star-delay);
}

.star-button span {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--accent);
  filter: drop-shadow(0 0 9px color-mix(in srgb, var(--accent) 58%, transparent));
  transition: transform 0.25s ease, filter 0.25s ease;
}

.star-button:hover span,
.star-button.active span {
  filter: drop-shadow(0 0 14px color-mix(in srgb, var(--accent) 72%, transparent));
  transform: scale(1.22);
}

.star-button.active::after {
  position: absolute;
  inset: -9px;
  border: 1px solid color-mix(in srgb, var(--accent) 52%, transparent);
  border-radius: 50%;
  content: '';
}

.shape-basic span {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  background:
    radial-gradient(circle at 34% 28%, rgba(255, 255, 255, 0.82), transparent 18%),
    linear-gradient(135deg, color-mix(in srgb, var(--accent) 68%, white), var(--accent));
}

.shape-basic:hover span,
.shape-basic.active span {
  transform: scale(1.24);
}

.shape-achievement-low span {
  border-radius: 50%;
}

.shape-achievement-mid span {
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 56%, 79% 91%, 50% 70%, 21% 91%, 32% 56%, 2% 35%, 39% 35%);
}

.shape-achievement-high span {
  clip-path: polygon(
    50% 0%,
    59% 29%,
    86% 14%,
    72% 42%,
    100% 50%,
    72% 58%,
    86% 86%,
    59% 71%,
    50% 100%,
    41% 71%,
    14% 86%,
    28% 58%,
    0% 50%,
    28% 42%,
    14% 14%,
    41% 29%
  );
}

.star-center {
  position: absolute;
  left: 18px;
  top: 16px;
  z-index: 4;
  display: flex;
  width: auto;
  height: auto;
  min-width: 104px;
  gap: 8px;
  align-items: baseline;
  justify-content: center;
  padding: 10px 14px;
  place-items: center;
  border: 1px solid rgba(214, 164, 69, 0.34);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22);
  color: #f8fafc;
  pointer-events: none;
  text-align: center;
  transform: none;
}

.star-center strong {
  margin: 0;
  color: #d6a445;
  font-size: 26px;
  line-height: 1;
}

.star-center span {
  margin: 0;
  color: rgba(248, 250, 252, 0.72);
  font-size: 13px;
}

.star-legend {
  position: absolute;
  right: 16px;
  bottom: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: rgba(248, 250, 252, 0.76);
  font-size: 12px;
}

.star-legend span {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.star-legend i {
  width: 12px;
  height: 12px;
  background: #9c0c13;
}

.star-legend .legend-basic {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

.star-legend .legend-achievement {
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 56%, 79% 91%, 50% 70%, 21% 91%, 32% 56%, 2% 35%, 39% 35%);
}

.star-legend .legend-major {
  background: #d6a445;
  clip-path: polygon(50% 0%, 59% 29%, 86% 14%, 72% 42%, 100% 50%, 72% 58%, 86% 86%, 59% 71%, 50% 100%, 41% 71%, 14% 86%, 28% 58%, 0% 50%, 28% 42%, 14% 14%, 41% 29%);
}

.star-detail-panel {
  padding: 24px;
}

.star-detail-panel > span {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 800;
}

.star-detail-panel h3 {
  margin: 0 0 20px;
  color: #111827;
  font-size: 24px;
  line-height: 1.35;
}

.star-detail-panel dl {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
}

.star-detail-panel dl div {
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(29, 37, 56, 0.09);
}

.star-detail-panel dt {
  color: #8a94a6;
  font-size: 12px;
  font-weight: 800;
}

.star-detail-panel dd {
  margin: 6px 0 0;
  color: #111827;
  line-height: 1.65;
}

.constellation-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 24px;
}

.constellation-summary article {
  padding: 12px;
  border-left: 3px solid var(--accent);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.76);
}

.constellation-summary strong {
  display: block;
  color: var(--accent);
  font-size: 24px;
}

.constellation-summary span {
  color: #5b6475;
  font-size: 12px;
}

.constellation-empty {
  position: absolute;
  left: 34px;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
}

.radar-section {
  background:
    linear-gradient(120deg, rgba(37, 99, 235, 0.08), transparent 42%),
    linear-gradient(300deg, rgba(214, 164, 69, 0.12), transparent 42%),
    #f8fbff;
}

.radar-stage {
  position: relative;
  display: grid;
  grid-template-columns: minmax(360px, 1fr) 260px;
  gap: 28px;
  align-items: center;
}

.radar-stage::before {
  position: absolute;
  left: 7%;
  top: 8%;
  width: 54%;
  height: 80%;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(214, 164, 69, 0.18), transparent 64%),
    radial-gradient(circle at 62% 42%, rgba(37, 99, 235, 0.12), transparent 58%);
  content: '';
  pointer-events: none;
  animation: radar-glow-breathe 4.8s ease-in-out infinite;
  filter: blur(4px);
}

.radar-chart {
  position: relative;
  z-index: 1;
  min-height: 510px;
  animation: radar-panel-breathe 5.6s ease-in-out infinite;
}

.radar-caption {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radar-line {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid rgba(29, 37, 56, 0.1);
  color: #374151;
}

.radar-line span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.radar-line em {
  color: #111827;
  font-style: normal;
  font-weight: 700;
}

.story-cosmos {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: clamp(28px, 4vw, 54px);
  align-content: start;
  justify-items: center;
  flex: 0 0 auto;
  min-height: auto;
  margin-top: 20px;
  padding: clamp(20px, 3vw, 42px) clamp(18px, 3vw, 44px) clamp(54px, 7vw, 84px);
  overflow: visible;
  border: 0;
  border-radius: 0;
  background:
    radial-gradient(circle at 20% 24%, rgba(156, 12, 19, 0.16), transparent 24%),
    radial-gradient(circle at 80% 28%, rgba(37, 99, 235, 0.14), transparent 22%),
    radial-gradient(circle at 58% 78%, rgba(214, 164, 69, 0.18), transparent 26%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.82), rgba(242, 247, 255, 0.72));
  box-shadow: inset 0 0 110px rgba(37, 50, 74, 0.06), 0 24px 70px rgba(35, 45, 66, 0.1);
}

.story-nebula {
  position: absolute;
  inset: 0;
  background:
    repeating-radial-gradient(circle at 18% 20%, rgba(156, 12, 19, 0.12) 0 1px, transparent 1px 34px),
    repeating-radial-gradient(circle at 76% 72%, rgba(37, 99, 235, 0.12) 0 1px, transparent 1px 42px);
  opacity: 0.42;
  pointer-events: none;
}

.story-orbit-lines {
  position: absolute;
  inset: 7%;
  width: 86%;
  height: 86%;
  pointer-events: none;
}

.story-orbit-lines path {
  fill: none;
  stroke: rgba(37, 50, 74, 0.13);
  stroke-dasharray: 2 6;
  stroke-linecap: round;
  stroke-width: 0.35;
  vector-effect: non-scaling-stroke;
}

.story-orb {
  position: relative;
  display: flex;
  width: min(100%, 286px);
  max-width: 100%;
  aspect-ratio: 1;
  min-height: 0;
  flex-direction: column;
  justify-content: center;
  padding: 30px;
  border: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 31% 23%, rgba(255, 255, 255, 0.95), transparent 17%),
    radial-gradient(circle at 66% 76%, color-mix(in srgb, var(--accent) 32%, transparent), transparent 38%),
    linear-gradient(145deg, color-mix(in srgb, var(--accent) 38%, white), var(--accent));
  box-shadow:
    inset -34px -38px 58px rgba(29, 37, 56, 0.22),
    inset 18px 18px 30px rgba(255, 255, 255, 0.38),
    0 28px 70px color-mix(in srgb, var(--accent) 26%, transparent);
  text-align: center;
  animation: story-orb-drift 6.4s ease-in-out infinite;
  animation-delay: var(--float-delay);
  box-sizing: border-box;
  overflow: visible;
}

.story-orb:nth-of-type(odd) {
  animation-name: story-orb-drift-alt;
}

.story-orb-glow {
  position: absolute;
  inset: -26px;
  border-radius: 50%;
  background:
    radial-gradient(circle, color-mix(in srgb, var(--accent) 20%, transparent), transparent 58%);
  opacity: 0.72;
  pointer-events: none;
}

.story-orb-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 112%;
  height: 38%;
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%) rotate(-15deg);
}

.story-orb-ring i {
  position: absolute;
  right: 11%;
  top: 9%;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 18px color-mix(in srgb, var(--accent) 68%, transparent);
}

.story-orb-body {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  box-sizing: border-box;
  text-shadow: 0 1px 16px rgba(255, 255, 255, 0.52);
}

.story-orb span {
  color: rgba(17, 24, 39, 0.68);
  font-size: 12px;
  font-weight: 800;
}

.story-orb strong {
  display: block;
  margin: 8px 0 8px;
  color: #111827;
  font-size: 44px;
  line-height: 1;
}

.story-orb strong em {
  margin-left: 4px;
  color: #687386;
  font-size: 13px;
  font-style: normal;
}

.story-orb h3 {
  display: -webkit-box;
  overflow: hidden;
  margin: 0 auto;
  max-width: 82%;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: #111827;
  font-size: 18px;
  line-height: 1.25;
}

.story-orb-cabin {
  position: absolute;
  left: 50%;
  top: calc(100% - 26px);
  z-index: 6;
  width: min(300px, 112%);
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.68);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 22px 52px rgba(35, 45, 66, 0.18);
  opacity: 0;
  pointer-events: none;
  text-align: left;
  transform: translate(-50%, 10px) scale(0.98);
  transition: opacity 0.26s ease, transform 0.26s ease;
  backdrop-filter: blur(14px);
}

.story-orb:hover .story-orb-cabin,
.story-orb:focus-within .story-orb-cabin {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

.story-orb-cabin p {
  margin: 0;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.55;
}

.story-orb-cabin blockquote {
  margin: 8px 0 0;
  color: #1f2937;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.45;
}

.story-card {
  position: relative;
  min-height: 260px;
  padding: 20px;
  overflow: hidden;
  border-left: 4px solid var(--accent);
  transform: translateY(10px);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.story-card:hover {
  box-shadow: 0 24px 56px rgba(35, 45, 66, 0.13);
  transform: translateY(0);
}

.story-planet {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 72px;
  height: 72px;
  border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent);
  border-radius: 50%;
  opacity: 0.9;
  animation: story-float 5.4s ease-in-out infinite;
  animation-delay: var(--float-delay);
}

.story-planet::before,
.story-planet::after {
  position: absolute;
  border-radius: 50%;
  content: '';
}

.story-planet::before {
  inset: 16px;
  border: 1px dashed color-mix(in srgb, var(--accent) 32%, transparent);
}

.story-planet::after {
  width: 9px;
  height: 9px;
  top: 3px;
  left: 50%;
  background: var(--accent);
  box-shadow: 0 0 14px color-mix(in srgb, var(--accent) 60%, transparent);
  transform: translateX(-50%);
}

.story-planet i {
  position: absolute;
  inset: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 88%, white), var(--accent));
  box-shadow: inset -4px -6px 10px rgba(29, 37, 56, 0.18);
}

.story-card span {
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
}

.story-card h3 {
  min-height: 62px;
  margin: 10px 0 16px;
  color: #111827;
  font-size: 22px;
  line-height: 1.35;
}

.story-value {
  position: relative;
  width: fit-content;
  min-width: 112px;
  min-height: 78px;
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 8%, white);
  box-shadow: 0 16px 28px color-mix(in srgb, var(--accent) 10%, transparent);
}

.story-value strong {
  color: var(--accent);
  font-size: 42px;
  line-height: 1;
}

.story-value em {
  color: #6b7280;
  font-style: normal;
}

.story-card blockquote {
  margin: 0 0 12px;
  padding-left: 12px;
  border-left: 3px solid var(--accent);
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.6;
}

.story-card p {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.75;
}

.timeline-section {
  min-height: auto;
  scroll-snap-align: none;
  background:
    radial-gradient(circle at 20% 12%, rgba(214, 164, 69, 0.16), transparent 24%),
    radial-gradient(circle at 80% 86%, rgba(37, 99, 235, 0.12), transparent 28%),
    linear-gradient(180deg, #fffaf2, #f7fbff);
}

.timeline {
  position: relative;
  display: grid;
  gap: 34px;
  max-width: 1040px;
  margin: 0 auto;
  padding: 20px 0 18px;
}

.timeline-flow {
  position: absolute;
  inset: 0 44% 0 44%;
  width: 12%;
  height: 100%;
  pointer-events: none;
}

.timeline-flow path {
  fill: none;
  stroke: rgba(214, 164, 69, 0.72);
  stroke-dasharray: 3 9;
  stroke-linecap: round;
  stroke-width: 2.6;
  vector-effect: non-scaling-stroke;
  animation: timeline-drift 12s linear infinite;
}

.timeline-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 90px minmax(0, 1fr);
  gap: 22px;
  align-items: center;
  animation: timeline-item-float 5.8s ease-in-out infinite, float-in 0.5s ease both;
  animation-delay: var(--delay);
}

.timeline-item::before {
  grid-column: 2;
  justify-self: center;
  width: 20px;
  height: 20px;
  border: 4px solid #fff;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff, #d6a445 34%, var(--accent));
  box-shadow:
    0 0 0 7px rgba(214, 164, 69, 0.16),
    0 0 28px color-mix(in srgb, var(--accent) 42%, transparent);
  content: '';
  animation: timeline-node-breathe 3.8s ease-in-out infinite;
  animation-delay: var(--delay);
}

.timeline-date {
  grid-column: 1;
  color: #6b7280;
  font-weight: 700;
  text-align: right;
}

.timeline-item.reverse .timeline-date {
  grid-column: 3;
  grid-row: 1;
  text-align: left;
}

.timeline-card {
  position: relative;
  grid-column: 3;
  padding: 18px 20px;
  transform: translateY(0);
  transition: transform 0.28s ease, box-shadow 0.28s ease;
  backdrop-filter: blur(10px);
}

.timeline-card:hover {
  box-shadow: 0 26px 62px rgba(35, 45, 66, 0.14);
  transform: translateY(-6px);
}

.timeline-item.reverse .timeline-card {
  grid-column: 1;
  grid-row: 1;
}

.timeline-card::before {
  position: absolute;
  top: 26px;
  left: -18px;
  width: 34px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent));
  content: '';
}

.timeline-item.reverse .timeline-card::before {
  right: -18px;
  left: auto;
  background: linear-gradient(90deg, var(--accent), transparent);
}

.timeline-card::after {
  position: absolute;
  right: 18px;
  bottom: 16px;
  width: 38px;
  height: 38px;
  border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
  border-radius: 50%;
  content: '';
  opacity: 0.72;
}

.timeline-card span {
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
}

.timeline-card h3 {
  margin: 8px 0;
  color: #111827;
  font-size: 20px;
}

.timeline-card p {
  margin: 0 0 12px;
  color: #4b5563;
  line-height: 1.6;
}

.timeline-card strong {
  color: #9c0c13;
}

.letter-section {
  min-height: auto;
  scroll-snap-align: none;
  display: grid;
  place-items: center;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.3), transparent),
    repeating-linear-gradient(0deg, rgba(29, 37, 56, 0.06) 0 1px, transparent 1px 32px),
    #fffdf8;
}

.letter-paper {
  max-width: 820px;
  padding: 46px 52px;
}

.letter-paper h2 {
  margin: 10px 0 22px;
  color: #111827;
  font-size: 34px;
}

.letter-paper p {
  margin: 0;
  color: #374151;
  font-size: 18px;
  line-height: 2;
  white-space: pre-wrap;
}

.ending-section {
  min-height: auto;
  scroll-snap-align: none;
  display: grid;
  place-items: center;
  background:
    linear-gradient(130deg, rgba(156, 12, 19, 0.1), transparent 35%),
    linear-gradient(300deg, rgba(37, 99, 235, 0.12), transparent 36%),
    #f5fbf7;
}

.ending-panel {
  max-width: 760px;
  padding: 42px;
  text-align: center;
}

.ending-panel h2 {
  margin: 10px 0 16px;
  color: #111827;
  font-size: 38px;
}

.ending-panel p {
  margin: 0 auto 26px;
  max-width: 620px;
  color: #4b5563;
  font-size: 17px;
  line-height: 1.8;
}

.ending-button {
  padding: 10px 20px;
  border: 0;
  border-radius: 6px;
  background: #9c0c13;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
}

.empty-story {
  padding: 28px;
  border: 1px dashed rgba(29, 37, 56, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  color: #6b7280;
  text-align: center;
}

.full-empty {
  margin: 48px;
}

@keyframes rotate-slow {
  from {
    transform: rotate(0deg) scaleX(1.18);
  }
  to {
    transform: rotate(360deg) scaleX(1.18);
  }
}

@keyframes satellite-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes constellation-rotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes star-breathe {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.08);
  }
}

@keyframes story-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  50% {
    transform: translate3d(-8px, 7px, 0) rotate(8deg);
  }
}

@keyframes story-orb-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(10px, -12px, 0);
  }
}

@keyframes story-orb-drift-alt {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-10px, 11px, 0);
  }
}

@keyframes timeline-drift {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: -90;
  }
}

@keyframes timeline-node-breathe {
  0%,
  100% {
    box-shadow:
      0 0 0 7px rgba(214, 164, 69, 0.14),
      0 0 22px color-mix(in srgb, var(--accent) 34%, transparent);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 0 0 12px rgba(214, 164, 69, 0.08),
      0 0 38px color-mix(in srgb, var(--accent) 55%, transparent);
    transform: scale(1.13);
  }
}

@keyframes timeline-item-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes radar-glow-breathe {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.96);
  }
  50% {
    opacity: 1;
    transform: scale(1.06);
  }
}

@keyframes radar-panel-breathe {
  0%,
  100% {
    filter: drop-shadow(0 0 0 rgba(214, 164, 69, 0));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(214, 164, 69, 0.18));
  }
}

@keyframes float-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-soft {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.82);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 1180px) {
  .report-section {
    padding: 44px 36px;
  }

  .cover-section,
  .constellation-stage,
  .radar-stage {
    grid-template-columns: 1fr;
  }

  .score-planet {
    width: 300px;
    height: 300px;
  }

  .story-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .story-orb {
    width: min(100%, 280px);
  }

  .star-detail-panel {
    align-self: stretch;
  }
}

@media (max-width: 720px) {
  .report-topbar {
    padding: 12px 14px;
  }

  .report-topbar strong {
    max-width: 210px;
    font-size: 14px;
  }

  .report-scroll {
    height: calc(100vh - 58px);
    scroll-snap-type: none;
  }

  .section-dots {
    display: none;
  }

  .report-section {
    min-height: auto;
    padding: 34px 16px;
  }

  .opening-section {
    padding: 18px;
  }

  .opening-card {
    padding: 38px 22px;
  }

  .opening-card h1 {
    font-size: 32px;
  }

  .preparing-panel {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .preparing-orbit {
    margin: 0 auto;
  }

  .cover-copy h1 {
    font-size: 34px;
  }

  .cover-copy p,
  .letter-paper p,
  .ending-panel p {
    font-size: 15px;
  }

  .score-planet {
    width: 250px;
    height: 250px;
  }

  .planet-core {
    inset: 86px;
  }

  .planet-core strong {
    font-size: 34px;
  }

  .section-heading h2,
  .letter-paper h2,
  .ending-panel h2 {
    font-size: 26px;
  }

  .story-grid {
    grid-template-columns: 1fr;
  }

  .story-cosmos {
    min-height: auto;
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }

  .story-orbit-lines,
  .story-nebula {
    display: none;
  }

  .story-orb {
    width: 100%;
    max-width: 310px;
    min-height: 280px;
    justify-self: center;
    animation: none;
  }

  .star-orbit {
    min-height: 420px;
  }

  .star-system {
    width: min(92%, 380px);
  }

  .star-center {
    min-width: 86px;
    padding: 8px 10px;
  }

  .star-center strong {
    font-size: 22px;
  }

  .star-legend {
    left: 12px;
    right: 12px;
    justify-content: center;
  }

  .constellation-summary {
    grid-template-columns: 1fr;
  }

  .radar-chart {
    min-height: 360px;
  }

  .timeline {
    gap: 18px;
    padding-left: 10px;
  }

  .timeline-item {
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
  }

  .timeline-flow {
    inset: 0 auto 0 6px;
    width: 28px;
  }

  .timeline-item::before {
    grid-column: 1;
    margin-top: 10px;
    width: 15px;
    height: 15px;
  }

  .timeline-date {
    grid-column: 2;
    grid-row: 1;
    padding-top: 0;
    text-align: left;
  }

  .timeline-card,
  .timeline-item.reverse .timeline-card {
    grid-column: 2;
    grid-row: 2;
  }

  .timeline-item.reverse .timeline-date {
    grid-column: 2;
    text-align: left;
  }

  .timeline-card::before {
    display: none;
  }

  .letter-paper,
  .ending-panel {
    padding: 28px 20px;
  }
}
</style>
