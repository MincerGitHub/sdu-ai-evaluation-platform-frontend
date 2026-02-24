<template>
    <el-table :data="applications" v-loading="loading" border style="width: 100%" row-key="id">
        <el-table-column prop="title" label="申报名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="award_level" label="奖项级别" width="160" />
        <el-table-column prop="occurred_at" label="发生日期" width="120" />
        <el-table-column label="状态" width="120">
            <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="item_score" label="得分" width="80" align="center">
            <template #default="{ row }">
                {{ row.item_score ?? '—' }}
            </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
            <template #default="{ row }">
                <el-button size="small" type="primary" plain :disabled="!isEditable(row)" @click="emit('edit', row)">
                    修改
                </el-button>
                <el-button size="small" type="danger" plain @click="handleDelete(row)">
                    删除
                </el-button>
            </template>
        </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination v-if="total > 0" class="pagination" background layout="prev, pager, next, total" :total="total"
        :page-size="pageSize" :current-page="currentPage" @current-change="emit('page-change', $event)" />
</template>

<script setup>
import { ElMessageBox, ElMessage } from 'element-plus'
import { useApplicationStore } from '@/stores/application'
import { computed } from 'vue'

const store = useApplicationStore()
const applications = computed(() => store.applications)
const loading = computed(() => store.loading)

const props = defineProps({
    total: { type: Number, default: 0 },
    pageSize: { type: Number, default: 10 },
    currentPage: { type: Number, default: 1 },
})

const emit = defineEmits(['edit', 'page-change'])

// 状态可编辑
const editableStatuses = ['pending_ai', 'ai_abnormal', 'pending_review']
function isEditable(row) {
    return editableStatuses.includes(row.status)
}

// 状态标签
const STATUS_MAP = {
    pending_ai: { label: '待AI审核', type: 'info' },
    ai_abnormal: { label: 'AI异常', type: 'warning' },
    pending_review: { label: '待人工审核', type: 'warning' },
    approved: { label: '已通过', type: 'success' },
    rejected: { label: '已拒绝', type: 'danger' },
    withdrawn: { label: '已撤回', type: '' },
}
function statusLabel(status) {
    return STATUS_MAP[status]?.label ?? status
}
function statusTagType(status) {
    return STATUS_MAP[status]?.type ?? 'info'
}

// 删除
async function handleDelete(row) {
    try {
        await ElMessageBox.confirm(`确定删除「${row.title}」吗？此操作不可撤销。`, '删除确认', {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning',
        })
        const result = await store.deleteApplication(row.id)
        if (result.success) {
            ElMessage.success('删除成功')
        } else {
            ElMessage.error(result.error ?? '删除失败')
        }
    } catch {
        // 用户取消，忽略
    }
}
</script>

<style scoped>
.pagination {
    margin-top: 16px;
    justify-content: flex-end;
}
</style>