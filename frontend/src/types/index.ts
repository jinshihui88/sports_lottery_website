// 用户类型
export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  createdAt: string
}

// 投注记录类型
export interface BetRecord {
  id: number
  userId: number
  date: string
  sportType: '足球' | '篮球'
  league: string
  homeTeam: string
  awayTeam: string
  betType: '胜平负' | '让球' | '大小球' | '比分' | '总进球'
  betOption: string
  betAmount: number
  odds: number
  result: '待开奖' | '中奖' | '未中奖'
  actualWinning?: number
  profit?: number
  createdAt: string
  updatedAt: string
}

// 统计数据类型
export interface Statistics {
  totalBets: number
  totalAmount: number
  totalWinning: number
  netProfit: number
  winRate: number
  avgBetAmount: number
  bestDay: string
  worstDay: string
}

// 图表数据类型
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string
    fill?: boolean
  }[]
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

// 搜索筛选参数
export interface SearchParams {
  dateRange?: [string, string]
  sportType?: string
  league?: string
  betType?: string
  result?: string
  keyword?: string
}