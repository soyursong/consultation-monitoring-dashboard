import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
}

export function KpiCard({ title, value, subtitle, change, changeLabel = "전월 대비", icon: Icon, iconColor = "text-blue-600 bg-blue-100" }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {change !== undefined && (
              <p className={cn(
                "text-xs font-medium",
                change >= 0 ? "text-emerald-600" : "text-red-500"
              )}>
                {change >= 0 ? "+" : ""}{Math.abs(change).toFixed(1)}% {changeLabel}
              </p>
            )}
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
