<template>
  <div class="announcement-page">
    <header class="page-header">
      <h2>公示</h2>
    </header>
    <div v-loading="loading" class="download-list">
      <template v-if="downloadItems.length">
        <div
          v-for="item in downloadItems"
          :key="item.id"
          class="announcement-row"
        >
          <button type="button" class="download-link" @click="downloadAnnouncement(item)">
            {{ item.label }}
          </button>
          <button v-if="isStudent" type="button" class="report-link" @click="openReport(item)">
            查看个人报告
          </button>
        </div>
      </template>

      <p v-else class="empty-text">暂无可下载的公示文件</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import announcementService from '@/services/announcementService'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const announcements = ref([])
let refreshTimer = null
const isStudent = computed(() => authStore.isStudent)

const downloadItems = computed(() =>
  announcements.value
    .filter((item) => item)
    .map((item, index) => {
      const id = item.id ?? item.announcement_id ?? `${item.archive_id}-${index}`
      const label = item.title || `公示文件 ${index + 1}`
      const fileName = `${label}.xlsx`
      return {
        id,
        label,
        fileName,
        archiveId: item.archive_id,
        downloadUrl: item.download_url || '',
      }
    })
)

const downloadAnnouncement = (item) => {
  if (!item?.id) {
    ElMessage.warning('该公示暂不可下载')
    return
  }
  announcementService.downloadAnnouncementFile(item.id, item.fileName).catch((error) => {
    ElMessage.error(error?.message || '下载失败')
  })
}

const openReport = (item) => {
  if (!item?.id) {
    ElMessage.warning('该公示暂不可查看报告')
    return
  }
  router.push({ name: 'StudentAnnouncementReport', params: { announcementId: item.id } })
}

const fetchAnnouncements = async () => {
  loading.value = true
  try {
    const response = await announcementService.getAnnouncements()
    announcements.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    announcements.value = []
    ElMessage.error(error?.message || '获取公示列表失败')
  } finally {
    loading.value = false
  }
}

const startAutoRefresh = () => {
  stopAutoRefresh()
  refreshTimer = window.setInterval(() => {
    fetchAnnouncements()
  }, 5000)
}

const stopAutoRefresh = () => {
  if (!refreshTimer) return
  window.clearInterval(refreshTimer)
  refreshTimer = null
}

const handleWindowFocus = () => {
  fetchAnnouncements()
}

onMounted(() => {
  fetchAnnouncements()
  startAutoRefresh()
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleWindowFocus)
  }
})

onBeforeUnmount(() => {
  stopAutoRefresh()
  if (typeof window !== 'undefined') {
    window.removeEventListener('focus', handleWindowFocus)
  }
})
</script>

<style scoped>
.announcement-page {
  width: 100%;
  min-height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  line-height: 1.2;
  color: #111111;
  font-weight: 700;
}

.download-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding-left: 8px;
}

.announcement-row {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 100%;
}

.download-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: #9c0c13;
  font-size: 16px;
  line-height: 1.4;
  text-decoration: none;
  cursor: pointer;
}

.download-link:hover {
  text-decoration: underline;
}

.report-link {
  border: 1px solid rgba(156, 12, 19, 0.22);
  border-radius: 6px;
  padding: 4px 10px;
  background: #fff7f7;
  color: #9c0c13;
  font-size: 13px;
  line-height: 1.4;
  cursor: pointer;
}

.report-link:hover {
  border-color: #9c0c13;
  background: #fff0f0;
}

.empty-text {
  margin: 0;
  color: #8a8a8a;
  font-size: 14px;
}

@media (max-width: 1200px) {
  .page-title {
    font-size: 18px;
  }

  .download-link {
    font-size: 15px;
  }

  .empty-text {
    font-size: 14px;
  }
}
</style>
