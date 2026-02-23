import { defineStore } from 'pinia';
import { ref } from 'vue';
import announcementService from '../services/announcementService';

export const useAnnouncementStore = defineStore('announcement', () => {
    const announcements = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchAnnouncements = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await announcementService.getAnnouncements();
            announcements.value = response.data;
        } catch (err) {
            error.value = err.message || 'Failed to fetch announcements';
        } finally {
            loading.value = false;
        }
    };

    const getAnnouncementById = (id) => {
        return announcements.value.find(announcement => announcement.id === id);
    };

    return {
        announcements,
        loading,
        error,
        fetchAnnouncements,
        getAnnouncementById,
    };
});