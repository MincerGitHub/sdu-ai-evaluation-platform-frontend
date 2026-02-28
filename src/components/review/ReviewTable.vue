<template>
    <div class="review-table">
        <el-table :data="store.pendingList" v-loading="store.loading" @selection-change="onSelectionChange"
            style="width: 100%">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="application_id" label="申报ID" width="90" />
            <el-table-column prop="student_name" label="学生姓名" width="120" />
            <el-table-column prop="status" label="状态" width="130">
                <template #default="{ row }">
                    <el-tag :type="statusTagType(row.status)" size="small">
                        {{ statusLabel(row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="score" label="分数" width="80" />
            <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="emit('view', row)">
                        查看
                    </el-button>
                    <el-button link type="success" size="small" @click="emit('approve', row)">
                        通过
                    </el-button>
                    <el-button link type="danger" size="small" @click="emit('reject', row)">
                        驳回
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 批量操作栏 -->
        <div class="batch-bar" v-if="selectedRows.length > 0">
            <span>已选 {{ selectedRows.length }} 项</span>
            <el-button type="success" size="small" @click="emit('batch-approve', selectedRows)">
                批量通过
            </el-button>
            <el-button type="danger" size="small" @click="emit('batch-reject', selectedRows)">
                批量驳回
            </el-button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useReviewStore } from '@/stores/review'

const store = useReviewStore()
const emit = defineEmits(['view', 'approve', 'reject', 'batch-approve', 'batch-reject'])

const selectedRows = ref([])

function onSelectionChange(rows) {
    selectedRows.value = rows
}

function statusTagType(status) {
    const map = {
        pending_review: 'warning',
        pending_teacher: 'info',
        approved: 'success',
        rejected: 'danger',
    }
    return map[status] || ''
}

function statusLabel(status) {
    const map = {
        pending_review: '待审核',
        pending_teacher: '待教师复核',
        approved: '已通过',
        rejected: '已驳回',
    }
    return map[status] || status
}
</script>

<style scoped>
.review-table {
    width: 100%;
}

.batch-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
}
</style>