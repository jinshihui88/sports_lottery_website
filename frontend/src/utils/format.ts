import dayjs from 'dayjs'

/**
 * 格式化日期
 */
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD') => {
  return dayjs(date).format(format)
}

/**
 * 格式化日期时间
 */
export const formatDateTime = (date: string | Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 格式化金额
 */
export const formatMoney = (amount: number, precision = 2) => {
  return amount.toFixed(precision)
}

/**
 * 格式化百分比
 */
export const formatPercent = (value: number, precision = 1) => {
  return (value * 100).toFixed(precision) + '%'
}

/**
 * 格式化数字
 */
export const formatNumber = (num: number) => {
  return num.toLocaleString()
}

/**
 * 计算盈亏
 */
export const calculateProfit = (betAmount: number, actualWinning: number, result: string) => {
  if (result === '中奖') {
    return actualWinning - betAmount
  } else if (result === '未中奖') {
    return -betAmount
  }
  return 0 // 待开奖
}

/**
 * 计算胜率
 */
export const calculateWinRate = (winCount: number, totalCount: number) => {
  if (totalCount === 0) return 0
  return (winCount / totalCount) * 100
}

/**
 * 计算投资回报率
 */
export const calculateROI = (profit: number, investment: number) => {
  if (investment === 0) return 0
  return (profit / investment) * 100
}