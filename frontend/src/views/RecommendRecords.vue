<template>
  <div class="page-container">
    <div class="page-header">
      <h2>推荐记录</h2>
    </div>

    <!-- 查询表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="推荐日期">
          <el-date-picker
            v-model="searchForm.recommendDate"
            type="date"
            placeholder="请选择日期"
            value-format="YYYY-MM-DD"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="比赛信息">
          <el-input
            v-model="searchForm.matchDesc"
            placeholder="请输入比赛信息"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="推荐人">
          <el-select
            v-model="searchForm.recommender"
            placeholder="请选择推荐人"
            clearable
            filterable
            :loading="recommenderLoading"
            style="width: 200px"
          >
            <el-option
              v-for="(recommender, index) in recommenderOptions"
              :key="`${recommender}-${index}`"
              :label="recommender"
              :value="recommender"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
        <el-form-item class="add-button-item">
          <el-button type="primary" @click="openDialog">
            <el-icon><Plus /></el-icon>
            新增记录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="table-wrapper">
      <el-table
        :data="records"
        border
        stripe
        height="100%"
        style="width: 100%"
        v-loading="loading"
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="recommendDate" label="日期" />
        <el-table-column prop="matchDesc" label="比赛" />
        <el-table-column prop="recommendation" label="推荐结果" />
        <el-table-column prop="recommender" label="推荐人" />

        <el-table-column prop="result" label="结果">
          <template #default="scope">
            <el-tag :type="resultTag(scope.row.result)">{{ resultText(scope.row.result) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="edit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

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
          <el-select
            v-model="form.result"
            placeholder="-"
            clearable
            :loading="resultLoading"
          >
            <el-option
              v-for="option in resultOptions"
              :key="option.dictCode"
              :label="option.dictLabel"
              :value="option.dictCode"
            />
          </el-select>
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
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
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

interface DictDataOption {
  dictCode: string
  dictLabel: string
  sortOrder?: number | null
}

interface SearchForm {
  recommendDate?: string
  matchDesc?: string
  recommender?: string
}

const page = reactive({ current: 1, size: 15, total: 0 })
const records = ref<RecommendRecord[]>([])
const loading = ref(false)
const recommenderOptions = ref<string[]>([])
const recommenderLoading = ref(false)
const resultOptions = ref<DictDataOption[]>([])
const resultLoading = ref(false)

// 查询表单
const searchForm = reactive<SearchForm>({
  recommendDate: '',
  matchDesc: '',
  recommender: ''
})

const dialogVisible = ref(false)
const form = reactive<RecommendRecord>({
  recommendDate: '',
  matchDesc: '',
  recommendation: '',
  recommender: '',
  result: undefined,
  amount: undefined
})

const isSuccessResult = (r?: string | null) => r === '1' || r === '成功'

const isFailedResult = (r?: string | null) => r === '0' || r === '失败'

const fallbackResultText = (r?: string | null) => {
  if (isSuccessResult(r)) return '成功'
  if (isFailedResult(r)) return '失败'
  if (r === '2' || r === '比赛中断') return '比赛中断'
  return '-'
}

const resultTag = (r?: string | null) => {
  if (isSuccessResult(r)) return 'success'
  if (isFailedResult(r)) return 'danger'
  return ''
}

const resultText = (r?: string | null) => {
  if (!r) return '-'
  const option = resultOptions.value.find(item => item.dictCode === r || item.dictLabel === r)
  return option?.dictLabel || fallbackResultText(r)
}

const tableRowClassName = ({ row }: { row: RecommendRecord }) => {
  if (isSuccessResult(row.result)) return 'recommend-success-row'
  if (isFailedResult(row.result)) return 'recommend-failed-row'
  return ''
}

const fetchRecommenders = async () => {
  recommenderLoading.value = true

  try {
    const res = await api.get('/recommend/recommenders') as ApiResponse<string[]>
    if (res && res.code === 200) {
      recommenderOptions.value = res.data || []
    }
  } catch (error) {
    ElMessage.error('推荐人列表加载失败')
  } finally {
    recommenderLoading.value = false
  }
}

const fetchRecommendResultOptions = async () => {
  resultLoading.value = true

  try {
    const res = await api.get('/dict/data', {
      params: { dictType: 'recommend_result' }
    }) as ApiResponse<DictDataOption[]>

    if (res && res.code === 200) {
      resultOptions.value = (res.data || [])
        .filter(item => item.dictCode && item.dictLabel)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      return
    }

    ElMessage.error(res?.message || '推荐结果字典加载失败')
  } catch (error) {
    ElMessage.error('推荐结果字典加载失败')
  } finally {
    resultLoading.value = false
  }
}

const fetchList = async (p = page.current) => {
  page.current = p
  loading.value = true
  
  try {
    // 构建查询参数
    const params: any = { 
      current: page.current, 
      size: page.size 
    }
    
    // 添加查询条件
    if (searchForm.recommendDate) {
      params.recommendDate = searchForm.recommendDate
    }
    if (searchForm.matchDesc) {
      params.matchDesc = searchForm.matchDesc
    }
    if (searchForm.recommender) {
      params.recommender = searchForm.recommender
    }
    
    const res = await api.get('/recommend/records', { params }) as ApiResponse<{ records: RecommendRecord[], total: number }>
    if (res && res.code === 200) {
      records.value = res.data?.records || []
      page.total = res.data?.total || 0
    }
  } catch (error) {
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

// 查询方法
const handleSearch = () => {
  page.current = 1 // 重置到第一页
  fetchList(1)
}

// 重置方法
const handleReset = () => {
  searchForm.recommendDate = ''
  searchForm.matchDesc = ''
  searchForm.recommender = ''
  page.current = 1
  fetchList(1)
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

onMounted(() => {
  fetchRecommenders()
  fetchRecommendResultOptions()
  fetchList(1)
})
</script>

<style scoped>
.page-container {
  background: #fff;
  border-radius: 12px;
  padding: 0;
  width: 100%;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  display: none;
}

.search-card {
  flex: 0 0 auto;
  margin: 0;
  border: 1px solid #e4e7ed;
  border-radius: 12px 12px 0 0;
}

.search-card :deep(.el-card__body) {
  padding: 12px 20px;
}

.search-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.search-card :deep(.el-form-item:not(.add-button-item) .el-button) {
  margin-left: 8px;
}

.search-card :deep(.el-form-item:not(.add-button-item) .el-button:first-child) {
  margin-left: 0;
}

.add-button-item {
  margin-left: auto !important;
}

.search-card :deep(.add-button-item) {
  margin-left: auto !important;
}

.search-card :deep(.el-form) {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.table-wrapper :deep(.el-table__body tr.recommend-success-row > td.el-table__cell) {
  background-color: #8fd16a;
}

.table-wrapper :deep(.el-table__body tr.recommend-success-row:hover > td.el-table__cell) {
  background-color: #7bc457;
}

.table-wrapper :deep(.el-table__body tr.recommend-failed-row > td.el-table__cell) {
  background-color: #f56c6c;
}

.table-wrapper :deep(.el-table__body tr.recommend-failed-row:hover > td.el-table__cell) {
  background-color: #e85b5b;
}

.pagination {
  flex: 0 0 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #ebeef5;
}
</style>


