"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  ClipboardCheck,
  Brain,
  Settings,
  LogOut,
  Footprints,
} from "lucide-react"

const navigation = [
  { name: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { name: "세일즈 담당자", href: "/dashboard/reps", icon: Users },
  { name: "일일 확인", href: "/dashboard/daily-review", icon: ClipboardCheck },
  { name: "상담 관리", href: "/dashboard/calls", icon: PhoneCall },
  { name: "AI 분석", href: "/dashboard/ai-analysis", icon: Brain },
  { name: "설정", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
          <Footprints className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-white">풋케어 모니터링</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-medium text-white">
            관
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">관리자</p>
            <p className="text-xs text-slate-400 truncate">풋케어센터 강남점</p>
          </div>
          <Link href="/login" className="text-slate-400 hover:text-white">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
