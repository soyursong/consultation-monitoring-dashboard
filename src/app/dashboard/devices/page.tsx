"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HardDrive, RefreshCw, Wifi, WifiOff, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Device, DeviceStatus } from "@/lib/types/medirec"

// --- 데모 데이터 (추후 Supabase 쿼리로 교체) ---

const DEMO_HOSPITALS = [
  { id: "h1", name: "오블리브 피부과" },
  { id: "h2", name: "연세 정형외과" },
]

const DEMO_CENTERS = [
  { id: "c1", hospital_id: "h1", name: "송도점" },
  { id: "c2", hospital_id: "h1", name: "종로점" },
  { id: "c3", hospital_id: "h2", name: "강남점" },
]

function generateDemoDevices(): Device[] {
  const now = new Date()
  const devices: Device[] = [
    {
      id: "dev-001",
      room_id: "r1",
      room_number: "101",
      center_id: "c1",
      center_name: "송도점",
      hospital_id: "h1",
      hospital_name: "오블리브 피부과",
      serial_number: "MR-2024-0001",
      firmware_version: "2.1.3",
      status: "online",
      last_heartbeat: new Date(now.getTime() - 30 * 1000).toISOString(),
      disk_total_gb: 128,
      disk_free_gb: 87.2,
      today_recording_count: 12,
      config: { recording_format: "wav", sample_rate: 44100, auto_upload: true, upload_interval_minutes: 5, max_recording_duration_minutes: 120 },
      is_active: true,
      created_at: "2024-01-15T09:00:00Z",
    },
    {
      id: "dev-002",
      room_id: "r2",
      room_number: "102",
      center_id: "c1",
      center_name: "송도점",
      hospital_id: "h1",
      hospital_name: "오블리브 피부과",
      serial_number: "MR-2024-0002",
      firmware_version: "2.1.3",
      status: "online",
      last_heartbeat: new Date(now.getTime() - 15 * 1000).toISOString(),
      disk_total_gb: 128,
      disk_free_gb: 45.6,
      today_recording_count: 8,
      config: { recording_format: "wav", sample_rate: 44100, auto_upload: true, upload_interval_minutes: 5, max_recording_duration_minutes: 120 },
      is_active: true,
      created_at: "2024-01-15T09:00:00Z",
    },
    {
      id: "dev-003",
      room_id: "r3",
      room_number: "201",
      center_id: "c1",
      center_name: "송도점",
      hospital_id: "h1",
      hospital_name: "오블리브 피부과",
      serial_number: "MR-2024-0003",
      firmware_version: "2.0.8",
      status: "offline",
      last_heartbeat: new Date(now.getTime() - 3600 * 1000 * 2).toISOString(),
      disk_total_gb: 128,
      disk_free_gb: 102.4,
      today_recording_count: 0,
      config: { recording_format: "wav", sample_rate: 44100, auto_upload: true, upload_interval_minutes: 5, max_recording_duration_minutes: 120 },
      is_active: true,
      created_at: "2024-02-01T09:00:00Z",
    },
    {
      id: "dev-004",
      room_id: "r4",
      room_number: "상담1",
      center_id: "c2",
      center_name: "종로점",
      hospital_id: "h1",
      hospital_name: "오블리브 피부과",
      serial_number: "MR-2024-0004",
      firmware_version: "2.1.3",
      status: "error",
      last_heartbeat: new Date(now.getTime() - 600 * 1000).toISOString(),
      disk_total_gb: 256,
      disk_free_gb: 12.1,
      today_recording_count: 3,
      config: { recording_format: "wav", sample_rate: 44100, auto_upload: true, upload_interval_minutes: 5, max_recording_duration_minutes: 120 },
      is_active: true,
      created_at: "2024-03-10T09:00:00Z",
    },
    {
      id: "dev-005",
      room_id: "r5",
      room_number: "상담2",
      center_id: "c2",
      center_name: "종로점",
      hospital_id: "h1",
      hospital_name: "오블리브 피부과",
      serial_number: "MR-2024-0005",
      firmware_version: "2.1.3",
      status: "online",
      last_heartbeat: new Date(now.getTime() - 10 * 1000).toISOString(),
      disk_total_gb: 256,
      disk_free_gb: 198.7,
      today_recording_count: 15,
      config: { recording_format: "wav", sample_rate: 44100, auto_upload: true, upload_interval_minutes: 5, max_recording_duration_minutes: 120 },
      is_active: true,
      created_at: "2024-03-10T09:00:00Z",
    },
    {
      id: "dev-006",
      room_id: "r6",
      room_number: "A-1",
      center_id: "c3",
      center_name: "강남점",
      hospital_id: "h2",
      hospital_name: "연세 정형외과",
      serial_number: "MR-2024-0006",
      firmware_version: "2.1.3",
      status: "online",
      last_heartbeat: new Date(now.getTime() - 5 * 1000).toISOString(),
      disk_total_gb: 128,
      disk_free_gb: 65.3,
      today_recording_count: 20,
      config: { recording_format: "wav", sample_rate: 44100, auto_upload: true, upload_interval_minutes: 5, max_recording_duration_minutes: 120 },
      is_active: true,
      created_at: "2024-04-01T09:00:00Z",
    },
  ]
  return devices
}

// --- 추후 Supabase 쿼리로 교체할 함수 ---
async function fetchDevices(): Promise<Device[]> {
  // TODO: Supabase 연동 시 아래 코드로 교체
  // const supabase = createClient()
  // const { data, error } = await supabase
  //   .from('devices')
  //   .select('*, rooms(*), centers(*), hospitals(*)')
  //   .eq('is_active', true)
  // if (error) throw error
  // return data
  return generateDemoDevices()
}

