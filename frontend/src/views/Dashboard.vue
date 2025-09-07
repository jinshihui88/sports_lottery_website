<template>
  <div class="dashboard">
    <!-- 页面标题和欢迎信息 -->
    <div class="page-header">
      <div class="welcome-section">
        <h1 class="page-title">仪表板</h1>
        <p class="welcome-text">欢迎回来！这里是您的投注数据概览</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="$router.push('/records')">
          <el-icon><Plus /></el-icon>
          添加记录
        </el-button>
        <el-button @click="refreshData" :loading="recordsStore.loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

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
        
        <!-- 无数据提示 -->
        <div v-if="recentRecords.length === 0 && !recordsStore.loading" class="empty-state">
          <el-empty 
            description="暂无投注记录" 
            :image-size="120"
          >
            <el-button type="primary" @click="$router.push('/records')">
              添加第一条记录
            </el-button>
          </el-empty>
        </div>
        
        <!-- 加载状态 -->
        <div v-else-if="recordsStore.loading" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>
        
        <!-- 数据表格 -->
        <el-table v-else :data="recentRecords" style="width: 100%">
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
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
  TrendCharts,
  Plus,
  Refresh
} from '@element-plus/icons-vue'
import { useRecordsStore } from '@/stores/records'
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

const recordsStore = useRecordsStore()
const trendPeriod = ref('7days')

// 从store获取统计数据
const stats = computed(() => recordsStore.totalStats)

// 获取最近的记录（最多显示5条）
const recentRecords = computed(() => {
  // 先确保有数据
  if (recordsStore.records.length === 0) {
    // 如果store中没有数据，先加载数据
    recordsStore.fetchRecords({ page: 1, pageSize: 5 })
    return []
  }
  return recordsStore.records.slice(0, 5)
})

// 投注趋势图表配置
const trendChartOption = computed(() => ({
  title: {
    text: '投注金额趋势',
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
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#303133'
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c}次 ({d}%)',
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    borderColor: '#409EFF',
    borderWidth: 1,
    textStyle: {
      color: '#fff'
    }
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
      data: [
        { value: 45, name: '胜平负', itemStyle: { color: '#409EFF' } },
        { value: 25, name: '让球', itemStyle: { color: '#67C23A' } },
        { value: 20, name: '大小球', itemStyle: { color: '#E6A23C' } },
        { value: 10, name: '比分', itemStyle: { color: '#F56C6C' } },
        { value: 8, name: '总进球', itemStyle: { color: '#909399' } }
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
      },
      labelLine: {
        show: true
      }
    }
  ]
}))

// 刷新数据方法
const refreshData = async () => {
  try {
    await recordsStore.fetchRecords({ page: 1, pageSize: 10 })
    console.log('数据刷新完成')
  } catch (error) {
    console.error('数据刷新失败:', error)
  }
}

onMounted(async () => {
  // 初始化数据加载
  await refreshData()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.welcome-section {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 8px 0;
}

.welcome-text {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
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

.empty-state, .loading-state {
  padding: 40px 20px;
}

.empty-state {
  text-align: center;
}

.loading-state {
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard {
    padding: 0 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .header-actions .el-button {
    width: 100%;
  }
}
</style>