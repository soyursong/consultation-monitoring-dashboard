import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
}

export function KpiCard({ title, value, change, changeLabel = "전월 대비", icon: Icon, iconColor = "text-blue-600 bg-blue-100" }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <p className={cn(
                "text-xs font-medium",
                change >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}% {changeLabel}
              </p>
            )}
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", iconColor)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
