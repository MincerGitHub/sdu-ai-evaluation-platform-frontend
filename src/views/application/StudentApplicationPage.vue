<template>
    <div class="application-page">
        <div class="page-header">
            <h2>{{ pageTitle }}</h2>
            <el-button type="primary" @click="openCreate">新建申报</el-button>
        </div>
        <!-- 表格 -->
        <ApplicationTable @edit="openEdit" />
        <!-- 新建弹窗 -->
        <ApplicationFormDialog ref="createDialogRef" mode="create" :cascader-options="cascaderOptions"
            :category="category" :sub-type="subType" @success="refresh" />
        <!-- 修改弹窗 -->
        <ApplicationFormDialog ref="editDialogRef" mode="edit" :initial-data="editingRow"
            :cascader-options="cascaderOptions" :category="category" :sub-type="subType" @success="refresh" />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApplicationStore } from '@/stores/application'
import { getCascaderOptions } from '@/utils/dealAwardUid'
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
        basic: '创新素养 · 基础素养 · 申报',
        achievement: '创新素养 · 突破提升 · 申报',
    },
}
const pageTitle = computed(
    () => TITLE_MAP[category.value]?.[subType.value] ?? '申报'
)

// ---------- Store ----------
const store = useApplicationStore()

// ---------- 级联选项 ----------
const cascaderOptions = computed(() => getCascaderOptions(category.value, subType.value))

// ---------- 弹窗控制 ----------
const createDialogRef = ref(null)
const editDialogRef = ref(null)
const editingRow = ref(null)

function openCreate() {
    createDialogRef.value?.open()
}

function openEdit(row) {
    editingRow.value = row
    setTimeout(() => editDialogRef.value?.open(), 0)
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