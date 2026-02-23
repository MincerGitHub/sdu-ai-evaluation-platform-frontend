import { defineStore } from 'pinia';
import { ref } from 'vue';
import systemService from '../services/systemService';

export const useSystemStore = defineStore('system', () => {
    const awardTypes = ref([]);
    const awardLevels = ref([]);
    const systemConfig = ref({});
    const logs = ref([]);

    const fetchAwardTypes = async () => {
        try {
            const response = await systemService.getAwardTypes();
            awardTypes.value = response.data;
        } catch (error) {
            console.error('Failed to fetch award types:', error);
        }
    };

    const fetchAwardLevels = async () => {
        try {
            const response = await systemService.getAwardLevels();
            awardLevels.value = response.data;
        } catch (error) {
            console.error('Failed to fetch award levels:', error);
        }
    };

    const fetchSystemConfig = async () => {
        try {
            const response = await systemService.getSystemConfig();
            systemConfig.value = response.data;
        } catch (error) {
            console.error('Failed to fetch system config:', error);
        }
    };

    const fetchLogs = async () => {
        try {
            const response = await systemService.getSystemLogs();
            logs.value = response.data;
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        }
    };

    return {
        awardTypes,
        awardLevels,
        systemConfig,
        logs,
        fetchAwardTypes,
        fetchAwardLevels,
        fetchSystemConfig,
        fetchLogs,
    };
});