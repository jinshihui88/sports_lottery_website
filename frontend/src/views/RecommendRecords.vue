<template>
  <div class="page-container">
    <div class="page-header">
      <h2>推荐记录</h2>
      <el-button type="primary" @click="openDialog">新增记录</el-button>
    </div>

    <el-table :data="records" border stripe style="width: 100%">
      <el-table-column prop="recommendDate" label="日期" />
      <el-table-column prop="matchDesc" label="比赛" />
      <el-table-column prop="recommendation" label="推荐结果" />
      <el-table-column prop="recommender" label="推荐人" />

      <el-table-column prop="result" label="结果">
        <template #default="scope">
          <el-tag :type="resultTag(scope.row.result)">{{ resultText(scope.row.result) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="amount" label="金额" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="edit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="page.current"
        :page-size="page.size"
        :total="page.total"
        @current-change="fetchList"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑记录' : '新增记录'" width="600px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="日期">
          <el-date-picker v-model="form.recommendDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="比赛">
          <el-input v-model="form.matchDesc" />
        </el-form-item>
        <el-form-item label="推荐结果">
          <el-input v-model="form.recommendation" />
        </el-form-item>
        <el-form-item label="推荐人">
          <el-input v-model="form.recommender" />
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="form.result" placeholder="-">
            <el-option label="成功" value="1" />
            <el-option label="失败" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-input v-model.number="form.amount" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
  
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/utils/api'
import type { ApiResponse } from '@/types'

interface RecommendRecord {
  id?: number
  recommendDate: string
  matchDesc: string
  recommendation: string
  recommender: string
  result?: string | null
  amount?: number | null
}

const page = reactive({ current: 1, size: 10, total: 0 })
const records = ref<RecommendRecord[]>([])

const dialogVisible = ref(false)
const form = reactive<RecommendRecord>({
  recommendDate: '',
  matchDesc: '',
  recommendation: '',
  recommender: '',
  result: undefined,
  amount: undefined
})

const resultTag = (r?: string | null) => {
  if (r === '1') return 'success'
  if (r === '0') return 'danger'
  return ''
}

const resultText = (r?: string | null) => {
  if (r === '1') return '成功'
  if (r === '0') return '失败'
  return '-'
}


const fetchList = async (p = page.current) => {
  page.current = p
  const res = await api.get('/recommend/records', { params: { current: page.current, size: page.size } }) as ApiResponse<{ records: RecommendRecord[], total: number }>
  if (res && res.code === 200) {
    records.value = res.data?.records || []
    page.total = res.data?.total || 0
  }
}

const openDialog = () => {
  Object.assign(form, { id: undefined, recommendDate: '', matchDesc: '', recommendation: '', recommender: '', result: undefined, amount: undefined })
  dialogVisible.value = true
}

const edit = (row: RecommendRecord) => {
  Object.assign(form, row)
  dialogVisible.value = true
}

const save = async () => {
  try {
    if (form.id) {
      const res = await api.put(`/recommend/records/${form.id}`, form) as ApiResponse
      if (res.code === 200) ElMessage.success('更新成功')
    } else {
      const res = await api.post('/recommend/records', form) as ApiResponse
      if (res.code === 200) ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const remove = async (id?: number) => {
  if (!id) return
  await ElMessageBox.confirm('确认删除该记录吗？', '提示')
  const res = await api.delete(`/recommend/records/${id}`) as ApiResponse
  if (res.code === 200) {
    ElMessage.success('删除成功')
    fetchList()
  }
}

onMounted(() => fetchList(1))
</script>

<style scoped>
.page-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  min-height: calc(100vh - 40px);
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>


