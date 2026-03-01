import { defineStore } from 'pinia'
import { ref } from 'vue'
import appealService from '@/services/appealService'
import notificationService from '@/services/notificationService'

export const useAppealStore = defineStore('appeal', () => {
    const list = ref([])
    const total = ref(0)
    const loading = ref(false)
    const processing = ref(false)
    const lastError = ref('')

    const query = ref({
        page: 1,
        size: 10,
        status: '',
    })

    function setQuery(patch = {}) {
        query.value = {
            ...query.value,
            ...patch,
        }
    }

    async function fetchAppeals(patch = {}) {
        setQuery(patch)
        loading.value = true
        lastError.value = ''
        try {
            const params = {
                page: query.value.page,
                size: query.value.size,
            }
            if (query.value.status) {
                params.status = query.value.status
            }
            const res = await appealService.getList(params)
            const payload = res.data

            if (Array.isArray(payload)) {
                list.value = payload
                total.value = payload.length
            } else {
                list.value = payload?.list || []
                total.value = Number(payload?.total || list.value.length)
            }
            return { success: true, data: list.value }
        } catch (error) {
            lastError.value = error?.message || '获取申诉列表失败'
            return { success: false, error: lastError.value }
        } finally {
            loading.value = false
        }
    }

    async function processAppeal(appealId, payload, options = {}) {
        processing.value = true
        lastError.value = ''
        try {
            const res = await appealService.process(appealId, payload)

            if (options.sendEmail && options.to) {
                await notificationService.sendAppealResultEmail({
                    application_id: appealId,
                    to: options.to,
                })
            }

            await fetchAppeals()
            return { success: true, data: res.data }
        } catch (error) {
            lastError.value = error?.message || '处理申诉失败'
            return { success: false, error: lastError.value }
        } finally {
            processing.value = false
        }
    }

    return {
        list,
        total,
        loading,
        processing,
        lastError,
        query,
        setQuery,
        fetchAppeals,
        processAppeal,
    }
})
