import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'
import type { ApiResponse, BetRecord, SearchParams, PaginationParams } from '@/types'

interface BettingRecordApiItem {
  id: number
  userId: number
  betDate?: string
  date?: string
  sportType?: string
  league: string
  homeTeam: string
  awayTeam: string
  betType: string
  betOption?: string
  betAmount: number
  odds: number
  result?: string | number | null
  actualWinnings?: number
  actualWinning?: number
  winAmount?: number
  profitLoss?: number
  profit?: number
  createTime?: string
  createdAt?: string
  updateTime?: string
  updatedAt?: string
}

interface BettingRecordPage {
  records: BettingRecordApiItem[]
  total: number
  current: number
  size: number
}

type BetRecordForm = Omit<BetRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>

interface BettingRecordRequest {
  betDate: string
  league: string
  homeTeam: string
  awayTeam: string
  betType: string
  betOption: string
  betAmount: number
  odds: number
  result: number
  winAmount?: number
  sportType: string
}

const resultParamMap: Record<string, number> = {
  待开奖: 0,
  中奖: 1,
  未中奖: 2
}

const resultTextMap: Record<string, BetRecord['result']> = {
  0: '待开奖',
  1: '中奖',
  2: '未中奖',
  WIN: '中奖',
  LOSE: '未中奖',
  DRAW: '待开奖'
}

const sportTextMap: Record<string, BetRecord['sportType']> = {
  football: '足球',
  basketball: '篮球',
  足球: '足球',
  篮球: '篮球'
}

const sportParamMap: Record<BetRecord['sportType'], string> = {
  足球: 'football',
  篮球: 'basketball'
}

const toBettingRecordRequest = (record: BetRecordForm): BettingRecordRequest => ({
  betDate: record.date,
  league: record.league,
  homeTeam: record.homeTeam,
  awayTeam: record.awayTeam,
  betType: record.betType,
  betOption: record.betOption,
  betAmount: record.betAmount,
  odds: record.odds,
  result: resultParamMap[record.result],
  winAmount: record.result === '中奖' ? record.actualWinning || 0 : undefined,
  sportType: sportParamMap[record.sportType]
})

const toBetRecord = (record: BettingRecordApiItem): BetRecord => ({
  id: record.id,
  userId: record.userId,
  date: record.betDate || record.date || '',
  sportType: sportTextMap[record.sportType || ''] || '足球',
  league: record.league,
  homeTeam: record.homeTeam,
  awayTeam: record.awayTeam,
  betType: record.betType as BetRecord['betType'],
  betOption: record.betOption || '',
  betAmount: Number(record.betAmount || 0),
  odds: Number(record.odds || 0),
  result: record.result ? (resultTextMap[record.result] || record.result as BetRecord['result']) : '待开奖',
  actualWinning: Number(record.winAmount ?? record.actualWinnings ?? record.actualWinning ?? 0),
  profit: Number(record.profitLoss ?? record.profit ?? 0),
  createdAt: record.createTime || record.createdAt || '',
  updatedAt: record.updateTime || record.updatedAt || ''
})

