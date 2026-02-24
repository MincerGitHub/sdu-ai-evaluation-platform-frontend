import { defineStore } from 'pinia';
import { ref } from 'vue';
import applicationService from '../services/applicationService';

export const useApplicationStore = defineStore('application', () => {
    // ---- 状态 ----
    const applications = ref([]);   // 当前页面分类的申报列表
    const total = ref(0);
    const loading = ref(false);
    const error = ref(null);

    // 当前激活的分类上下文，由各页面 set
    const currentCategory = ref('');   // e.g. 'physical_mental'
    const currentSubType = ref('');    // e.g. 'basic' | 'achievement'

    /** 设置当前分类上下文（页面挂载时调用） */
    function setCategory(category, subType) {
        currentCategory.value = category
        currentSubType.value = subType
    }

    // ---- 查询 ----
    const fetchApplicationsByCategory = async (params = {}) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await applicationService.getApplicationsByCategory({
                category: currentCategory.value,
                sub_type: currentSubType.value,
                ...params,
            });
            applications.value = response.data?.data?.list ?? [];
            total.value = response.data?.data?.total ?? applications.value.length;
        } catch (err) {
            error.value = err.message || '获取申报列表失败';
        } finally {
            loading.value = false;
        }
    };

    // ---- 创建 ----
    const createApplication = async (formData) => {
        loading.value = true;
        error.value = null;
        try {
            const payload = {
                ...formData,
                category: currentCategory.value,
                sub_type: currentSubType.value,
            };
            const response = await applicationService.createApplication(payload);
            // 创建成功后刷新列表
            await fetchApplicationsByCategory();
            return { success: true, data: response.data?.data };
        } catch (err) {
            error.value = err.message || '创建申报失败';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    // ---- 更新 ----
    const updateApplication = async (applicationId, formData) => {
        loading.value = true;
        error.value = null;
        try {
            const payload = {
                ...formData,
                category: currentCategory.value,
                sub_type: currentSubType.value,
            };
            const response = await applicationService.updateApplication(applicationId, payload);
            await fetchApplicationsByCategory();
            return { success: true, data: response.data?.data };
        } catch (err) {
            error.value = err.message || '更新申报失败';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    // ---- 删除 ----
    const deleteApplication = async (applicationId) => {
        loading.value = true;
        error.value = null;
        try {
            await applicationService.deleteApplication(applicationId);
            applications.value = applications.value.filter(app => app.id !== applicationId);
            return { success: true };
        } catch (err) {
            error.value = err.message || '删除申报失败';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    return {
        applications,
        total,
        loading,
        error,
        currentCategory,
        currentSubType,
        setCategory,
        fetchApplicationsByCategory,
        createApplication,
        updateApplication,
        deleteApplication,
    };
});