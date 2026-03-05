"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    <div className="flex gap-1 rounded-lg border bg-white p-1">
      {periods.map((p) => (
        <Button
          key={p.value}
          variant="ghost"
          size="sm"
          onClick={() => onPeriodChange(p.value)}
          className={cn(
            "h-8 px-3 text-xs",
            period === p.value
              ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {p.label}
        </Button>
      ))}
    </div>
  )
}
