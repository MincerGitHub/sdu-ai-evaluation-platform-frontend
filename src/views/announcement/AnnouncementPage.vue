<template>
  <div class="announcement-page">
    <h2 class="page-title">公示</h2>

    <div v-loading="loading" class="download-list">
      <template v-if="downloadItems.length">
        <a v-for="item in downloadItems" :key="item.id" :href="item.url" class="download-link" target="_blank"
          rel="noopener noreferrer" :download="item.fileName" @click.prevent="handleDownload(item)">
          - {{ item.label }}
        </a>
      </template>

      <p v-else class="empty-text">暂无可下载的公示文件</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import archiveService from '@/services/archiveService'

const loading = ref(false)
const announcements = ref([])

const downloadItems = computed(() =>
  announcements.value
    .filter((item) => item && (item.archive_id || item.download_url))
    .map((item, index) => {
      const id = item.id ?? `${item.archive_id}-${index}`
      const url = item.download_url || archiveService.getDownloadUrl(item.archive_id)
      const label = item.title || `公示文件 ${index + 1}`
      const fileName = `${label}.xlsx`
      return { id, label, url, fileName }
    })
)

const fetchAnnouncements = async () => {
  loading.value = true
  try {
    const response = await archiveService.getAnnouncements()
    announcements.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    announcements.value = []
    ElMessage.error(error?.message || '获取公示列表失败')
  } finally {
    loading.value = false
  }
}

const handleDownload = (item) => {
  if (!item?.url || item.url === '#') {
    ElMessage.warning('下载链接无效')
    return
  }
  window.open(item.url, '_blank')
}

onMounted(fetchAnnouncements)
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
  color: #b71c1c;
  font-size: 16px;
  line-height: 1.4;
  text-decoration: none;
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
