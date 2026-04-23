<template>
  <div class="teacher-student-statistics-page page-container">
    <header class="page-header">
      <h2>申报统计（学生）</h2>
    </header>

    <div class="table-toolbar">
      <div class="toolbar-left" />
      <div class="toolbar-right">
        <el-button class="btn-main" @click="fetchStatistics">查询</el-button>
        <el-button class="btn-plain" @click="resetFilters">重置</el-button>
        <el-select v-model="query.class_id" placeholder="班级" clearable style="width: 160px">
          <el-option v-for="item in classOptions" :key="item.class_id" :label="item.label" :value="item.class_id" />
        </el-select>
        <el-select v-model="query.grade" placeholder="年级" clearable style="width: 120px">
          <el-option v-for="item in gradeOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
    </div>

    <el-table :data="rows" border stripe v-loading="loading" empty-text="暂无统计数据">
      <el-table-column prop="grade" label="年级" width="100" />
      <el-table-column prop="class_id" label="班级" width="100" />
      <el-table-column prop="student_account" label="学号" width="140" />
      <el-table-column prop="student_name" label="姓名" width="120" />
      <el-table-column prop="total_count" label="总申报数" width="120" />
      <el-table-column prop="rejected_count" label="驳回数" width="100" />
      <el-table-column prop="pending_count" label="待审数" width="100" />
      <el-table-column prop="total_score" label="total_score" width="120" />
      <el-table-column prop="average_score" label="average_score" width="120" />
      <el-table-column prop="actual_score" label="actual_score" width="120" />
    </el-table>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import statisticService from '@/services/statisticService'
import { CLASSMAP } from '@/utils/classMap'

const loading = ref(false)
const rows = ref([])
const query = reactive({
  grade: '',
  class_id: '',
})

const gradeOptions = computed(() => {
  const set = new Set(CLASSMAP.map((item) => item.grade).filter(Boolean))
  return [...set].sort((a, b) => a - b)
})

const classOptions = computed(() => CLASSMAP)

const fetchStatistics = async () => {
  loading.value = true
  try {
    const params = {}
    if (query.grade) params.grade = query.grade
    if (query.class_id) params.class_id = query.class_id
    const res = await statisticService.getStudentStatistics(params)
    rows.value = Array.isArray(res?.data?.list) ? res.data.list : []
  } catch (error) {
    ElMessage.error(error?.message || '获取学生统计失败')
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
.teacher-student-statistics-page {
  width: 100%;
  box-sizing: border-box;
}
</style>
