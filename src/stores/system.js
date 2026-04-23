import { defineStore } from 'pinia';
import { ref } from 'vue';
import systemService from '../services/systemService';

export const useSystemStore = defineStore('system', () => {
    const health = ref(null)
    const systemConfig = ref({})
    const logs = ref([])
    const awardDicts = ref([])

    const fetchHealth = async () => {
        try {
            const response = await systemService.getApiHealth()
            health.value = response.data || null
        } catch (error) {
            console.error('Failed to fetch health:', error)
        }
    }

    const fetchSystemConfig = async () => {
        try {
            const response = await systemService.getConfigs()
            systemConfig.value = response.data || {}
        } catch (error) {
            console.error('Failed to fetch system config:', error)
        }
    }

    const fetchLogs = async (params = {}) => {
        try {
            const response = await systemService.getLogs(params)
            logs.value = response.data?.list || []
        } catch (error) {
            console.error('Failed to fetch logs:', error)
        }
    }

    const fetchAwardDicts = async () => {
        try {
            const response = await systemService.getAwardDicts()
            awardDicts.value = Array.isArray(response.data) ? response.data : []
        } catch (error) {
            console.error('Failed to fetch award dicts:', error)
        }
    }

    return {
        health,
        systemConfig,
        logs,
        awardDicts,
        fetchHealth,
        fetchSystemConfig,
        fetchLogs,
        fetchAwardDicts,
    }
})