export const useRecordsStore = defineStore('records', () => {
  const records = ref<BetRecord[]>([])
  const loading = ref(false)
  const pagination = ref<PaginationParams>({
    page: 1,
    pageSize: 15,
    total: 0
  })

  // 模拟数据
  const mockRecords: BetRecord[] = [
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
    },
    {
      id: 3,
      userId: 1,
      date: '2024-01-18',
      sportType: '足球',
      league: '西甲',
      homeTeam: '皇马',
      awayTeam: '巴萨',
      betType: '让球',
      betOption: '主队-1',
      betAmount: 300,
      odds: 1.85,
      result: '中奖',
      actualWinning: 555,
      profit: 255,
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-18T21:45:00Z'
    }
  ]

  // 计算属性
  const totalStats = computed(() => {
    const total = records.value.reduce((acc, record) => {
      acc.totalBets += 1
      acc.totalAmount += record.betAmount
      acc.totalWinning += record.actualWinning || 0
      acc.netProfit += record.profit || 0
      if (record.result === '中奖') acc.winCount += 1
      return acc
    }, {
      totalBets: 0,
      totalAmount: 0,
      totalWinning: 0,
      netProfit: 0,
      winCount: 0
    })

    return {
      ...total,
      winRate: total.totalBets > 0 ? (total.winCount / total.totalBets) * 100 : 0,
      avgBetAmount: total.totalBets > 0 ? total.totalAmount / total.totalBets : 0
    }
  })

  // 获取记录列表
  const fetchRecords = async (params?: SearchParams & PaginationParams) => {
    loading.value = true
    try {
      const queryParams: Record<string, string | number> = {
        current: params?.page || pagination.value.page,
        size: params?.pageSize || pagination.value.pageSize
      }

      if (params?.league) {
        queryParams.league = params.league
      }
      if (params?.betType) {
        queryParams.betType = params.betType
      }
      if (params?.result) {
        queryParams.result = resultParamMap[params.result]
      }
      if (params?.dateRange) {
        const [startDate, endDate] = params.dateRange
        queryParams.startDate = startDate
        queryParams.endDate = endDate
      }

      const res = await api.get('/betting/records', { params: queryParams }) as ApiResponse<BettingRecordPage>
      if (res.code !== 200 || !res.data) {
        return { success: false, error: res.message || '获取记录失败' }
      }

      records.value = res.data.records.map(toBetRecord)
      pagination.value = {
        page: Number(res.data.current || queryParams.current),
        pageSize: Number(res.data.size || queryParams.size),
        total: Number(res.data.total || 0)
      }

      return { success: true, data: records.value }
    } catch (error) {
      return { success: false, error: '获取记录失败' }
    } finally {
      loading.value = false
    }
  }

  // 添加记录
  const addRecord = async (record: BetRecordForm) => {
    try {
      const res = await api.post('/betting/records', toBettingRecordRequest(record)) as ApiResponse<string>
      if (res.code !== 200) {
        return { success: false, error: res.message || '添加记录失败' }
      }

      await fetchRecords({
        page: 1,
        pageSize: pagination.value.pageSize
      })

      return { success: true, data: res.data }
    } catch (error) {
      return { success: false, error: '添加记录失败' }
    }
  }

  // 更新记录
  const updateRecord = async (id: number, updates: BetRecordForm) => {
    try {
      const res = await api.put(`/betting/records/${id}`, toBettingRecordRequest(updates)) as ApiResponse<string>
      if (res.code !== 200) {
        return { success: false, error: res.message || '更新记录失败' }
      }

      await fetchRecords({
        page: pagination.value.page,
        pageSize: pagination.value.pageSize
      })

      return { success: true, data: res.data }
    } catch (error) {
      return { success: false, error: '更新记录失败' }
    }
  }

  // 删除记录
  const deleteRecord = async (id: number) => {
    try {
      const res = await api.delete(`/betting/records/${id}`) as ApiResponse<string>
      if (res.code !== 200) {
        return { success: false, error: res.message || '删除记录失败' }
      }

      await fetchRecords({
        page: pagination.value.page,
        pageSize: pagination.value.pageSize
      })

      return { success: true, data: res.data }
    } catch (error) {
      return { success: false, error: '删除记录失败' }
    }
  }

  // 批量添加记录
  const batchAddRecords = async (recordsList: Omit<BetRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      if (recordsList.length === 0) {
        return { success: false, error: '请先添加比赛记录' }
      }

      const res = await api.post('/betting/records/batch', recordsList.map(toBettingRecordRequest)) as ApiResponse<string>
      if (res.code !== 200) {
        return { success: false, error: res.message || '批量添加记录失败' }
      }

      await fetchRecords({
        page: 1,
        pageSize: pagination.value.pageSize
      })

      return { success: true, data: res.data }
    } catch (error) {
      return { success: false, error: '批量添加记录失败' }
    }
  }

  return {
    records,
    loading,
    pagination,
    totalStats,
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    batchAddRecords
  }
})
