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
                {{ overviewStats.netProfit >= 0 ? '+' : '' }}{{ ((overviewStats.netProfit / Math.max(overviewStats.totalAmount, 1)) * 100).toFixed(1) }}%
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

        <!-- 投注时间分布 -->
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
          <div v-if="leagueAnalysis.length === 0" class="empty-state">
            <el-empty description="暂无联赛数据" />
          </div>
          <el-table v-else :data="leagueAnalysis" style="width: 100%">
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
          <div v-if="betTypeAnalysis.length === 0" class="empty-state">
            <el-empty description="暂无投注类型数据" />
          </div>
          <el-table v-else :data="betTypeAnalysis" style="width: 100%">
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
          <div v-if="monthlyAnalysis.length === 0" class="empty-state">
            <el-empty description="暂无月度数据" />
          </div>
          <el-table v-else :data="monthlyAnalysis" style="width: 100%">
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { useRecordsStore } from '@/stores/records'
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

const recordsStore = useRecordsStore()
const timePeriod = ref('30days')
const trendType = ref('amount')
const activeTab = ref('league')

// 从store获取概览统计数据
const overviewStats = computed(() => {
  const stats = recordsStore.totalStats
  return {
    totalBets: stats.totalBets || 0,
    totalAmount: stats.totalAmount || 0,
    totalWinning: stats.totalWinning || 0,
    netProfit: stats.netProfit || 0,
    winRate: stats.winRate || 0,
    avgBetAmount: stats.avgBetAmount || 0
  }
})

// 联赛分析数据
const leagueAnalysis = computed(() => {
  const leagueMap = new Map()
  
  recordsStore.records.forEach(record => {
    const league = record.league || '未知联赛'
    if (!leagueMap.has(league)) {
      leagueMap.set(league, {
        league,
        totalBets: 0,
        totalAmount: 0,
        winCount: 0,
        totalWinning: 0,
        netProfit: 0,
        oddsSum: 0
      })
    }
    
    const data = leagueMap.get(league)
    data.totalBets++
    data.totalAmount += record.betAmount || 0
    data.totalWinning += record.actualWinning || 0
    data.netProfit += record.profit || 0
    data.oddsSum += record.odds || 0
    
    if (record.result === '中奖') {
      data.winCount++
    }
  })
  
  return Array.from(leagueMap.values()).map(data => ({
    ...data,
    winRate: data.totalBets > 0 ? data.winCount / data.totalBets : 0,
    roi: data.totalAmount > 0 ? data.netProfit / data.totalAmount : 0,
    avgOdds: data.totalBets > 0 ? data.oddsSum / data.totalBets : 0
  }))
})

// 投注类型分析数据
const betTypeAnalysis = computed(() => {
  const betTypeMap = new Map()
  
  recordsStore.records.forEach(record => {
    const betType = record.betType || '未知类型'
    if (!betTypeMap.has(betType)) {
      betTypeMap.set(betType, {
        betType,
        totalBets: 0,
        totalAmount: 0,
        winCount: 0,
        totalWinning: 0,
        netProfit: 0,
        oddsSum: 0
      })
    }
    
    const data = betTypeMap.get(betType)
    data.totalBets++
    data.totalAmount += record.betAmount || 0
    data.totalWinning += record.actualWinning || 0
    data.netProfit += record.profit || 0
    data.oddsSum += record.odds || 0
    
    if (record.result === '中奖') {
      data.winCount++
    }
  })
  
  return Array.from(betTypeMap.values()).map(data => ({
    ...data,
    winRate: data.totalBets > 0 ? data.winCount / data.totalBets : 0,
    avgOdds: data.totalBets > 0 ? data.oddsSum / data.totalBets : 0
  }))
})

// 月度分析数据
const monthlyAnalysis = computed(() => {
  const monthMap = new Map()
  
  recordsStore.records.forEach(record => {
    const month = (record.date || '').substring(0, 7) || '未知月份'
    if (!monthMap.has(month)) {
      monthMap.set(month, {
        month,
        totalBets: 0,
        totalAmount: 0,
        winCount: 0,
        totalWinning: 0,
        netProfit: 0,
        bestDayProfit: -Infinity,
        worstDayProfit: Infinity,
        bestDay: '',
        worstDay: '',
        dailyProfits: new Map()
      })
    }
    
    const data = monthMap.get(month)
    data.totalBets++
    data.totalAmount += record.betAmount || 0
    data.totalWinning += record.actualWinning || 0
    data.netProfit += record.profit || 0
    
    if (record.result === '中奖') {
      data.winCount++
    }
    
    // 追踪每日盈亏
    const date = record.date || ''
    if (date && !data.dailyProfits.has(date)) {
      data.dailyProfits.set(date, 0)
    }
    if (date) {
      data.dailyProfits.set(date, data.dailyProfits.get(date) + (record.profit || 0))
    }
  })
  
  return Array.from(monthMap.values()).map(data => {
    // 计算最佳和最差单日
    for (const [date, profit] of data.dailyProfits) {
      if (profit > data.bestDayProfit) {
        data.bestDayProfit = profit
        data.bestDay = date
      }
      if (profit < data.worstDayProfit) {
        data.worstDayProfit = profit
        data.worstDay = date
      }
    }
    
    return {
      month: data.month,
      totalBets: data.totalBets,
      totalAmount: data.totalAmount,
      winRate: data.totalBets > 0 ? data.winCount / data.totalBets : 0,
      netProfit: data.netProfit,
      bestDay: data.bestDay || '-',
      worstDay: data.worstDay || '-'
    }
  }).sort((a, b) => b.month.localeCompare(a.month))
})

