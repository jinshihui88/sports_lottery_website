<template>
    <div class="statistics-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>数据统计分析</h2>
        <div class="header-actions">
          <el-select v-model="timePeriod" @change="handlePeriodChange">
            <el-option label="最近7天" value="7days" />
            <el-option label="最近30天" value="30days" />
            <el-option label="最近3个月" value="3months" />
            <el-option label="最近6个月" value="6months" />
            <el-option label="最近1年" value="1year" />
          </el-select>
        </div>
      </div>

      <!-- 统计概览 -->
      <div class="stats-overview">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-value">{{ overviewStats.totalBets }}</div>
                <div class="stat-label">总投注次数</div>
                <div class="stat-trend positive">+12%</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-value">¥{{ overviewStats.totalAmount.toLocaleString() }}</div>
                <div class="stat-label">总投注金额</div>
                <div class="stat-trend positive">+8%</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-value">{{ overviewStats.winRate.toFixed(1) }}%</div>
                <div class="stat-label">胜率</div>
                <div class="stat-trend negative">-2%</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-value" :class="{ 'negative': overviewStats.netProfit < 0 }">
                  ¥{{ overviewStats.netProfit.toLocaleString() }}
                </div>
                <div class="stat-label">净收益</div>
                <div class="stat-trend" :class="overviewStats.netProfit >= 0 ? 'positive' : 'negative'">
                  {{ overviewStats.netProfit >= 0 ? '+' : '' }}{{ ((overviewStats.netProfit / overviewStats.totalAmount) * 100).toFixed(1) }}%
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <el-row :gutter="20">
          <!-- 投注趋势图 -->
          <el-col :span="16">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>投注趋势分析</span>
                  <el-radio-group v-model="trendType" size="small">
                    <el-radio-button label="amount">金额</el-radio-button>
                    <el-radio-button label="count">次数</el-radio-button>
                    <el-radio-button label="profit">盈亏</el-radio-button>
                  </el-radio-group>
                </div>
              </template>
              <div class="chart-container">
                <v-chart :option="trendChartOption" />
              </div>
            </el-card>
          </el-col>

          <!-- 投注类型分布 -->
          <el-col :span="8">
            <el-card class="chart-card">
              <template #header>
                <span>投注类型分布</span>
              </template>
              <div class="chart-container">
                <v-chart :option="pieChartOption" />
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px">
          <!-- 联赛胜率分析 -->
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <span>联赛胜率分析</span>
              </template>
              <div class="chart-container">
                <v-chart :option="leagueChartOption" />
              </div>
            </el-card>
          </el-col>

          <!-- 投注习惯分析 -->
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <span>投注时间分布</span>
              </template>
              <div class="chart-container">
                <v-chart :option="timeDistributionOption" />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 详细分析表格 -->
      <el-card class="analysis-table">
        <template #header>
          <div class="card-header">
            <span>详细分析数据</span>
            <el-button type="primary" size="small" @click="exportAnalysis">
              <el-icon><Download /></el-icon>
              导出分析报告
            </el-button>
          </div>
        </template>

        <el-tabs v-model="activeTab">
          <el-tab-pane label="按联赛统计" name="league">
            <el-table :data="leagueAnalysis" style="width: 100%">
              <el-table-column prop="league" label="联赛" width="150" />
              <el-table-column prop="totalBets" label="投注次数" width="100" />
              <el-table-column prop="totalAmount" label="投注金额" width="120">
                <template #default="{ row }">
                  ¥{{ row.totalAmount.toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column prop="winCount" label="中奖次数" width="100" />
              <el-table-column prop="winRate" label="胜率" width="100">
                <template #default="{ row }">
                  {{ (row.winRate * 100).toFixed(1) }}%
                </template>
              </el-table-column>
              <el-table-column prop="totalWinning" label="中奖金额" width="120">
                <template #default="{ row }">
                  ¥{{ row.totalWinning.toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column prop="netProfit" label="净收益" width="120">
                <template #default="{ row }">
                  <span :class="{ 'text-red-500': row.netProfit < 0, 'text-green-500': row.netProfit > 0 }">
                    ¥{{ row.netProfit.toLocaleString() }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="roi" label="投资回报率" width="120">
                <template #default="{ row }">
                  <span :class="{ 'text-red-500': row.roi < 0, 'text-green-500': row.roi > 0 }">
                    {{ (row.roi * 100).toFixed(2) }}%
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="按投注类型统计" name="betType">
            <el-table :data="betTypeAnalysis" style="width: 100%">
              <el-table-column prop="betType" label="投注类型" width="120" />
              <el-table-column prop="totalBets" label="投注次数" width="100" />
              <el-table-column prop="totalAmount" label="投注金额" width="120">
                <template #default="{ row }">
                  ¥{{ row.totalAmount.toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column prop="winCount" label="中奖次数" width="100" />
              <el-table-column prop="winRate" label="胜率" width="100">
                <template #default="{ row }">
                  {{ (row.winRate * 100).toFixed(1) }}%
                </template>
              </el-table-column>
              <el-table-column prop="avgOdds" label="平均赔率" width="100">
                <template #default="{ row }">
                  {{ row.avgOdds.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="netProfit" label="净收益" width="120">
                <template #default="{ row }">
                  <span :class="{ 'text-red-500': row.netProfit < 0, 'text-green-500': row.netProfit > 0 }">
                    ¥{{ row.netProfit.toLocaleString() }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="月度统计" name="monthly">
            <el-table :data="monthlyAnalysis" style="width: 100%">
              <el-table-column prop="month" label="月份" width="100" />
              <el-table-column prop="totalBets" label="投注次数" width="100" />
              <el-table-column prop="totalAmount" label="投注金额" width="120">
                <template #default="{ row }">
                  ¥{{ row.totalAmount.toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column prop="winRate" label="胜率" width="100">
                <template #default="{ row }">
                  {{ (row.winRate * 100).toFixed(1) }}%
                </template>
              </el-table-column>
              <el-table-column prop="netProfit" label="净收益" width="120">
                <template #default="{ row }">
                  <span :class="{ 'text-red-500': row.netProfit < 0, 'text-green-500': row.netProfit > 0 }">
                    ¥{{ row.netProfit.toLocaleString() }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="bestDay" label="最佳单日" width="120" />
              <el-table-column prop="worstDay" label="最差单日" width="120" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const timePeriod = ref('30days')
const trendType = ref('amount')
const activeTab = ref('league')

const overviewStats = reactive({
  totalBets: 156,
  totalAmount: 15600,
  totalWinning: 18200,
  netProfit: 2600,
  winRate: 65.4
})

// 模拟数据
const leagueAnalysis = ref([
  {
    league: '英超',
    totalBets: 45,
    totalAmount: 4500,
    winCount: 28,
    winRate: 0.622,
    totalWinning: 5200,
    netProfit: 700,
    roi: 0.156
  },
  {
    league: '西甲',
    totalBets: 38,
    totalAmount: 3800,
    winCount: 22,
    winRate: 0.579,
    totalWinning: 4100,
    netProfit: 300,
    roi: 0.079
  },
  {
    league: 'NBA',
    totalBets: 32,
    totalAmount: 3200,
    winCount: 18,
    winRate: 0.563,
    totalWinning: 3600,
    netProfit: 400,
    roi: 0.125
  }
])

const betTypeAnalysis = ref([
  {
    betType: '胜平负',
    totalBets: 68,
    totalAmount: 6800,
    winCount: 42,
    winRate: 0.618,
    avgOdds: 2.15,
    netProfit: 850
  },
  {
    betType: '让球',
    totalBets: 35,
    totalAmount: 3500,
    winCount: 20,
    winRate: 0.571,
    avgOdds: 1.95,
    netProfit: 200
  },
  {
    betType: '大小球',
    totalBets: 28,
    totalAmount: 2800,
    winCount: 15,
    winRate: 0.536,
    avgOdds: 1.85,
    netProfit: -150
  }
])

const monthlyAnalysis = ref([
  {
    month: '2024-01',
    totalBets: 52,
    totalAmount: 5200,
    winRate: 0.654,
    netProfit: 800,
    bestDay: '2024-01-15',
    worstDay: '2024-01-08'
  },
  {
    month: '2023-12',
    totalBets: 48,
    totalAmount: 4800,
    winRate: 0.625,
    netProfit: 600,
    bestDay: '2023-12-22',
    worstDay: '2023-12-05'
  }
])

const trendChartOption = computed(() => ({
  title: {
    text: '投注趋势分析',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['投注金额', '中奖金额', '净收益'],
    top: 30
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['1/14', '1/15', '1/16', '1/17', '1/18', '1/19', '1/20']
  },
  yAxis: {
    type: 'value',
    name: '金额(元)'
  },
  series: [
    {
      name: '投注金额',
      type: 'line',
      data: [300, 450, 200, 600, 350, 150, 200],
      smooth: true,
      itemStyle: { color: '#409EFF' }
    },
    {
      name: '中奖金额',
      type: 'line',
      data: [0, 850, 0, 1200, 0, 0, 420],
      smooth: true,
      itemStyle: { color: '#67C23A' }
    },
    {
      name: '净收益',
      type: 'line',
      data: [-300, 400, -200, 600, -350, -150, 220],
      smooth: true,
      itemStyle: { color: '#E6A23C' }
    }
  ]
}))

const pieChartOption = ref({
  title: {
    text: '投注类型分布',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  series: [
    {
      name: '投注类型',
      type: 'pie',
      radius: '60%',
      data: [
        { value: 68, name: '胜平负' },
        { value: 35, name: '让球' },
        { value: 28, name: '大小球' },
        { value: 15, name: '比分' },
        { value: 10, name: '总进球' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

const leagueChartOption = ref({
  title: {
    text: '联赛胜率对比',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  xAxis: {
    type: 'category',
    data: ['英超', '西甲', '德甲', 'NBA', 'CBA']
  },
  yAxis: {
    type: 'value',
    name: '胜率(%)',
    max: 100
  },
  series: [
    {
      name: '胜率',
      type: 'bar',
      data: [62.2, 57.9, 68.5, 56.3, 71.4],
      itemStyle: {
        color: new (window as any).echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' }
        ])
      }
    }
  ]
})

const timeDistributionOption = ref({
  title: {
    text: '投注时间分布',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value',
    name: '投注次数'
  },
  series: [
    {
      name: '投注次数',
      type: 'bar',
      data: [12, 8, 15, 10, 18, 25, 22],
      itemStyle: {
        color: '#67C23A'
      }
    }
  ]
})

const handlePeriodChange = (period: string) => {
  // 根据时间段重新加载数据
  console.log('Period changed:', period)
}

const exportAnalysis = () => {
  ElMessage.info('导出功能开发中')
}

onMounted(() => {
  // 初始化数据
  console.log('Statistics page mounted')
})
</script>

<style scoped>
.statistics-page {
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

.stats-overview {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
}

.stat-item {
  padding: 10px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-value.negative {
  color: #f56565;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  font-weight: bold;
}

.stat-trend.positive {
  color: #67c23a;
}

.stat-trend.negative {
  color: #f56565;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
}

.chart-container {
  height: 300px;
}

.analysis-table {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-red-500 {
  color: #f56565;
}

.text-green-500 {
  color: #48bb78;
}
</style>