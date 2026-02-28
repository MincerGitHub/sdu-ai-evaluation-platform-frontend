<template>
  <div class="token-management-page">
    <el-card class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-select v-model="filters.status" placeholder="状态筛选" clearable style="width: 180px">
            <el-option label="待激活" value="pending" />
            <el-option label="已激活" value="active" />
            <el-option label="已失效" value="revoked" />
          </el-select>
          <el-button @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
        <el-button type="primary" @click="openCreateDialog">+ 新建令牌</el-button>
      </div>
    </el-card>

    <el-card>
      <el-table :data="tokens" v-loading="loading" border>
        <el-table-column prop="token" label="令牌" min-width="240" />
        <el-table-column label="审核权限范围" min-width="220">
          <template #default="{ row }">
            {{ renderClassScope(row.class_ids) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="失效时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.expired_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="danger"
              :disabled="row.status === 'revoked'"
              @click="handleRevoke(row)"
            >
              失效
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="pagination.total"
          :current-page="pagination.page"
          :page-size="pagination.size"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="createDialogVisible" title="新建令牌" width="520px">
      <el-form :model="createForm" label-width="90px">
        <el-form-item label="范围">
          <el-select
            v-model="createForm.class_ids"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择可审核班级"
            style="width: 100%"
          >
            <el-option
              v-for="item in classOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="失效日期">
          <el-date-picker
            v-model="createForm.expired_at"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
            placeholder="请选择失效日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreateToken">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import tokenService from '@/services/tokenService'

const loading = ref(false)
const creating = ref(false)
const createDialogVisible = ref(false)

const tokens = ref([])

const filters = reactive({
  status: '',
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

const createForm = reactive({
  class_ids: [],
  expired_at: '',
})

const classOptions = [
  { label: '2023级1班（301）', value: 301 },
  { label: '2023级2班（302）', value: 302 },
  { label: '2023级3班（303）', value: 303 },
  { label: '2024级1班（401）', value: 401 },
  { label: '2024级2班（402）', value: 402 },
]

function statusLabel(status) {
  const map = {
    pending: '待激活',
    active: '已激活',
    revoked: '已失效',
  }
  return map[status] || status
}

function statusTagType(status) {
  if (status === 'active') return 'success'
  if (status === 'revoked') return 'info'
  return 'warning'
}

function formatDateTime(value) {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleString('zh-CN', { hour12: false })
}

function renderClassScope(classIds = []) {
  if (!classIds.length) return '-'
  return classIds
    .map((id) => classOptions.find((item) => item.value === id)?.label || `${id}班`)
    .join('、')
}

async function fetchTokens() {
  loading.value = true
  try {
    const res = await tokenService.getList({
      type: 'reviewer',
      status: filters.status || undefined,
      page: pagination.page,
      size: pagination.size,
    })
    const data = res.data || {}
    tokens.value = data.list || []
    pagination.total = data.total || 0
    pagination.page = data.page || 1
    pagination.size = data.size || 10
  } catch (error) {
    ElMessage.error(error?.message || '获取令牌列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchTokens()
}

function handleReset() {
  filters.status = ''
  pagination.page = 1
  fetchTokens()
}

function handlePageChange(page) {
  pagination.page = page
  fetchTokens()
}

function openCreateDialog() {
  createForm.class_ids = []
  createForm.expired_at = ''
  createDialogVisible.value = true
}

async function handleCreateToken() {
  if (!createForm.class_ids.length) {
    ElMessage.warning('请至少选择一个班级范围')
    return
  }

  creating.value = true
  try {
    await tokenService.createReviewerToken({
      class_ids: createForm.class_ids,
      expired_at: createForm.expired_at || undefined,
    })
    ElMessage.success('令牌创建成功')
    createDialogVisible.value = false
    pagination.page = 1
    fetchTokens()
  } catch (error) {
    ElMessage.error(error?.message || '创建令牌失败')
  } finally {
    creating.value = false
  }
}

async function handleRevoke(row) {
  try {
    await ElMessageBox.confirm(`确认将令牌 ${row.token} 设为失效吗？`, '失效确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await tokenService.revokeToken(row.id)
    ElMessage.success('令牌已失效')
    fetchTokens()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '令牌失效失败')
    }
  }
}

onMounted(fetchTokens)
</script>

<style scoped>
.token-management-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar-card {
  margin-bottom: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    width: 100%;
  }

  .pagination-wrap {
    justify-content: center;
  }
}
</style>
