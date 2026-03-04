"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Mic,
  Settings,
  Stethoscope,
  LogOut,
} from "lucide-react"

const navigation = [
  { name: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { name: "상담 관리", href: "/dashboard/consultations", icon: MessageSquare },
  { name: "상담사 성과", href: "/dashboard/counselors", icon: Users },
  { name: "녹취 관리", href: "/dashboard/recordings", icon: Mic },
  { name: "설정", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6">
        <Stethoscope className="h-6 w-6 text-white" />
        <span className="text-lg font-bold text-white">상담 모니터링</span>
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
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-medium text-white">
            관
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">관리자</p>
            <p className="text-xs text-gray-400 truncate">admin@clinic.com</p>
          </div>
          <Link href="/login" className="text-gray-400 hover:text-white">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
