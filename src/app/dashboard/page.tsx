"use client"

import { useMemo, useState } from "react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { ConversionTrend } from "@/components/charts/conversion-trend"
import { ChannelBreakdown } from "@/components/charts/channel-breakdown"
import { CounselorRanking } from "@/components/charts/counselor-ranking"
import { generateDemoConsultations, demoCounselors } from "@/lib/demo-data"
import { formatKRW, formatNumber, formatPercent } from "@/lib/format"
import { MessageSquare, TrendingUp, DollarSign, Clock } from "lucide-react"

export default function DashboardPage() {
  const [period, setPeriod] = useState("30d")

  const allConsultations = useMemo(() => generateDemoConsultations(), [])

  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30

  const filteredConsultations = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString().split("T")[0]
    return allConsultations.filter((c) => c.consultation_date >= cutoffStr)
  }, [allConsultations, days])

  // 이전 기간 데이터 (비교용)
  const prevConsultations = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - days * 2)
    const end = new Date()
    end.setDate(end.getDate() - days)
    const startStr = start.toISOString().split("T")[0]
    const endStr = end.toISOString().split("T")[0]
    return allConsultations.filter(
      (c) => c.consultation_date >= startStr && c.consultation_date < endStr
    )
  }, [allConsultations, days])

  // KPI 계산
  const kpis = useMemo(() => {
    const total = filteredConsultations.length
    const converted = filteredConsultations.filter((c) => c.outcome === "CONVERTED").length
    const revenue = filteredConsultations.reduce((sum, c) => sum + c.paid_amount, 0)
    const avgTicket = converted > 0 ? revenue / converted : 0
    const conversionRate = total > 0 ? (converted / total) * 100 : 0
    const avgDuration = total > 0
      ? filteredConsultations.reduce((sum, c) => sum + (c.duration_minutes || 0), 0) / total
      : 0

    const prevTotal = prevConsultations.length
    const prevConverted = prevConsultations.filter((c) => c.outcome === "CONVERTED").length
    const prevRevenue = prevConsultations.reduce((sum, c) => sum + c.paid_amount, 0)
    const prevConversionRate = prevTotal > 0 ? (prevConverted / prevTotal) * 100 : 0
    const prevAvgTicket = prevConverted > 0 ? prevRevenue / prevConverted : 0

    return {
      total,
      conversionRate,
      revenue,
      avgTicket,
      avgDuration,
      changes: {
        total: prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0,
        conversionRate: prevConversionRate > 0 ? conversionRate - prevConversionRate : 0,
        revenue: prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0,
        avgTicket: prevAvgTicket > 0 ? ((avgTicket - prevAvgTicket) / prevAvgTicket) * 100 : 0,
      },
    }
  }, [filteredConsultations, prevConsultations])

  // 일별 추이 데이터
  const trendData = useMemo(() => {
    const dateMap: Record<string, { total: number; converted: number }> = {}
    filteredConsultations.forEach((c) => {
      if (!dateMap[c.consultation_date]) {
        dateMap[c.consultation_date] = { total: 0, converted: 0 }
      }
      dateMap[c.consultation_date].total++
      if (c.outcome === "CONVERTED") dateMap[c.consultation_date].converted++
    })

    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date,
        consultations: d.total,
        conversions: d.converted,
        conversionRate: d.total > 0 ? (d.converted / d.total) * 100 : 0,
      }))
  }, [filteredConsultations])

  // 채널별 데이터
  const channelData = useMemo(() => {
    const channelMap: Record<string, { count: number; converted: number }> = {}
    filteredConsultations.forEach((c) => {
      if (!channelMap[c.channel]) {
        channelMap[c.channel] = { count: 0, converted: 0 }
      }
      channelMap[c.channel].count++
      if (c.outcome === "CONVERTED") channelMap[c.channel].converted++
    })

    return Object.entries(channelMap)
      .map(([channel, d]) => ({ channel, ...d }))
      .sort((a, b) => b.count - a.count)
  }, [filteredConsultations])

  // 상담사별 데이터
  const counselorData = useMemo(() => {
    const counselorMap: Record<string, { consultations: number; conversions: number; revenue: number }> = {}
    filteredConsultations.forEach((c) => {
      const counselor = demoCounselors.find((co) => co.id === c.counselor_id)
      const name = counselor?.name || "Unknown"
      if (!counselorMap[name]) {
        counselorMap[name] = { consultations: 0, conversions: 0, revenue: 0 }
      }
      counselorMap[name].consultations++
      if (c.outcome === "CONVERTED") {
        counselorMap[name].conversions++
        counselorMap[name].revenue += c.paid_amount
      }
    })

    return Object.entries(counselorMap)
      .map(([name, d]) => ({
        name,
        ...d,
        conversionRate: d.consultations > 0 ? (d.conversions / d.consultations) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredConsultations])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-muted-foreground">상담 현황 및 성과를 한눈에 확인하세요</p>
        </div>
        <DateRangePicker period={period} onPeriodChange={setPeriod} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="총 상담건수"
          value={`${formatNumber(kpis.total)}건`}
          change={kpis.changes.total}
          icon={MessageSquare}
          iconColor="text-blue-600 bg-blue-100"
        />
        <KpiCard
          title="전환율"
          value={formatPercent(kpis.conversionRate)}
          change={kpis.changes.conversionRate}
          changeLabel="전기간 대비 (p.p)"
          icon={TrendingUp}
          iconColor="text-green-600 bg-green-100"
        />
        <KpiCard
          title="총 매출"
          value={formatKRW(kpis.revenue)}
          change={kpis.changes.revenue}
          icon={DollarSign}
          iconColor="text-purple-600 bg-purple-100"
        />
        <KpiCard
          title="평균 객단가"
          value={formatKRW(kpis.avgTicket)}
          change={kpis.changes.avgTicket}
          icon={Clock}
          iconColor="text-orange-600 bg-orange-100"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ConversionTrend data={trendData} />
        <ChannelBreakdown data={channelData} />
      </div>

      {/* Counselor Ranking */}
      <CounselorRanking data={counselorData} />
    </div>
  )
}
