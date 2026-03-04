"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateDemoConsultations, demoCounselors, channelLabels } from "@/lib/demo-data"
import { formatKRW, formatPercent, formatDuration } from "@/lib/format"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { Channel } from "@/lib/types/database"

export default function CounselorsPage() {
  const [period, setPeriod] = useState("30d")
  const allConsultations = useMemo(() => generateDemoConsultations(), [])

  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30

  const filtered = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString().split("T")[0]
    return allConsultations.filter((c) => c.consultation_date >= cutoffStr)
  }, [allConsultations, days])

  // 상담사별 성과 집계
  const counselorStats = useMemo(() => {
    return demoCounselors.map((counselor) => {
      const myConsultations = filtered.filter((c) => c.counselor_id === counselor.id)
      const total = myConsultations.length
      const converted = myConsultations.filter((c) => c.outcome === "CONVERTED").length
      const revenue = myConsultations.reduce((sum, c) => sum + c.paid_amount, 0)
      const avgDuration = total > 0
        ? myConsultations.reduce((sum, c) => sum + (c.duration_minutes || 0), 0) / total
        : 0
      const avgTicket = converted > 0 ? revenue / converted : 0

      // 채널별 분석
      const channelBreakdown: Record<string, { total: number; converted: number }> = {}
      myConsultations.forEach((c) => {
        if (!channelBreakdown[c.channel]) {
          channelBreakdown[c.channel] = { total: 0, converted: 0 }
        }
        channelBreakdown[c.channel].total++
        if (c.outcome === "CONVERTED") channelBreakdown[c.channel].converted++
      })

      return {
        ...counselor,
        total,
        converted,
        conversionRate: total > 0 ? (converted / total) * 100 : 0,
        revenue,
        avgDuration: Math.round(avgDuration),
        avgTicket,
        channelBreakdown,
      }
    }).sort((a, b) => b.revenue - a.revenue)
  }, [filtered])

  // 전환율 비교 차트 데이터
  const conversionChartData = counselorStats.map((s) => ({
    name: s.name,
    conversionRate: Math.round(s.conversionRate * 10) / 10,
    fill: s.conversionRate >= 40 ? "#10b981" : s.conversionRate >= 25 ? "#f59e0b" : "#ef4444",
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">상담사 성과</h1>
          <p className="text-sm text-muted-foreground">상담사별 성과를 비교하고 분석합니다</p>
        </div>
        <DateRangePicker period={period} onPeriodChange={setPeriod} />
      </div>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">성과 테이블</TabsTrigger>
          <TabsTrigger value="chart">전환율 비교</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">순위</TableHead>
                    <TableHead>상담사</TableHead>
                    <TableHead>지점</TableHead>
                    <TableHead className="text-right">상담건수</TableHead>
                    <TableHead className="text-right">전환건수</TableHead>
                    <TableHead className="text-right">전환율</TableHead>
                    <TableHead className="text-right">매출</TableHead>
                    <TableHead className="text-right">객단가</TableHead>
                    <TableHead className="text-right">평균시간</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {counselorStats.map((s, i) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Badge variant={i < 3 ? "default" : "secondary"}>
                          {i + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-sm">{s.branch}</TableCell>
                      <TableCell className="text-right">{s.total}</TableCell>
                      <TableCell className="text-right">{s.converted}</TableCell>
                      <TableCell className="text-right">
                        <span className={
                          s.conversionRate >= 40 ? "text-green-600 font-medium" :
                          s.conversionRate >= 25 ? "text-yellow-600" : "text-red-600"
                        }>
                          {formatPercent(s.conversionRate)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatKRW(s.revenue)}</TableCell>
                      <TableCell className="text-right">{formatKRW(s.avgTicket)}</TableCell>
                      <TableCell className="text-right">{formatDuration(s.avgDuration)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 채널별 상세 분석 */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {counselorStats.slice(0, 4).map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {s.name} - 채널별 전환율
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(s.channelBreakdown)
                      .sort(([, a], [, b]) => b.total - a.total)
                      .slice(0, 5)
                      .map(([ch, data]) => {
                        const rate = data.total > 0 ? (data.converted / data.total) * 100 : 0
                        return (
                          <div key={ch} className="flex items-center gap-3">
                            <span className="w-24 text-xs text-muted-foreground">
                              {channelLabels[ch as Channel]}
                            </span>
                            <div className="flex-1 h-2 rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${Math.min(rate, 100)}%` }}
                              />
                            </div>
                            <span className="w-16 text-right text-xs font-medium">
                              {rate.toFixed(0)}% ({data.converted}/{data.total})
                            </span>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chart" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">상담사별 전환율 비교</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conversionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => [`${v}%`, "전환율"]} />
                    <Bar dataKey="conversionRate" radius={[4, 4, 0, 0]}>
                      {conversionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
