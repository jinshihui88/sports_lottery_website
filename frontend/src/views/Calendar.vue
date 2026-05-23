<template>
    <div class="calendar-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>日历视图</h2>
        <div class="header-actions">
          <el-button-group>
            <el-button :type="viewMode === 'month' ? 'primary' : 'default'" @click="changeView('month')">
              月视图
            </el-button>
            <el-button :type="viewMode === 'week' ? 'primary' : 'default'" @click="changeView('week')">
              周视图
            </el-button>
          </el-button-group>
          <el-button type="primary" @click="goToToday">今天</el-button>
        </div>
      </div>

      <!-- 日历统计概览 -->
      <div class="calendar-stats">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="stat-item profit">
              <div class="stat-icon">📈</div>
              <div class="stat-info">
                <div class="stat-value">{{ monthStats.profitDays }}</div>
                <div class="stat-label">盈利天数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item loss">
              <div class="stat-icon">📉</div>
              <div class="stat-info">
                <div class="stat-value">{{ monthStats.lossDays }}</div>
                <div class="stat-label">亏损天数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item best">
              <div class="stat-icon">🏆</div>
              <div class="stat-info">
                <div class="stat-value">¥{{ monthStats.bestDayProfit }}</div>
                <div class="stat-label">最佳单日</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item worst">
              <div class="stat-icon">💔</div>
              <div class="stat-info">
                <div class="stat-value">¥{{ monthStats.worstDayLoss }}</div>
                <div class="stat-label">最差单日</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 日历主体 -->
      <el-card class="calendar-card">
        <FullCalendar
          ref="calendarRef"
          :options="calendarOptions"
          class="custom-calendar"
        />
      </el-card>

      <!-- 日期详情对话框 -->
      <el-dialog
        v-model="showDayDetail"
        :title="`${selectedDate} 投注详情`"
        width="800px"
      >
        <div class="day-detail">
          <!-- 当日统计 -->
          <div class="day-stats">
            <el-row :gutter="16">
              <el-col :span="6">
                <div class="day-stat-item">
                  <div class="value">{{ dayDetail.totalBets }}</div>
                  <div class="label">投注次数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="day-stat-item">
                  <div class="value">¥{{ dayDetail.totalAmount }}</div>
                  <div class="label">投注金额</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="day-stat-item">
                  <div class="value">¥{{ dayDetail.totalWinning }}</div>
                  <div class="label">中奖金额</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="day-stat-item">
                  <div class="value" :class="{ 'negative': dayDetail.netProfit < 0 }">
                    ¥{{ dayDetail.netProfit }}
                  </div>
                  <div class="label">净收益</div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 当日记录列表 -->
          <div class="day-records">
            <h4>投注记录</h4>
            <el-table :data="dayDetail.records" style="width: 100%" size="small">
              <el-table-column prop="league" label="联赛" width="100" />
              <el-table-column label="对阵" width="180">
                <template #default="{ row }">
                  {{ row.homeTeam }} vs {{ row.awayTeam }}
                </template>
              </el-table-column>
              <el-table-column prop="betType" label="投注类型" width="80" />
              <el-table-column prop="betAmount" label="金额" width="80">
                <template #default="{ row }">
                  ¥{{ row.betAmount }}
                </template>
              </el-table-column>
              <el-table-column prop="result" label="结果" width="80">
                <template #default="{ row }">
                  <el-tag
                    :type="row.result === '中奖' ? 'success' : row.result === '未中奖' ? 'danger' : 'warning'"
                    size="small"
                  >
                    {{ row.result }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="profit" label="盈亏" width="80">
                <template #default="{ row }">
                  <span :class="{ 'text-red-500': row.profit < 0, 'text-green-500': row.profit > 0 }">
                    ¥{{ row.profit }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-dialog>

      <!-- 图例说明 -->
      <el-card class="legend-card">
        <template #header>
          <span>图例说明</span>
        </template>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-color profit-day"></div>
            <span>盈利日 (净收益 > 0)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color loss-day"></div>
            <span>亏损日 (净收益 < 0)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color break-even-day"></div>
            <span>平衡日 (净收益 = 0)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color no-bet-day"></div>
            <span>无投注日</span>
          </div>
        </div>
      </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { BetRecord } from '@/types'

const calendarRef = ref()
const showDayDetail = ref(false)
const selectedDate = ref('')
const viewMode = ref('month')

// 模拟月度统计数据
const monthStats = reactive({
  profitDays: 12,
  lossDays: 8,
  bestDayProfit: 850,
  worstDayLoss: -320
})

// 模拟日期详情数据
const dayDetail = reactive({
  totalBets: 0,
  totalAmount: 0,
  totalWinning: 0,
  netProfit: 0,
  records: [] as BetRecord[]
})

// 模拟日历事件数据
const calendarEvents = ref([
  {
    id: '1',
    title: '盈利 +220',
    date: '2024-01-20',
    className: 'profit-event',
    extendedProps: {
      profit: 220,
      totalBets: 3,
      totalAmount: 450
    }
  },
  {
    id: '2',
    title: '亏损 -150',
    date: '2024-01-19',
    className: 'loss-event',
    extendedProps: {
      profit: -150,
      totalBets: 2,
      totalAmount: 300
    }
  },
  {
    id: '3',
    title: '盈利 +380',
    date: '2024-01-18',
    className: 'profit-event',
    extendedProps: {
      profit: 380,
      totalBets: 4,
      totalAmount: 600
    }
  }
])

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: viewMode.value === 'month' ? 'dayGridMonth' : 'dayGridWeek',
  headerToolbar: {
    left: 'prev,next',
    center: 'title',
    right: ''
  },
  locale: 'zh-cn',
  events: calendarEvents.value,
  dateClick: handleDateClick,
  eventClick: handleEventClick,
  height: 'auto',
  dayMaxEvents: 3,
  moreLinkClick: 'popover',
  eventDisplay: 'block',
  displayEventTime: false,
  eventClassNames: (arg: any) => {
    const profit = arg.event.extendedProps.profit
    if (profit > 0) return ['profit-event']
    if (profit < 0) return ['loss-event']
    return ['break-even-event']
  }
}))

