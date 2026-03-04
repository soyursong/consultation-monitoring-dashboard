"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

interface DateRangePickerProps {
  period: string
  onPeriodChange: (period: string) => void
}

const periods = [
  { value: "7d", label: "7일" },
  { value: "30d", label: "30일" },
  { value: "90d", label: "90일" },
]

export function DateRangePicker({ period, onPeriodChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <div className="flex rounded-lg border">
        {periods.map((p) => (
          <Button
            key={p.value}
            variant={period === p.value ? "default" : "ghost"}
            size="sm"
            className="rounded-none first:rounded-l-lg last:rounded-r-lg"
            onClick={() => onPeriodChange(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
