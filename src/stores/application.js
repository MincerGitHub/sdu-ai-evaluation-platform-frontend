import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import applicationService from '../services/applicationService';

export const useApplicationStore = defineStore('application', () => {
    const applications = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchApplications = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await applicationService.getMyApplications();
            applications.value = response.data;
        } catch (err) {
            error.value = err.message || 'Failed to fetch applications';
        } finally {
            loading.value = false;
        }
    };

    const createApplication = async (applicationData) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await applicationService.createApplication(applicationData);
            applications.value.push(response.data);
        } catch (err) {
            error.value = err.message || 'Failed to create application';
        } finally {
            loading.value = false;
        }
    };

    const updateApplication = async (applicationId, applicationData) => {
        loading.value = true;
        error.value = null;
        try {
            await applicationService.updateApplication(applicationId, applicationData);
            const index = applications.value.findIndex(app => app.id === applicationId);
            if (index !== -1) {
                applications.value[index] = { ...applications.value[index], ...applicationData };
            }
        } catch (err) {
            error.value = err.message || 'Failed to update application';
        } finally {
            loading.value = false;
        }
    };

    const deleteApplication = async (applicationId) => {
        loading.value = true;
        error.value = null;
        try {
            await applicationService.deleteApplication(applicationId);
            applications.value = applications.value.filter(app => app.id !== applicationId);
        } catch (err) {
            error.value = err.message || 'Failed to delete application';
        } finally {
            loading.value = false;
        }
    };

    const getApplicationById = (applicationId) => {
        return applications.value.find(app => app.id === applicationId);
    };

    return {
        applications,
        loading,
        error,
        fetchApplications,
        createApplication,
        updateApplication,
        deleteApplication,
        getApplicationById,
    };
});