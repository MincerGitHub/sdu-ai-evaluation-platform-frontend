import { defineStore } from 'pinia';
import { ref } from 'vue';
import reviewService from '../services/reviewService';

export const useReviewStore = defineStore('review', () => {
    const pendingReviews = ref([]);
    const reviewHistory = ref([]);
    const reviewDetail = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const fetchPendingReviews = async (classId) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await reviewService.getPendingReviews(classId);
            pendingReviews.value = response.data;
        } catch (err) {
            error.value = err.message || 'Failed to fetch pending reviews';
        } finally {
            loading.value = false;
        }
    };

    const fetchReviewHistory = async (reviewerId) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await reviewService.getReviewHistory(reviewerId);
            reviewHistory.value = response.data;
        } catch (err) {
            error.value = err.message || 'Failed to fetch review history';
        } finally {
            loading.value = false;
        }
    };

    const fetchReviewDetail = async (applicationId) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await reviewService.getReviewDetail(applicationId);
            reviewDetail.value = response.data;
        } catch (err) {
            error.value = err.message || 'Failed to fetch review detail';
        } finally {
            loading.value = false;
        }
    };

    const submitReviewDecision = async (applicationId, decision) => {
        loading.value = true;
        error.value = null;
        try {
            await reviewService.submitReviewDecision(applicationId, decision);
            await fetchPendingReviews(); // Refresh pending reviews after submission
        } catch (err) {
            error.value = err.message || 'Failed to submit review decision';
        } finally {
            loading.value = false;
        }
    };

    return {
        pendingReviews,
        reviewHistory,
        reviewDetail,
        loading,
        error,
        fetchPendingReviews,
        fetchReviewHistory,
        fetchReviewDetail,
        submitReviewDecision,
    };
});