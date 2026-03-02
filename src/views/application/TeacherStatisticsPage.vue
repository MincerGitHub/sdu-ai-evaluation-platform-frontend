<template>
  <div class="teacher-statistics-page">
    <div class="page-header">
      <h2>申报统计</h2>
      <div class="filters">
        <el-select v-model="query.grade" placeholder="年级" clearable style="width: 120px">
          <el-option v-for="item in gradeOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-select v-model="query.class_id" placeholder="班级" clearable style="width: 120px">
          <el-option v-for="item in classOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-button type="primary" @click="fetchStatistics">查询</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
    </div>

    <el-table
      :data="rows"
      border
      stripe
      v-loading="loading"
      empty-text="暂无统计数据"
    >
      <el-table-column prop="grade" label="年级" width="120" />
      <el-table-column prop="class_id" label="班级" width="120" />
      <el-table-column prop="total_count" label="总申报数" width="140" />
      <el-table-column prop="rejected_count" label="拒绝申报数" width="140" />
      <el-table-column prop="pending_count" label="待审核申报数" width="150" />
      <el-table-column prop="average_score" label="平均分" width="120" />
      <el-table-column prop="total_score" label="总分" min-width="120" />
    </el-table>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import statisticService from '@/services/statisticService'

const loading = ref(false)
const rows = ref([])
const query = reactive({
  grade: '',
  class_id: '',
})

const gradeOptions = computed(() => {
  const set = new Set(rows.value.map((item) => item.grade).filter(Boolean))
  return [...set].sort((a, b) => a - b)
})

const classOptions = computed(() => {
  const set = new Set(rows.value.map((item) => item.class_id).filter(Boolean))
  return [...set].sort((a, b) => a - b)
})

const fetchStatistics = async () => {
  loading.value = true
  try {
    const params = {}
    if (query.grade) params.grade = query.grade
    if (query.class_id) params.class_id = query.class_id

    const res = await statisticService.getClassStatistics(params)
    const list = Array.isArray(res?.data?.list) ? res.data.list : []
    rows.value = list
  } catch (error) {
    ElMessage.error(error?.message || '获取申报统计失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = async () => {
  query.grade = ''
  query.class_id = ''
  await fetchStatistics()
}

onMounted(fetchStatistics)
</script>

<style scoped>
.teacher-statistics-page {
  padding: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
}

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
