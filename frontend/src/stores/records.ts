import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BetRecord, SearchParams, PaginationParams } from '@/types'

export const useRecordsStore = defineStore('records', () => {
  const records = ref<BetRecord[]>([])
  const loading = ref(false)
  const pagination = ref<PaginationParams>({
    page: 1,
    pageSize: 10,
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
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filteredRecords = [...mockRecords]
      
      // 应用筛选条件
      if (params?.sportType) {
        filteredRecords = filteredRecords.filter(r => r.sportType === params.sportType)
      }
      if (params?.league) {
        filteredRecords = filteredRecords.filter(r => r.league.includes(params.league))
      }
      if (params?.betType) {
        filteredRecords = filteredRecords.filter(r => r.betType === params.betType)
      }
      if (params?.result) {
        filteredRecords = filteredRecords.filter(r => r.result === params.result)
      }
      if (params?.dateRange) {
        const [startDate, endDate] = params.dateRange
        filteredRecords = filteredRecords.filter(r => 
          r.date >= startDate && r.date <= endDate
        )
      }

      // 分页
      const page = params?.page || 1
      const pageSize = params?.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize

      records.value = filteredRecords.slice(start, end)
      pagination.value = {
        page,
        pageSize,
        total: filteredRecords.length
      }

      return { success: true, data: records.value }
    } catch (error) {
      return { success: false, error: '获取记录失败' }
    } finally {
      loading.value = false
    }
  }

  // 添加记录
  const addRecord = async (record: Omit<BetRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRecord: BetRecord = {
        ...record,
        id: Date.now(),
        userId: 1,
        profit: record.result === '中奖' ? (record.actualWinning || 0) - record.betAmount : -record.betAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockRecords.unshift(newRecord)
      await fetchRecords() // 刷新列表

      return { success: true, data: newRecord }
    } catch (error) {
      return { success: false, error: '添加记录失败' }
    }
  }

  // 更新记录
  const updateRecord = async (id: number, updates: Partial<BetRecord>) => {
    try {
      const index = mockRecords.findIndex(r => r.id === id)
      if (index === -1) {
        return { success: false, error: '记录不存在' }
      }

      const updatedRecord = {
        ...mockRecords[index],
        ...updates,
        profit: updates.result === '中奖' 
          ? (updates.actualWinning || 0) - (updates.betAmount || mockRecords[index].betAmount)
          : -(updates.betAmount || mockRecords[index].betAmount),
        updatedAt: new Date().toISOString()
      }

      mockRecords[index] = updatedRecord
      await fetchRecords() // 刷新列表

      return { success: true, data: updatedRecord }
    } catch (error) {
      return { success: false, error: '更新记录失败' }
    }
  }

  // 删除记录
  const deleteRecord = async (id: number) => {
    try {
      const index = mockRecords.findIndex(r => r.id === id)
      if (index === -1) {
        return { success: false, error: '记录不存在' }
      }

      mockRecords.splice(index, 1)
      await fetchRecords() // 刷新列表

      return { success: true }
    } catch (error) {
      return { success: false, error: '删除记录失败' }
    }
  }

  // 批量添加记录
  const batchAddRecords = async (recordsList: Omit<BetRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      const newRecords = recordsList.map(record => ({
        ...record,
        id: Date.now() + Math.random(),
        userId: 1,
        profit: record.result === '中奖' ? (record.actualWinning || 0) - record.betAmount : -record.betAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))

      mockRecords.unshift(...newRecords)
      await fetchRecords() // 刷新列表

      return { success: true, data: newRecords }
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