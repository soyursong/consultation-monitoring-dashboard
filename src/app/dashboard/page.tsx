"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { HardDrive, Wifi, WifiOff, AlertTriangle, FileAudio, Clock } from "lucide-react"

// --- 데모 데이터 (Supabase 연결 전) ---
const DEMO_DEVICES = [
  { id: "d1", room: "R01", name: "상담실 1", status: "online" as const, lastHeartbeat: "2분 전", todayClips: 12, diskFreeGb: 85.3 },
  { id: "d2", room: "R02", name: "상담실 2", status: "online" as const, lastHeartbeat: "1분 전", todayClips: 8, diskFreeGb: 92.1 },
  { id: "d3", room: "R03", name: "상담실 3", status: "offline" as const, lastHeartbeat: "3시간 전", todayClips: 0, diskFreeGb: 45.2 },
  { id: "d4", room: "R04", name: "상담실 4", status: "online" as const, lastHeartbeat: "30초 전", todayClips: 15, diskFreeGb: 78.9 },
  { id: "d5", room: "R05", name: "상담실 5", status: "error" as const, lastHeartbeat: "5시간 전", todayClips: 3, diskFreeGb: 12.4 },
]

const statusConfig = {
  online: { label: "정상", color: "bg-emerald-500", textColor: "text-emerald-600", icon: Wifi },
  offline: { label: "오프라인", color: "bg-gray-400", textColor: "text-gray-500", icon: WifiOff },
  error: { label: "오류", color: "bg-red-500", textColor: "text-red-600", icon: AlertTriangle },
}

export default function DashboardPage() {
  const onlineCount = DEMO_DEVICES.filter(d => d.status === "online").length
  const offlineCount = DEMO_DEVICES.filter(d => d.status === "offline").length
  const errorCount = DEMO_DEVICES.filter(d => d.status === "error").length
  const totalClips = DEMO_DEVICES.reduce((s, d) => s + d.todayClips, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-sm text-muted-foreground">오블리브 풋센터 디바이스 현황</p>
      </div>

      {/* 데모 데이터 안내 */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        현재 표시되는 데이터는 데모(가짜) 데이터입니다. Windows PC에 MediRec 앱을 설치하면 실제 데이터로 전환됩니다.
      </div>

      {/* KPI 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 디바이스</p>
                <p className="text-3xl font-bold">{DEMO_DEVICES.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <HardDrive className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">정상 가동</p>
                <p className="text-3xl font-bold text-emerald-600">{onlineCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Wifi className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">오류 / 오프라인</p>
                <p className="text-3xl font-bold text-red-600">{errorCount + offlineCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">오늘 녹취 클립</p>
                <p className="text-3xl font-bold">{totalClips}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <FileAudio className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 디바이스 목록 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">상담실별 디바이스 현황</CardTitle>
          <Link href="/dashboard/devices">
            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">상세 보기</Badge>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DEMO_DEVICES.map((device) => {
              const config = statusConfig[device.status]
              const StatusIcon = config.icon
              return (
                <div key={device.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${config.color}`} />
                    <div>
                      <p className="font-medium">{device.room} — {device.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {device.lastHeartbeat}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-muted-foreground">오늘 클립</p>
                      <p className="font-medium">{device.todayClips}개</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">디스크</p>
                      <p className={`font-medium ${device.diskFreeGb < 20 ? "text-red-600" : ""}`}>
                        {device.diskFreeGb}GB
                      </p>
                    </div>
                    <Badge variant={device.status === "online" ? "default" : device.status === "error" ? "destructive" : "secondary"}>
                      {config.label}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
