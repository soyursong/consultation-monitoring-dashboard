"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { generateDemoCalls, demoSalesReps } from "@/lib/demo-data"
import { formatKRW, formatPercent } from "@/lib/format"
import { DollarSign, TrendingUp, Users, Megaphone } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function DashboardPage() {
  const [period, setPeriod] = useState("30d")
  const allCalls = useMemo(() => generateDemoCalls(), [])
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30

  const filtered = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString().split("T")[0]
    return allCalls.filter((c) => c.call_date >= cutoffStr)
  }, [allCalls, days])

  const prev = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - days * 2)
    const end = new Date()
    end.setDate(end.getDate() - days)
    return allCalls.filter(
      (c) => c.call_date >= start.toISOString().split("T")[0] && c.call_date < end.toISOString().split("T")[0]
    )
  }, [allCalls, days])

  const calcKpi = (calls: typeof filtered) => {
    const total = calls.length
    const paid = calls.filter((c) => c.payment_status === "paid" || c.payment_status === "partial")
    const paidCount = paid.length
    const revenue = paid.reduce((s, c) => s + c.payment_amount, 0)
    const avgTicket = paidCount > 0 ? revenue / paidCount : 0
    const conversionRate = total > 0 ? (paidCount / total) * 100 : 0
    return { total, paidCount, revenue, avgTicket, conversionRate }
  }

  const kpiAll = calcKpi(filtered)
  const kpiAllPrev = calcKpi(prev)
  const adNew = filtered.filter((c) => c.referral_source === "ad" && c.patient_type === "new")
  const adNewPrev = prev.filter((c) => c.referral_source === "ad" && c.patient_type === "new")
  const kpiAd = calcKpi(adNew)
  const kpiAdPrev = calcKpi(adNewPrev)

  const pctChange = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : 0)

  // 패키지별 성과
  const packageStats = useMemo(() => {
    const map: Record<string, { count: number; revenue: number; converted: number }> = {}
    filtered.forEach((c) => {
      const name = c.package_name || "기타"
      if (!map[name]) map[name] = { count: 0, revenue: 0, converted: 0 }
      map[name].count++
      if (c.payment_status !== "unpaid") {
        map[name].converted++
        map[name].revenue += c.payment_amount
      }
    })
    return Object.entries(map)
      .map(([name, d]) => ({ name, ...d, convRate: d.count > 0 ? (d.converted / d.count) * 100 : 0 }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filtered])

  // 이탈 사유
  const dropStats = useMemo(() => {
    const map: Record<string, number> = {}
    filtered.forEach((c) => {
      if (c.drop_reason) {
        map[c.drop_reason] = (map[c.drop_reason] || 0) + 1
      }
    })
    return Object.entries(map)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [filtered])

  const dropColors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#06b6d4", "#8b5cf6"]

  // 담당자별 매출
  const repStats = useMemo(() => {
    return demoSalesReps.map((rep) => {
      const myCalls = filtered.filter((c) => c.sales_rep_id === rep.id)
      const paid = myCalls.filter((c) => c.payment_status !== "unpaid")
      return {
        name: rep.name,
        revenue: paid.reduce((s, c) => s + c.payment_amount, 0),
        count: myCalls.length,
        converted: paid.length,
      }
    }).sort((a, b) => b.revenue - a.revenue)
  }, [filtered])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-muted-foreground">상담 현황 및 성과를 한눈에 확인하세요</p>
        </div>
        <DateRangePicker period={period} onPeriodChange={setPeriod} />
      </div>

      {/* 전체 고객 KPI */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          전체 고객
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="총 상담건수" value={`${kpiAll.total}건`} change={pctChange(kpiAll.total, kpiAllPrev.total)} icon={Users} iconColor="text-blue-600 bg-blue-100" />
          <KpiCard title="결제 전환율" value={formatPercent(kpiAll.conversionRate)} change={kpiAll.conversionRate - kpiAllPrev.conversionRate} changeLabel="(p.p)" icon={TrendingUp} iconColor="text-emerald-600 bg-emerald-100" />
          <KpiCard title="총 매출" value={formatKRW(kpiAll.revenue)} change={pctChange(kpiAll.revenue, kpiAllPrev.revenue)} icon={DollarSign} iconColor="text-purple-600 bg-purple-100" />
          <KpiCard title="객단가" value={formatKRW(kpiAll.avgTicket)} change={pctChange(kpiAll.avgTicket, kpiAllPrev.avgTicket)} icon={DollarSign} iconColor="text-orange-600 bg-orange-100" />
        </div>
      </div>

      {/* 광고 유입 신규 KPI */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Megaphone className="h-4 w-4" />
          광고 유입 신규 고객
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="광고 신규 상담" value={`${kpiAd.total}건`} subtitle={`전체 대비 ${kpiAll.total > 0 ? ((kpiAd.total / kpiAll.total) * 100).toFixed(0) : 0}%`} change={pctChange(kpiAd.total, kpiAdPrev.total)} icon={Megaphone} iconColor="text-rose-600 bg-rose-100" />
          <KpiCard title="광고 신규 전환율" value={formatPercent(kpiAd.conversionRate)} change={kpiAd.conversionRate - kpiAdPrev.conversionRate} changeLabel="(p.p)" icon={TrendingUp} iconColor="text-emerald-600 bg-emerald-100" />
          <KpiCard title="광고 신규 매출" value={formatKRW(kpiAd.revenue)} change={pctChange(kpiAd.revenue, kpiAdPrev.revenue)} icon={DollarSign} iconColor="text-purple-600 bg-purple-100" />
          <KpiCard title="광고 신규 객단가" value={formatKRW(kpiAd.avgTicket)} change={pctChange(kpiAd.avgTicket, kpiAdPrev.avgTicket)} icon={DollarSign} iconColor="text-orange-600 bg-orange-100" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 담당자별 매출 */}
        <Card>
          <CardHeader><CardTitle className="text-base">담당자별 매출</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={repStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
                  <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [formatKRW(Number(v) || 0), "매출"]} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 주요 이탈 사유 */}
        <Card>
          <CardHeader><CardTitle className="text-base">주요 이탈 사유</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dropStats} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="count" nameKey="reason">
                    {dropStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={dropColors[index % dropColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}건`, "건수"]} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" formatter={(value) => <span className="text-xs">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 패키지별 성과 */}
      <Card>
        <CardHeader><CardTitle className="text-base">패키지별 성과</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">패키지</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">상담건수</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">전환건수</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">전환율</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">매출</th>
                </tr>
              </thead>
              <tbody>
                {packageStats.map((p) => (
                  <tr key={p.name} className="border-b last:border-0">
                    <td className="py-3 font-medium">{p.name}</td>
                    <td className="py-3 text-right">{p.count}</td>
                    <td className="py-3 text-right">{p.converted}</td>
                    <td className="py-3 text-right">
                      <span className={p.convRate >= 40 ? "text-emerald-600 font-medium" : p.convRate >= 25 ? "text-yellow-600" : "text-red-500"}>
                        {formatPercent(p.convRate)}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium">{formatKRW(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
