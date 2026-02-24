<!-- filepath: d:\code\FrontProjects\aiRating\code\sdu-ai-evaluation-platform-frontend\src\views\student\StudentApplicationPage.vue -->
<template>
    <div class="application-page">
        <div class="page-header">
            <h2>{{ pageTitle }}</h2>
            <el-button type="primary" @click="openCreate">新建申报</el-button>
        </div>
        <!-- 表格 -->
        <ApplicationTable :total="store.total" :current-page="page" @edit="openEdit" @page-change="handlePageChange" />
        <!-- 新建弹窗 -->
        <ApplicationFormDialog ref="createDialogRef" mode="create" :cascader-options="cascaderOptions"
            @success="refresh" />
        <!-- 修改弹窗 -->
        <ApplicationFormDialog ref="editDialogRef" mode="edit" :initial-data="editingRow"
            :cascader-options="cascaderOptions" @success="refresh" />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApplicationStore } from '@/stores/application'
import { getCascaderOptions } from '@/utils/award-dicts'
import ApplicationTable from '@/components/application/ApplicationTable.vue'
import ApplicationFormDialog from '@/components/application/ApplicationFormDialog.vue'

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
        foundation: '创新素养 · 基础素养 · 申报',
        breakthrough: '创新素养 · 突破提升 · 申报',
    },
}
const pageTitle = computed(
    () => TITLE_MAP[category.value]?.[subType.value] ?? '申报'
)

// ---------- Store ----------
const store = useApplicationStore()

// ---------- 级联选项 ----------
const cascaderOptions = computed(() => getCascaderOptions(category.value, subType.value))

// ---------- 分页 ----------
const page = ref(1)

function handlePageChange(newPage) {
    page.value = newPage
    store.fetchApplicationsByCategory({ page: newPage })
}

// ---------- 弹窗控制 ----------
const createDialogRef = ref(null)
const editDialogRef = ref(null)
const editingRow = ref(null)

function openCreate() {
    createDialogRef.value?.open()
}

function openEdit(row) {
    editingRow.value = row
    editDialogRef.value?.open()
}

// ---------- 刷新 ----------
function refresh() {
    page.value = 1
    store.fetchApplicationsByCategory()
}

// ---------- 路由参数变化时重新加载（同一组件复用场景） ----------
function initPage() {
    page.value = 1
    store.setCategory(category.value, subType.value)
    store.fetchApplicationsByCategory()
}

// 首次进入
onMounted(initPage)

// 同一组件切换路由参数（如从"身心-基础"点击"身心-成果"）
watch([category, subType], initPage)
</script>

<style scoped>
.application-page {
    padding: 16px;
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.page-header h2 {
    margin: 0;
    font-size: 18px;
}
</style>