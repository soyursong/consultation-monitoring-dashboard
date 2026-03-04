export function formatKRW(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억`
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만원`
  }
  return `${amount.toLocaleString()}원`
}

export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR')
}

export function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}분`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}