const handleDateClick = (info: any) => {
  selectedDate.value = info.dateStr
  loadDayDetail(info.dateStr)
  showDayDetail.value = true
}

const handleEventClick = (info: any) => {
  selectedDate.value = info.event.startStr
  loadDayDetail(info.event.startStr)
  showDayDetail.value = true
}

const loadDayDetail = (date: string) => {
  // 模拟加载当日详情数据
  const mockRecords: BetRecord[] = [
    {
      id: 1,
      userId: 1,
      date: date,
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
      createdAt: date + 'T10:00:00Z',
      updatedAt: date + 'T22:00:00Z'
    }
  ]

  dayDetail.totalBets = mockRecords.length
  dayDetail.totalAmount = mockRecords.reduce((sum, record) => sum + record.betAmount, 0)
  dayDetail.totalWinning = mockRecords.reduce((sum, record) => sum + (record.actualWinning || 0), 0)
  dayDetail.netProfit = mockRecords.reduce((sum, record) => sum + (record.profit || 0), 0)
  dayDetail.records = mockRecords
}

const changeView = (mode: string) => {
  viewMode.value = mode
  const calendarApi = calendarRef.value?.getApi()
  if (calendarApi) {
    calendarApi.changeView(mode === 'month' ? 'dayGridMonth' : 'dayGridWeek')
  }
}

const goToToday = () => {
  const calendarApi = calendarRef.value?.getApi()
  if (calendarApi) {
    calendarApi.today()
  }
}

onMounted(() => {
  // 初始化日历数据
  console.log('Calendar mounted')
})
</script>

<style scoped>
.calendar-page {
  max-width: 1200px;
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

.calendar-stats {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 32px;
  margin-right: 12px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.calendar-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.custom-calendar {
  --fc-border-color: #e4e7ed;
  --fc-button-bg-color: #409eff;
  --fc-button-border-color: #409eff;
  --fc-button-hover-bg-color: #66b1ff;
  --fc-button-hover-border-color: #66b1ff;
  --fc-button-active-bg-color: #3a8ee6;
  --fc-button-active-border-color: #3a8ee6;
}

.day-detail {
  padding: 0;
}

.day-stats {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.day-stat-item {
  text-align: center;
}

.day-stat-item .value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.day-stat-item .value.negative {
  color: #f56565;
}

.day-stat-item .label {
  font-size: 12px;
  color: #909399;
}

.day-records h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.legend-card {
  border-radius: 8px;
}

.legend-items {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.profit-day {
  background-color: #67c23a;
}

.loss-day {
  background-color: #f56c6c;
}

.break-even-day {
  background-color: #e6a23c;
}

.no-bet-day {
  background-color: #dcdfe6;
}

.text-red-500 {
  color: #f56565;
}

.text-green-500 {
  color: #48bb78;
}
</style>

<style>
/* 全局日历事件样式 */
.fc-event.profit-event {
  background-color: #67c23a !important;
  border-color: #67c23a !important;
  color: white !important;
}

.fc-event.loss-event {
  background-color: #f56c6c !important;
  border-color: #f56c6c !important;
  color: white !important;
}

.fc-event.break-even-event {
  background-color: #e6a23c !important;
  border-color: #e6a23c !important;
  color: white !important;
}

.fc-daygrid-event {
  font-size: 12px !important;
  padding: 2px 4px !important;
}
</style>