// 投注趋势图表配置
const trendChartOption = computed(() => ({
  title: {
    text: '投注趋势分析',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#303133'
    }
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    borderColor: '#409EFF',
    borderWidth: 1,
    textStyle: {
      color: '#fff'
    }
  },
  legend: {
    data: ['投注金额', '中奖金额', '净收益'],
    bottom: 10,
    textStyle: {
      color: '#606266'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['1/14', '1/15', '1/16', '1/17', '1/18', '1/19', '1/20'],
    axisLine: {
      lineStyle: {
        color: '#E4E7ED'
      }
    },
    axisLabel: {
      color: '#909399'
    }
  },
  yAxis: {
    type: 'value',
    name: '金额(元)',
    nameTextStyle: {
      color: '#909399'
    },
    axisLine: {
      lineStyle: {
        color: '#E4E7ED'
      }
    },
    axisLabel: {
      color: '#909399'
    },
    splitLine: {
      lineStyle: {
        color: '#F2F6FC'
      }
    }
  },
  series: [
    {
      name: '投注金额',
      type: 'line',
      data: [300, 450, 200, 600, 350, 150, 200],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 3
      },
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ]
        }
      }
    },
    {
      name: '中奖金额',
      type: 'line',
      data: [0, 850, 0, 1200, 0, 0, 420],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 3
      },
      itemStyle: {
        color: '#67C23A'
      }
    },
    {
      name: '净收益',
      type: 'line',
      data: [-300, 400, -200, 600, -350, -150, 220],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 3
      },
      itemStyle: {
        color: '#E6A23C'
      }
    }
  ]
}))

// 投注类型分布图表配置
const pieChartOption = computed(() => ({
  title: {
    text: '投注类型分布',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c}次 ({d}%)'
  },
  legend: {
    orient: 'vertical',
    right: '10%',
    top: 'center',
    textStyle: {
      color: '#606266'
    }
  },
  series: [
    {
      name: '投注类型',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      data: betTypeAnalysis.value.length > 0 ? betTypeAnalysis.value.map((item, index) => ({
        value: item.totalBets,
        name: item.betType,
        itemStyle: { 
          color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'][index % 5]
        }
      })) : [
        { value: 1, name: '暂无数据', itemStyle: { color: '#E4E7ED' } }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        show: true,
        formatter: '{b}: {d}%',
        fontSize: 12,
        color: '#606266'
      }
    }
  ]
}))

// 联赛胜率图表配置
const leagueChartOption = computed(() => ({
  title: {
    text: '联赛胜率对比',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: (params: any) => {
      if (params && params[0]) {
        const data = params[0]
        return `${data.name}<br/>胜率: ${parseFloat(data.value).toFixed(1)}%`
      }
      return ''
    }
  },
  xAxis: {
    type: 'category',
    data: leagueAnalysis.value.length > 0 ? leagueAnalysis.value.map(item => item.league) : ['暂无数据'],
    axisLabel: {
      interval: 0,
      rotate: leagueAnalysis.value.length > 5 ? 45 : 0
    }
  },
  yAxis: {
    type: 'value',
    name: '胜率(%)',
    max: 100,
    axisLabel: {
      formatter: '{value}%'
    }
  },
  series: [
    {
      name: '胜率',
      type: 'bar',
      data: leagueAnalysis.value.length > 0 
        ? leagueAnalysis.value.map(item => (item.winRate * 100).toFixed(1))
        : [0],
      itemStyle: {
        color: '#409EFF'
      }
    }
  ]
}))

// 投注时间分布图表配置
const timeDistributionOption = computed(() => ({
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
}))

const handlePeriodChange = (period: string) => {
  console.log('Period changed:', period)
}

const exportAnalysis = () => {
  ElMessage.info('导出功能开发中')
}

onMounted(async () => {
  try {
    await recordsStore.fetchRecords({ page: 1, pageSize: 100 })
    console.log('Statistics数据加载完成')
  } catch (error) {
    console.error('Statistics数据加载失败:', error)
  }
})
</script>

<style scoped>
.statistics-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
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

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statistics-page {
    padding: 0 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats-overview .el-col {
    margin-bottom: 16px;
  }
  
  .charts-section .el-row {
    margin: 0;
  }
  
  .charts-section .el-col {
    margin-bottom: 16px;
  }
}
</style>