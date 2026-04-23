<template>
  <div class="announcement-page">
    <header class="page-header">
      <h2>公示</h2>
    </header>
    <div v-loading="loading" class="download-list">
      <template v-if="downloadItems.length">
        <button
          v-for="item in downloadItems"
          :key="item.id"
          type="button"
          class="download-link"
          @click="downloadAnnouncement(item)"
        >
          - {{ item.label }}
        </button>
      </template>

      <p v-else class="empty-text">暂无可下载的公示文件</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import archiveService from '@/services/archiveService'
import announcementService from '@/services/announcementService'

const loading = ref(false)
const announcements = ref([])
let refreshTimer = null

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
  if (item?.archiveId) {
    archiveService.downloadArchiveFile(item.archiveId, item.fileName).catch((error) => {
      ElMessage.error(error?.message || '下载失败')
    })
    return
  }

  if (!item?.downloadUrl) {
    ElMessage.warning('该公示暂不可下载')
    return
  }
  window.open(item.downloadUrl, '_blank', 'noopener')
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
