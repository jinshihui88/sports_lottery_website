<template>
  <Layout>
    <div class="records-page">
      <!-- 页面标题和操作按钮 -->
      <div class="page-header">
        <h2>投注记录管理</h2>
        <div class="header-actions">
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加记录
          </el-button>
          <el-button @click="showBatchDialog = true">
            <el-icon><Upload /></el-icon>
            批量添加
          </el-button>
          <el-button @click="exportRecords">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>

      <!-- 搜索筛选区域 -->
      <el-card class="search-card">
        <el-form :model="searchForm" inline>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <el-form-item label="运动类型">
            <el-select v-model="searchForm.sportType" placeholder="请选择" clearable>
              <el-option label="足球" value="足球" />
              <el-option label="篮球" value="篮球" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="联赛">
            <el-input v-model="searchForm.league" placeholder="请输入联赛名称" clearable />
          </el-form-item>
          
          <el-form-item label="投注类型">
            <el-select v-model="searchForm.betType" placeholder="请选择" clearable>
              <el-option label="胜平负" value="胜平负" />
              <el-option label="让球" value="让球" />
              <el-option label="大小球" value="大小球" />
              <el-option label="比分" value="比分" />
              <el-option label="总进球" value="总进球" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="结果">
            <el-select v-model="searchForm.result" placeholder="请选择" clearable>
              <el-option label="待开奖" value="待开奖" />
              <el-option label="中奖" value="中奖" />
              <el-option label="未中奖" value="未中奖" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 数据表格 -->
      <el-card class="table-card">
        <el-table
          :data="recordsStore.records"
          :loading="recordsStore.loading"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="date" label="日期" width="120" sortable />
          <el-table-column prop="sportType" label="运动类型" width="100" />
          <el-table-column prop="league" label="联赛" width="120" />
          <el-table-column label="对阵" width="200">
            <template #default="{ row }">
              {{ row.homeTeam }} vs {{ row.awayTeam }}
            </template>
          </el-table-column>
          <el-table-column prop="betType" label="投注类型" width="100" />
          <el-table-column prop="betOption" label="投注选项" width="120" />
          <el-table-column prop="betAmount" label="投注金额" width="100" sortable>
            <template #default="{ row }">
              ¥{{ row.betAmount }}
            </template>
          </el-table-column>
          <el-table-column prop="odds" label="赔率" width="80" />
          <el-table-column prop="result" label="结果" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.result === '中奖' ? 'success' : row.result === '未中奖' ? 'danger' : 'warning'"
              >
                {{ row.result }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="actualWinning" label="中奖金额" width="100">
            <template #default="{ row }">
              ¥{{ row.actualWinning || 0 }}
            </template>
          </el-table-column>
          <el-table-column prop="profit" label="盈亏" width="100" sortable>
            <template #default="{ row }">
              <span :class="{ 'text-red-500': row.profit < 0, 'text-green-500': row.profit > 0 }">
                ¥{{ row.profit }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="editRecord(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteRecord(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="recordsStore.pagination.page"
            v-model:page-size="recordsStore.pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="recordsStore.pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>

      <!-- 添加/编辑记录对话框 -->
      <RecordDialog
        v-model="showAddDialog"
        :record="currentRecord"
        @confirm="handleSaveRecord"
      />

      <!-- 批量添加对话框 -->
      <BatchAddDialog
        v-model="showBatchDialog"
        @confirm="handleBatchAdd"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download } from '@element-plus/icons-vue'
import Layout from '@/components/Layout.vue'
import RecordDialog from '@/components/RecordDialog.vue'
import BatchAddDialog from '@/components/BatchAddDialog.vue'
import { useRecordsStore } from '@/stores/records'
import type { BetRecord, SearchParams } from '@/types'

const recordsStore = useRecordsStore()

const showAddDialog = ref(false)
const showBatchDialog = ref(false)
const currentRecord = ref<BetRecord | null>(null)
const selectedRecords = ref<BetRecord[]>([])

const searchForm = reactive<SearchParams>({
  dateRange: undefined,
  sportType: '',
  league: '',
  betType: '',
  result: '',
  keyword: ''
})

const handleSearch = () => {
  recordsStore.fetchRecords({
    ...searchForm,
    page: 1,
    pageSize: recordsStore.pagination.pageSize
  })
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key as keyof SearchParams] = key === 'dateRange' ? undefined : ''
  })
  handleSearch()
}

const handleSelectionChange = (selection: BetRecord[]) => {
  selectedRecords.value = selection
}

const handleSizeChange = (size: number) => {
  recordsStore.pagination.pageSize = size
  handleSearch()
}

const handleCurrentChange = (page: number) => {
  recordsStore.pagination.page = page
  handleSearch()
}

const editRecord = (record: BetRecord) => {
  currentRecord.value = { ...record }
  showAddDialog.value = true
}

const deleteRecord = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const result = await recordsStore.deleteRecord(id)
    if (result.success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(result.error || '删除失败')
    }
  } catch (error) {
    // 用户取消删除
  }
}

const handleSaveRecord = async (record: any) => {
  try {
    let result
    if (currentRecord.value?.id) {
      result = await recordsStore.updateRecord(currentRecord.value.id, record)
    } else {
      result = await recordsStore.addRecord(record)
    }

    if (result.success) {
      ElMessage.success(currentRecord.value?.id ? '更新成功' : '添加成功')
      showAddDialog.value = false
      currentRecord.value = null
    } else {
      ElMessage.error(result.error || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleBatchAdd = async (records: any[]) => {
  try {
    const result = await recordsStore.batchAddRecords(records)
    if (result.success) {
      ElMessage.success(`成功添加 ${records.length} 条记录`)
      showBatchDialog.value = false
    } else {
      ElMessage.error(result.error || '批量添加失败')
    }
  } catch (error) {
    ElMessage.error('批量添加失败')
  }
}

const exportRecords = () => {
  // 导出功能实现
  ElMessage.info('导出功能开发中')
}

onMounted(() => {
  recordsStore.fetchRecords()
})
</script>

<style scoped>
.records-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.text-red-500 {
  color: #f56565;
}

.text-green-500 {
  color: #48bb78;
}
</style>