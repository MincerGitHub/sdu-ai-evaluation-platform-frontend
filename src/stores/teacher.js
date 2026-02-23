import { defineStore } from 'pinia';
import { ref } from 'vue';
import teacherService from '../services/teacherService';

export const useTeacherStore = defineStore('teacher', () => {
    const applications = ref([]);
    const statistics = ref({});
    const loading = ref(false);
    const error = ref(null);

    const fetchApplications = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await teacherService.getApplications();
            applications.value = response.data;
        } catch (err) {
            error.value = err.message || 'Failed to fetch applications';
        } finally {
            loading.value = false;
        }
    };

    const fetchStatistics = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await teacherService.getStatistics();
            statistics.value = response.data;
        } catch (err) {
            error.value = err.message || 'Failed to fetch statistics';
        } finally {
            loading.value = false;
        }
    };

    return {
        applications,
        statistics,
        loading,
        error,
        fetchApplications,
        fetchStatistics,
    };
});