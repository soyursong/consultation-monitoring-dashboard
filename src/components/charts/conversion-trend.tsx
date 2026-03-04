"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface TrendData {
  date: string
  consultations: number
  conversions: number
  conversionRate: number
}

interface ConversionTrendProps {
  data: TrendData[]
}

export function ConversionTrend({ data }: ConversionTrendProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">일별 상담 추이</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value, name) => {
                  const v = Number(value) || 0
                  if (name === "conversionRate") return [`${v.toFixed(1)}%`, "전환율"]
                  if (name === "consultations") return [v, "상담건수"]
                  return [v, "전환건수"]
                }}
                labelFormatter={(label) => `날짜: ${label}`}
              />
              <Legend
                formatter={(value) => {
                  if (value === "consultations") return "상담건수"
                  if (value === "conversionRate") return "전환율"
                  return value
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="consultations"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="conversionRate"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
