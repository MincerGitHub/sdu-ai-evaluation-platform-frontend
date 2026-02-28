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
    const fetchApplicationsByCategory = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await applicationService.getByCategory({
                category: currentCategory.value,
                sub_type: currentSubType.value,
            });
            const resData = response.data ?? {}; // resData适配 http.js 对原始 axios 的解包
            applications.value = resData.list ?? [];
            total.value = resData.total ?? applications.value.length;
            console.log('[store] fetched applications:', applications.value, 'total:', total.value);
        } catch (err) {
            error.value = err.message || '获取申报列表失败';
            console.error('[store] fetchApplicationsByCategory error:', err);
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
                award_uid: formData.award_uid,
                title: formData.title,
                description: formData.description,
                occurred_at: formData.occurred_at,
                score: formData.score,
                attachments: formData.attachments ?? [],
                category: currentCategory.value,
                sub_type: currentSubType.value,
            };
            const response = await applicationService.create(payload);
            await fetchApplicationsByCategory();
            const resData = response.data ?? {};
            return { success: true, data: resData };
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
                award_uid: formData.award_uid,
                title: formData.title,
                description: formData.description,
                occurred_at: formData.occurred_at,
                score: formData.score,
                attachments: formData.attachments ?? [],
                category: currentCategory.value,
                sub_type: currentSubType.value,
                // version: formData.version, // version做不完了，不做了先
            };
            const response = await applicationService.update(applicationId, payload);
            await fetchApplicationsByCategory();
            const resData = response.data ?? {};
            return { success: true, data: resData };
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
            await applicationService.remove(applicationId);
            applications.value = applications.value.filter(app => app.application_id !== applicationId);
            total.value = Math.max(0, total.value - 1);
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