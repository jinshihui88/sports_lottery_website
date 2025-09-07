<template>
  <Layout>
    <div class="dashboard">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.totalBets }}</h3>
              <p>总投注次数</p>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon amount">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <h3>¥{{ stats.totalAmount.toLocaleString() }}</h3>
              <p>总投注金额</p>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon winning">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <h3>¥{{ stats.totalWinning.toLocaleString() }}</h3>
              <p>总中奖金额</p>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon profit" :class="{ negative: stats.netProfit < 0 }">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <h3 :class="{ 'text-red-500': stats.netProfit < 0, 'text-green-500': stats.netProfit > 0 }">
                ¥{{ stats.netProfit.toLocaleString() }}
              </h3>
              <p>净收益</p>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 图表区域 -->
      <div class="charts-grid">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>投注趋势</span>
              <el-select v-model="trendPeriod" size="small" style="width: 120px">
                <el-option label="最近7天" value="7days" />
                <el-option label="最近30天" value="30days" />
                <el-option label="最近3个月" value="3months" />
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="trendChartOption" />
          </div>
        </el-card>
        
        <el-card class="chart-card">
          <template #header>
            <span>投注类型分布</span>
          </template>
          <div class="chart-container">
            <v-chart :option="pieChartOption" />
          </div>
        </el-card>
      </div>
      
      <!-- 最近记录 -->
      <el-card class="recent-records">
        <template #header>
          <div class="card-header">
            <span>最近投注记录</span>
            <el-button type="primary" size="small" @click="$router.push('/records')">
              查看全部
            </el-button>
          </div>
        </template>
        
        <el-table :data="recentRecords" style="width: 100%">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="sportType" label="运动类型" width="100" />
          <el-table-column prop="league" label="联赛" width="150" />
          <el-table-column label="对阵" width="200">
            <template #default="{ row }">
              {{ row.homeTeam }} vs {{ row.awayTeam }}
            </template>
          </el-table-column>
          <el-table-column prop="betType" label="投注类型" width="120" />
          <el-table-column prop="betAmount" label="投注金额" width="120">
            <template #default="{ row }">
              ¥{{ row.betAmount }}
            </template>
          </el-table-column>
          <el-table-column prop="result" label="结果" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.result === '中奖' ? 'success' : row.result === '未中奖' ? 'danger' : 'warning'"
              >
                {{ row.result }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="profit" label="盈亏" width="120">
            <template #default="{ row }">
              <span :class="{ 'text-red-500': row.profit < 0, 'text-green-500': row.profit > 0 }">
                ¥{{ row.profit }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import {
  Document,
  Money,
  Trophy,
  TrendCharts
} from '@element-plus/icons-vue'
import Layout from '@/components/Layout.vue'
import type { BetRecord, Statistics } from '@/types'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const trendPeriod = ref('7days')

const stats = reactive<Statistics>({
  totalBets: 156,
  totalAmount: 15600,
  totalWinning: 18200,
  netProfit: 2600,
  winRate: 0.65,
  avgBetAmount: 100,
  bestDay: '2024-01-15',
  worstDay: '2024-01-08'
})

const recentRecords = ref<BetRecord[]>([
  {
    id: 1,
    userId: 1,
    date: '2024-01-20',
    sportType: '足球',
    league: '英超',
    homeTeam: '曼城',
    awayTeam: '利物浦',
    betType: '胜平负',
    betOption: '主胜',
    betAmount: 200,
    odds: 2.1,
    result: '中奖',
    actualWinning: 420,
    profit: 220,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T22:00:00Z'
  },
  {
    id: 2,
    userId: 1,
    date: '2024-01-19',
    sportType: '篮球',
    league: 'NBA',
    homeTeam: '湖人',
    awayTeam: '勇士',
    betType: '大小球',
    betOption: '大球',
    betAmount: 150,
    odds: 1.9,
    result: '未中奖',
    actualWinning: 0,
    profit: -150,
    createdAt: '2024-01-19T15:00:00Z',
    updatedAt: '2024-01-19T23:30:00Z'
  }
])

const trendChartOption = ref({
  title: {
    text: '投注金额趋势',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
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
      itemStyle: {
        color: '#409EFF'
      }
    },
    {
      name: '中奖金额',
      type: 'line',
      data: [0, 850, 0, 1200, 0, 0, 420],
      smooth: true,
      itemStyle: {
        color: '#67C23A'
      }
    }
  ]
})

const pieChartOption = ref({
  title: {
    text: '投注类型分布',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '投注类型',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 45, name: '胜平负' },
        { value: 25, name: '让球' },
        { value: 20, name: '大小球' },
        { value: 10, name: '比分' }
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

onMounted(() => {
  // 这里可以加载实际数据
  console.log('Dashboard mounted')
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.amount {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.winning {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.profit {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.profit.negative {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info h3 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-info p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #909399;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
}

.chart-container {
  height: 300px;
}

.recent-records {
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