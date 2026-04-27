<template>
  <div class="application-page page-container">
    <header class="page-header">
      <h2>{{ pageTitle }}</h2>
    </header>

    <ApplicationTable @edit="openEdit" @view="openView">
      <template #toolbar-right>
        <el-button class="btn-main" @click="openCreate">新建申报</el-button>
      </template>
    </ApplicationTable>

    <ApplicationFormDialog
      ref="createDialogRef"
      mode="create"
      :cascader-options="cascaderOptions"
      :category="category"
      :sub-type="subType"
      @success="refresh"
    />
    <ApplicationFormDialog
      ref="editDialogRef"
      mode="edit"
      :initial-data="editingRow"
      :cascader-options="cascaderOptions"
      :category="category"
      :sub-type="subType"
      @success="refresh"
    />
    <ReviewDetailDialog
      ref="viewDialogRef"
      :show-decision-actions="false"
      :on-fetch-detail="fetchStudentDetail"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApplicationStore } from '@/stores/application'
import { useAuthStore } from '@/stores/auth'
import { getCascaderOptions } from '@/utils/dealAwardUid'
import applicationService from '@/services/applicationService'
import ApplicationTable from '@/components/application/ApplicationTable.vue'
import ApplicationFormDialog from '@/components/application/ApplicationFormDialog.vue'
import ReviewDetailDialog from '@/components/review/ReviewDetailDialog.vue'

// ---------- 路由参数 ----------
const route = useRoute()
const category = computed(() => route.params.category)
const subType = computed(() => route.params.subType)

// ---------- 页面标题映射 ----------
const TITLE_MAP = {
    physical_mental: {
        basic: '身心素养 · 基础性评价 · 申报',
        achievement: '身心素养 · 成果性评价 · 申报',
    },
    art: {
        basic: '文艺素养 · 基础性评价 · 申报',
        achievement: '文艺素养 · 成果性评价 · 申报',
    },
    labor: {
        basic: '劳动素养 · 基础性评价 · 申报',
        achievement: '劳动素养 · 成果性评价 · 申报',
    },
    innovation: {
        basic: '创新素养 · 基础素养 · 申报',
        achievement: '创新素养 · 突破提升 · 申报',
    },
}
const pageTitle = computed(
    () => TITLE_MAP[category.value]?.[subType.value] ?? '申报'
)

// ---------- Store ----------
const store = useApplicationStore()
const authStore = useAuthStore()

// ---------- 级联选项 ----------
const cascaderOptions = computed(() => getCascaderOptions(category.value, subType.value))

// ---------- 弹窗控制 ----------
const createDialogRef = ref(null)
const editDialogRef = ref(null)
const viewDialogRef = ref(null)
const editingRow = ref(null)

function openCreate() {
    createDialogRef.value?.open()
}

function openEdit(row) {
    editingRow.value = row
    setTimeout(() => editDialogRef.value?.open(), 0)
}

function openView(row) {
    if (!row?.application_id) return
    viewDialogRef.value?.open(row.application_id, {
        ...row,
        student_id: authStore.user?.id,
        student_name: authStore.user?.name,
        student_account: authStore.user?.account,
        class_id: authStore.user?.class_id,
        student_email: authStore.user?.email,
    })
}

async function fetchStudentDetail(applicationId) {
    const res = await applicationService.getDetail(applicationId)
    const detail = res?.data || {}
    return {
        success: true,
        data: {
            ...detail,
            student: detail.student || {
                id: authStore.user?.id || null,
                name: authStore.user?.name || '',
                account: authStore.user?.account || '',
                class_id: authStore.user?.class_id || null,
                email: authStore.user?.email || '',
            },
        },
    }
}

// ---------- 刷新 ----------
function refresh() {
    store.fetchApplicationsByCategory()
}

// ---------- 路由参数变化时重新加载 ----------
function initPage() {
    store.setCategory(category.value, subType.value)
    store.fetchApplicationsByCategory()
}

onMounted(initPage)
watch([category, subType], initPage)
</script>

<style scoped>
/* 页面本身不再自定义 header 样式，统一使用 table.css 中的 .page-header/.page-title */
</style>
