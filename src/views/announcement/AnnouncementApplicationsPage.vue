<template>
  <div class="page-container public-applications-page">
    <header class="page-header page-header-with-actions">
      <div>
        <p class="eyebrow">公示申报</p>
        <h2>{{ announcementTitle }}</h2>
      </div>
      <div class="header-actions">
        <el-button class="btn-plain" @click="goBack">返回公示</el-button>
        <el-button class="btn-main" @click="openReport">查看个人报告</el-button>
      </div>
    </header>

    <div class="toolbar">
      <el-input
        v-model.trim="keyword"
        clearable
        placeholder="搜索姓名、学号、申报名称或评审规则"
        class="search-input"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-button class="btn-plain" @click="handleSearch">搜索</el-button>
      <el-button class="btn-plain" @click="fetchApplications">刷新</el-button>
    </div>

    <el-table
      :data="applicationList"
      v-loading="loading"
      empty-text="暂无公示范围内申报"
      class="public-application-table"
    >
      <el-table-column prop="class_id" label="班级" width="96" />
      <el-table-column label="学生" width="170">
        <template #default="{ row }">
          <div class="student-cell">
            <span class="student-name">{{ row.student_name || '-' }}</span>
            <span class="student-account">{{ row.student_account || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="申报名称" min-width="220" show-overflow-tooltip />
      <el-table-column prop="award_rule_path" label="评审规则" min-width="280" show-overflow-tooltip />
      <el-table-column label="分类" width="180">
        <template #default="{ row }">
          {{ formatCategory(row) }}
        </template>
      </el-table-column>
      <el-table-column label="分数" width="90" align="center">
        <template #default="{ row }">{{ formatScore(row.score) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ row.status_label || getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发生日期" width="130">
        <template #default="{ row }">{{ row.occurred_at || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">查看</el-button>
          <el-button link type="primary" @click="appealApplication(row)">申诉</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-row">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @current-change="fetchApplications"
        @size-change="handleSizeChange"
      />
    </div>

    <ReviewDetailDialog
      ref="detailDialogRef"
      :show-decision-actions="false"
      :on-fetch-detail="fetchPublicApplicationDetail"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import announcementService from '@/services/announcementService'
import { APPLICATION_STATUS_META } from '@/utils/constants'
import ReviewDetailDialog from '@/components/review/ReviewDetailDialog.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const size = ref(20)
const total = ref(0)
const announcement = ref(null)
const applicationList = ref([])
const detailDialogRef = ref(null)

const announcementId = computed(() => Number(route.params.announcementId))
const announcementTitle = computed(() => announcement.value?.title || '公示申报')

const fetchApplications = async () => {
  if (!Number.isInteger(announcementId.value) || announcementId.value <= 0) {
    ElMessage.warning('公示参数无效')
    return
  }
  loading.value = true
  try {
    const response = await announcementService.getAnnouncementApplications(announcementId.value, {
      page: page.value,
      size: size.value,
      keyword: keyword.value || undefined,
    })
    const data = response?.data || {}
    announcement.value = data.announcement || null
    applicationList.value = Array.isArray(data.list) ? data.list : []
    total.value = Number(data.total || 0)
  } catch (error) {
    applicationList.value = []
    total.value = 0
    ElMessage.error(error?.message || '获取公示申报失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchApplications()
}

const handleSizeChange = () => {
  page.value = 1
  fetchApplications()
}

const goBack = () => {
  router.push({ name: 'StudentAnnouncement' })
}

const openReport = () => {
  router.push({ name: 'StudentAnnouncementReport', params: { announcementId: announcementId.value } })
}

const appealApplication = (row) => {
  if (!row?.application_id) return
  router.push({
    name: 'StudentAppeals',
    query: {
      mode: 'create',
      announcement_id: announcementId.value,
      application_id: row.application_id,
    },
  })
}

const openDetail = (row) => {
  if (!row?.application_id) return
  detailDialogRef.value?.open(row.application_id, {
    ...row,
    student: {
      id: row.student_id,
      name: row.student_name,
      account: row.student_account,
      class_id: row.class_id,
    },
  })
}

const fetchPublicApplicationDetail = async (applicationId) => {
  const response = await announcementService.getAnnouncementApplicationDetail(announcementId.value, applicationId)
  const detail = response?.data || {}
  return {
    success: true,
    data: detail,
  }
}

const formatCategory = (row) => {
  const categoryName = row?.category_name || row?.category || '-'
  const subTypeName = row?.sub_type_name || row?.sub_type || '-'
  return `${categoryName} / ${subTypeName}`
}

const formatScore = (value) => {
  const number = Number(value || 0)
  if (Number.isInteger(number)) return String(number)
  return number.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

const getStatusLabel = (status) => APPLICATION_STATUS_META[status]?.label || status || '-'
const getStatusTagType = (status) => APPLICATION_STATUS_META[status]?.tagType || 'info'

watch(
  () => route.params.announcementId,
  () => {
    page.value = 1
    fetchApplications()
  }
)

onMounted(fetchApplications)
</script>

<style scoped>
.public-applications-page {
  width: 100%;
  box-sizing: border-box;
}

.page-header-with-actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #9c0c13;
  font-size: 13px;
  font-weight: 700;
}

.page-header h2 {
  margin: 0;
}

.header-actions,
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar {
  margin: 18px 0 14px;
  justify-content: flex-end;
}

.search-input {
  width: min(420px, 100%);
}

.public-application-table {
  width: 100%;
}

.student-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.35;
}

.student-name {
  color: #303133;
  font-weight: 600;
}

.student-account {
  color: #909399;
  font-size: 12px;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 900px) {
  .page-header-with-actions,
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .search-input {
    width: 100%;
  }
}
</style>
