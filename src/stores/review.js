import { defineStore } from 'pinia'
import { ref } from 'vue'
import reviewService from '@/services/reviewService'

export const useReviewStore = defineStore('review', () => {
  const pendingList = ref([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const categorySummary = ref([])
  const pendingCount = ref(0)

  const currentCategory = ref('')
  const currentSubType = ref('')
  const currentClassId = ref(null)

  function buildBaseParams(extra = {}, { includeCategory = false } = {}) {
    const params = { ...extra }
    if (currentClassId.value) params.class_id = currentClassId.value
    if (includeCategory) {
      if (currentCategory.value) params.category = currentCategory.value
      if (currentSubType.value) params.sub_type = currentSubType.value
    }
    return params
  }

  function setCategory(category, subType) {
    currentCategory.value = category || ''
    currentSubType.value = subType || ''
  }

  function setClassId(classId) {
    currentClassId.value = classId || null
  }

  async function fetchPendingByCategory() {
    loading.value = true
    error.value = null
    try {
      const params = buildBaseParams(
        {
          category: currentCategory.value,
          sub_type: currentSubType.value,
        },
        { includeCategory: false }
      )
      const res = await reviewService.getPendingByCategory(params)
      const data = res.data ?? {}
      pendingList.value = data.list ?? []
      total.value = data.total ?? pendingList.value.length
    } catch (err) {
      error.value = err.message || '获取待审核列表失败'
    } finally {
      loading.value = false
    }
  }

  async function fetchCategorySummary() {
    loading.value = true
    error.value = null
    try {
      const params = buildBaseParams()
      const res = await reviewService.getCategorySummary(params)
      const data = res.data ?? {}
      categorySummary.value = data.categories ?? []
    } catch (err) {
      error.value = err.message || '获取分类汇总失败'
    } finally {
      loading.value = false
    }
  }

  async function fetchPendingCount() {
    try {
      const params = buildBaseParams({}, { includeCategory: true })
      const res = await reviewService.getPendingCount(params)
      pendingCount.value = Number(res.data?.pending_count ?? 0)
    } catch {
      pendingCount.value = 0
    }
  }

  async function fetchDetail(applicationId) {
    loading.value = true
    error.value = null
    try {
      const res = await reviewService.getReviewDetail(applicationId)
      return { success: true, data: res.data || {} }
    } catch (err) {
      error.value = err.message || '获取详情失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function submitDecision(applicationId, payload) {
    loading.value = true
    error.value = null
    try {
      const res = await reviewService.submitDecision(applicationId, payload)
      await fetchPendingByCategory()
      await fetchPendingCount()
      return { success: true, data: res.data }
    } catch (err) {
      error.value = err.message || '审核提交失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function batchDecision(payload) {
    loading.value = true
    error.value = null
    try {
      const res = await reviewService.batchDecision(payload)
      await fetchPendingByCategory()
      await fetchPendingCount()
      return { success: true, data: res.data }
    } catch (err) {
      error.value = err.message || '批量审核失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchHistory(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await reviewService.getHistory(params)
      return { success: true, data: res.data }
    } catch (err) {
      error.value = err.message || '获取审核历史失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    pendingList,
    total,
    loading,
    error,
    categorySummary,
    pendingCount,
    currentCategory,
    currentSubType,
    currentClassId,
    setCategory,
    setClassId,
    fetchPendingByCategory,
    fetchCategorySummary,
    fetchPendingCount,
    fetchDetail,
    submitDecision,
    batchDecision,
    fetchHistory,
  }
})
