"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { formatKRW } from "@/lib/format"

interface CounselorData {
  name: string
  consultations: number
  conversions: number
  revenue: number
  conversionRate: number
}

interface CounselorRankingProps {
  data: CounselorData[]
}

export function CounselorRanking({ data }: CounselorRankingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">상담사별 성과</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={60}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value, name) => {
                  const v = Number(value) || 0
                  if (name === "revenue") return [formatKRW(v), "매출"]
                  if (name === "conversions") return [v, "전환"]
                  return [v, "상담"]
                }}
              />
              <Legend
                formatter={(value) => {
                  if (value === "consultations") return "상담건수"
                  if (value === "conversions") return "전환건수"
                  if (value === "revenue") return "매출"
                  return value
                }}
              />
              <Bar dataKey="consultations" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="conversions" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
