"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { channelLabels, channelColors } from "@/lib/demo-data"

interface ChannelData {
  channel: string
  count: number
  converted: number
}

interface ChannelBreakdownProps {
  data: ChannelData[]
}

export function ChannelBreakdown({ data }: ChannelBreakdownProps) {
  const chartData = data.map((d) => ({
    name: channelLabels[d.channel as keyof typeof channelLabels] || d.channel,
    value: d.count,
    converted: d.converted,
    color: channelColors[d.channel] || "#6b7280",
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">채널별 상담 비율</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, _name, props) => {
                  const v = Number(value) || 0
                  const converted = (props?.payload as { converted?: number })?.converted || 0
                  const rate = converted > 0 ? ((converted / v) * 100).toFixed(1) : "0"
                  return [`${v}건 (전환율 ${rate}%)`, "상담건수"]
                }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