// --- 유틸 ---

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}초 전`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

function getStatusConfig(status: DeviceStatus) {
  switch (status) {
    case "online":
      return { label: "온라인", color: "bg-emerald-500", badgeVariant: "default" as const, icon: Wifi, textColor: "text-emerald-600" }
    case "offline":
      return { label: "오프라인", color: "bg-gray-400", badgeVariant: "secondary" as const, icon: WifiOff, textColor: "text-gray-500" }
    case "error":
      return { label: "오류", color: "bg-red-500", badgeVariant: "destructive" as const, icon: AlertTriangle, textColor: "text-red-600" }
  }
}

function getDiskUsageColor(freeGb: number, totalGb: number): string {
  const usedPercent = ((totalGb - freeGb) / totalGb) * 100
  if (usedPercent >= 90) return "text-red-600"
  if (usedPercent >= 70) return "text-yellow-600"
  return "text-emerald-600"
}

// --- 컴포넌트 ---

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [hospitalFilter, setHospitalFilter] = useState<string>("all")
  const [centerFilter, setCenterFilter] = useState<string>("all")
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadDevices = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const data = await fetchDevices()
      setDevices(data)
      setLastRefresh(new Date())
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // 초기 로드 + 30초 자동 갱신
  useEffect(() => {
    loadDevices()
    const interval = setInterval(loadDevices, 30000)
    return () => clearInterval(interval)
  }, [loadDevices])

  // 필터링된 센터 목록
  const filteredCenters = useMemo(() => {
    if (hospitalFilter === "all") return DEMO_CENTERS
    return DEMO_CENTERS.filter((c) => c.hospital_id === hospitalFilter)
  }, [hospitalFilter])

  // 병원 필터 변경 시 센터 필터 초기화
  useEffect(() => {
    setCenterFilter("all")
  }, [hospitalFilter])

  // 필터링된 디바이스
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      if (hospitalFilter !== "all" && d.hospital_id !== hospitalFilter) return false
      if (centerFilter !== "all" && d.center_id !== centerFilter) return false
      return true
    })
  }, [devices, hospitalFilter, centerFilter])

  // 병원 > 센터 > 디바이스 트리 구조
  const deviceTree = useMemo(() => {
    const tree: Record<string, Record<string, Device[]>> = {}
    filteredDevices.forEach((d) => {
      if (!tree[d.hospital_name]) tree[d.hospital_name] = {}
      if (!tree[d.hospital_name][d.center_name]) tree[d.hospital_name][d.center_name] = []
      tree[d.hospital_name][d.center_name].push(d)
    })
    return tree
  }, [filteredDevices])

  // 상태별 카운트
  const statusCounts = useMemo(() => {
    const counts = { online: 0, offline: 0, error: 0, total: 0 }
    filteredDevices.forEach((d) => {
      counts[d.status]++
      counts.total++
    })
    return counts
  }, [filteredDevices])

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">디바이스 관리</h1>
          <p className="text-sm text-muted-foreground">
            녹음 디바이스 상태를 실시간으로 모니터링합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            마지막 갱신: {lastRefresh.toLocaleTimeString("ko-KR")}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDevices}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* 상태 요약 카드 */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 디바이스</p>
                <p className="text-2xl font-bold">{statusCounts.total}대</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <HardDrive className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">온라인</p>
                <p className="text-2xl font-bold text-emerald-600">{statusCounts.online}대</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Wifi className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">오프라인</p>
                <p className="text-2xl font-bold text-gray-500">{statusCounts.offline}대</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <WifiOff className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">오류</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.error}대</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3">
        <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="병원 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 병원</SelectItem>
            {DEMO_HOSPITALS.map((h) => (
              <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={centerFilter} onValueChange={setCenterFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="센터 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 센터</SelectItem>
            {filteredCenters.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 디바이스 트리 */}
      {Object.entries(deviceTree).map(([hospitalName, centers]) => (
        <div key={hospitalName} className="space-y-4">
          <h2 className="text-lg font-semibold">{hospitalName}</h2>
          {Object.entries(centers).map(([centerName, centerDevices]) => (
            <Card key={centerName}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {centerName}
                  <Badge variant="outline" className="font-normal">
                    {centerDevices.length}대
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">상태</TableHead>
                      <TableHead>룸</TableHead>
                      <TableHead>시리얼 번호</TableHead>
                      <TableHead className="text-right">오늘 녹음</TableHead>
                      <TableHead>마지막 하트비트</TableHead>
                      <TableHead className="text-right">디스크 여유</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centerDevices.map((device) => {
                      const statusConfig = getStatusConfig(device.status)
                      const diskColor = getDiskUsageColor(device.disk_free_gb, device.disk_total_gb)
                      const diskPercent = ((device.disk_total_gb - device.disk_free_gb) / device.disk_total_gb * 100).toFixed(0)
                      return (
                        <TableRow key={device.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`inline-block h-2.5 w-2.5 rounded-full ${statusConfig.color}`} />
                              <span className={`text-xs font-medium ${statusConfig.textColor}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{device.room_number}</TableCell>
                          <TableCell className="text-muted-foreground text-xs font-mono">
                            {device.serial_number}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {device.today_recording_count}건
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatTimeAgo(device.last_heartbeat)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className={`text-sm font-medium ${diskColor}`}>
                                {device.disk_free_gb.toFixed(1)} GB
                              </span>
                              <span className="text-xs text-muted-foreground">
                                / {device.disk_total_gb} GB ({diskPercent}% 사용)
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link href={`/dashboard/devices/${device.id}`}>
                              <Button variant="ghost" size="sm">
                                상세
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}

      {filteredDevices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HardDrive className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">등록된 디바이스가 없습니다</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
