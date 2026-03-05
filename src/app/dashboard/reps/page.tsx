"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { generateDemoCalls, demoSalesReps } from "@/lib/demo-data"
import { formatKRW, formatPercent } from "@/lib/format"
import { User, TrendingUp, Clock, PhoneCall, DollarSign, AlertTriangle } from "lucide-react"

export default function RepsPage() {
  const [period, setPeriod] = useState("30d")
  const allCalls = useMemo(() => generateDemoCalls(), [])
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30

  const filtered = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return allCalls.filter((c) => c.call_date >= cutoff.toISOString().split("T")[0])
  }, [allCalls, days])

  const workDays = Math.max(1, Math.floor(days * 5 / 7))

  const repStats = useMemo(() => {
    return demoSalesReps.map((rep) => {
      const myCalls = filtered.filter((c) => c.sales_rep_id === rep.id)
      const total = myCalls.length
      const paid = myCalls.filter((c) => c.payment_status !== "unpaid")
      const paidCount = paid.length
      const revenue = paid.reduce((s, c) => s + c.payment_amount, 0)
      const avgTicket = paidCount > 0 ? revenue / paidCount : 0
      const convRate = total > 0 ? (paidCount / total) * 100 : 0
      const avgDuration = total > 0
        ? myCalls.reduce((s, c) => s + c.duration_seconds, 0) / total / 60
        : 0
      const dailyAvg = total / workDays

      // 광고 신규 필터
      const adNew = myCalls.filter((c) => c.referral_source === "ad" && c.patient_type === "new")
      const adPaid = adNew.filter((c) => c.payment_status !== "unpaid")
      const adRevenue = adPaid.reduce((s, c) => s + c.payment_amount, 0)
      const adConvRate = adNew.length > 0 ? (adPaid.length / adNew.length) * 100 : 0
      const adAvgTicket = adPaid.length > 0 ? adRevenue / adPaid.length : 0

      // DB 상담 건수 (인바운드/아웃바운드 TM 합산 - 여기서는 전체)
      const dbCount = myCalls.filter((c) => c.patient_type === "new").length

      // 이탈 사유
      const dropMap: Record<string, number> = {}
      myCalls.forEach((c) => {
        if (c.drop_reason) dropMap[c.drop_reason] = (dropMap[c.drop_reason] || 0) + 1
      })
      const topDrops = Object.entries(dropMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([reason, count]) => ({ reason, count }))

      return {
        ...rep,
        total,
        paidCount,
        revenue,
        avgTicket,
        convRate,
        avgDuration: Math.round(avgDuration),
        dailyAvg: Math.round(dailyAvg * 10) / 10,
        dbCount,
        adConvRate,
        adAvgTicket,
        topDrops,
      }
    }).sort((a, b) => b.revenue - a.revenue)
  }, [filtered, workDays])

  const maxRevenue = Math.max(...repStats.map((r) => r.revenue), 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">세일즈 담당자</h1>
          <p className="text-sm text-muted-foreground">담당자별 성과를 비교합니다</p>
        </div>
        <DateRangePicker period={period} onPeriodChange={setPeriod} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {repStats.map((rep, idx) => (
          <Card key={rep.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white">
                    {rep.name[0]}
                  </div>
                  <div>
                    <CardTitle className="text-base">{rep.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{rep.position}</p>
                  </div>
                </div>
                <Badge variant={idx === 0 ? "default" : "secondary"} className={idx === 0 ? "bg-emerald-600" : ""}>
                  #{idx + 1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 매출 프로그레스 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> 총 매출
                  </span>
                  <span className="text-sm font-bold">{formatKRW(rep.revenue)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${(rep.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>

              {/* 주요 지표 그리드 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1"><PhoneCall className="h-3 w-3" />일평균 건수</p>
                  <p className="text-lg font-bold">{rep.dailyAvg}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />DB 상담</p>
                  <p className="text-lg font-bold">{rep.dbCount}건</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />평균시간</p>
                  <p className="text-lg font-bold">{rep.avgDuration}분</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" />전환율</p>
                  <p className={`text-lg font-bold ${rep.convRate >= 40 ? "text-emerald-600" : rep.convRate >= 25 ? "text-yellow-600" : "text-red-500"}`}>
                    {formatPercent(rep.convRate)}
                  </p>
                </div>
              </div>

              {/* 전체 vs 광고 비교 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">전체 객단가</span>
                  <span className="font-medium">{formatKRW(rep.avgTicket)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">광고신규 전환율</span>
                  <span className={`font-medium ${rep.adConvRate >= 40 ? "text-emerald-600" : rep.adConvRate >= 25 ? "text-yellow-600" : "text-red-500"}`}>
                    {formatPercent(rep.adConvRate)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">광고신규 객단가</span>
                  <span className="font-medium">{formatKRW(rep.adAvgTicket)}</span>
                </div>
              </div>

              {/* 이탈 사유 */}
              {rep.topDrops.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> 주요 이탈 사유
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {rep.topDrops.map((d) => (
                      <Badge key={d.reason} variant="outline" className="text-[10px] px-2 py-0.5">
                        {d.reason} ({d.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
