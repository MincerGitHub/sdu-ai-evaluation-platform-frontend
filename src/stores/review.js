import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import reviewService from '@/services/reviewService'
import { useAuthStore } from '@/stores/auth'

export const useReviewStore = defineStore('review', () => {
    // ---- 状态 ----
    const pendingList = ref([])       // 当前分类下的待审核列表
    const total = ref(0)
    const loading = ref(false)
    const error = ref(null)

    const categorySummary = ref([])   // 分类汇总
    const pendingCount = ref(0)       // 待审核总数

    // 当前激活的分类上下文
    const currentCategory = ref('')
    const currentSubType = ref('')
    const currentClassId = ref(null)  // 审核员可按班级过滤

    // ---- 角色推导 ----
    /** 从 auth store 推导当前审核角色，传给 mock/后端 */
    function _getRole() {
        const auth = useAuthStore()
        if (auth.isTeacher || auth.isAdmin) return 'teacher'
        if (auth.isInReviewerView) return 'reviewer'
        return 'reviewer'
    }

    /** 构造带 role 的基础参数 */
    function _baseParams(extra = {}) {
        const params = { role: _getRole(), ...extra }
        if (currentClassId.value) params.class_id = currentClassId.value
        return params
    }

    // ---- 设置上下文 ----
    function setCategory(category, subType) {
        currentCategory.value = category
        currentSubType.value = subType
    }

    function setClassId(classId) {
        currentClassId.value = classId || null
    }

    // ---- 查询：待审核列表（按分类） ----
    async function fetchPendingByCategory() {
        loading.value = true
        error.value = null
        try {
            const params = _baseParams({
                category: currentCategory.value,
                sub_type: currentSubType.value,
            })
            const res = await reviewService.getPendingByCategory(params)
            const data = res.data ?? {}
            pendingList.value = data.list ?? []
            total.value = data.total ?? pendingList.value.length
            console.log('[review store] fetched pending list:', pendingList.value, 'total:', total.value)
        } catch (err) {
            error.value = err.message || '获取待审核列表失败'
            console.error('[review store] fetchPendingByCategory error:', err)
        } finally {
            loading.value = false
        }
    }

    // ---- 查询：分类汇总 ----
    async function fetchCategorySummary() {
        loading.value = true
        error.value = null
        try {
            const params = _baseParams()
            const res = await reviewService.getCategorySummary(params)
            const data = res.data ?? {}
            categorySummary.value = data.categories ?? []
        } catch (err) {
            error.value = err.message || '获取分类汇总失败'
            console.error('[review store] fetchCategorySummary error:', err)
        } finally {
            loading.value = false
        }
    }

    // ---- 查询：待审核数量 ----
    async function fetchPendingCount() {
        try {
            const params = _baseParams()
            const res = await reviewService.getPendingCount(params)
            pendingCount.value = res.data?.pending_count ?? 0
        } catch (err) {
            console.error('[review store] fetchPendingCount error:', err)
        }
    }

    // ---- 查询：详情 ----
    async function fetchDetail(applicationId) {
        loading.value = true
        error.value = null
        try {
            const res = await reviewService.getReviewDetail(applicationId)
            // 确保返回 category 和 sub_type
            return { success: true, data: { ...res.data, category: currentCategory.value, sub_type: currentSubType.value } }
        } catch (err) {
            error.value = err.message || '获取详情失败'
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    // ---- 操作：单条审核 ----
    async function submitDecision(applicationId, payload) {
        loading.value = true
        error.value = null
        try {
            const finalPayload = { role: _getRole(), ...payload }
            const res = await reviewService.submitDecision(applicationId, finalPayload)
            await fetchPendingByCategory()
            return { success: true, data: res.data }
        } catch (err) {
            error.value = err.message || '审核提交失败'
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    // ---- 操作：批量审核 ----
    async function batchDecision(payload) {
        loading.value = true
        error.value = null
        try {
            const res = await reviewService.batchDecision(payload)
            await fetchPendingByCategory()
            return { success: true, data: res.data }
        } catch (err) {
            error.value = err.message || '批量审核失败'
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    // ---- 查询：审核历史 ----
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
        // state
        pendingList,
        total,
        loading,
        error,
        categorySummary,
        pendingCount,
        currentCategory,
        currentSubType,
        currentClassId,
        // actions
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