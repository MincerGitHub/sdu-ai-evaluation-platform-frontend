<template>
    <el-table :data="applications" v-loading="loading" border style="width: 100%" row-key="application_id">
        <el-table-column prop="title" label="申报名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="input_score" label="输入分数" width="100" align="center">
            <template #default="{ row }">
                {{ row.input_score ?? '—' }}
            </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
            <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
            </template>
        </el-table-column>
        <!-- <el-table-column prop="input_score" label="版本" width="40" align="center">
            <template #default="{ row }">
                {{ row.version ?? '—' }}
            </template>
        </el-table-column> -->
        <el-table-column label="操作" width="150" fixed="right" align="center">
            <template #default="{ row }">
                <el-button size="small" type="primary" plain :disabled="!isEditable(row)" :loading="row._editLoading"
                    @click="handleEdit(row)">
                    修改
                </el-button>
                <el-button size="small" type="danger" plain @click="handleDelete(row)">
                    删除
                </el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script setup>
import { ElMessageBox, ElMessage } from 'element-plus'
import { useApplicationStore } from '@/stores/application'
import applicationService from '@/services/applicationService'
import { computed } from 'vue'

const store = useApplicationStore()
const applications = computed(() => store.applications)
const loading = computed(() => store.loading)

const emit = defineEmits(['edit'])

// 状态可编辑
const editableStatuses = ['pending_ai', 'pending_review']
function isEditable(row) {
    return editableStatuses.includes(row.status)
}

// 状态标签
const STATUS_MAP = {
    pending_ai: { label: '待AI审核', type: 'info' },
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
        console.log('Deleting application:', row)
        const result = await store.deleteApplication(row.application_id)
        if (result.success) {
            ElMessage.success('删除成功')
        } else {
            ElMessage.error(result.error ?? '删除失败')
        }
    } catch {
        // 用户取消
    }
}

// 编辑：先获取完整数据再 emit
async function handleEdit(row) {
    try {
        row._editLoading = true
        const res = await applicationService.getDetail(row.application_id)
        const detail = res.data ?? res
        // 保留 application_id 字段供后续更新使用
        detail.application_id = row.application_id
        emit('edit', detail)
    } catch {
        ElMessage.error('获取申报详情失败，请重试')
    } finally {
        row._editLoading = false
    }
}
</script>

<style scoped>
.pagination {
    margin-top: 16px;
    justify-content: flex-end;
}
</style>