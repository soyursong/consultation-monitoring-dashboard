"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  HardDrive,
  Wifi,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import type { Device, DeviceRecording, DeviceStatus, RecordingUploadStatus } from "@/lib/types/medirec"

// --- 데모 데이터 (추후 Supabase 쿼리로 교체) ---

function generateDemoDevice(id: string): Device {
  const now = new Date()
  const devices: Record<string, Device> = {
    "dev-001": {
      id: "dev-001", room_id: "r1", room_number: "101", center_id: "c1", center_name: "송도점",
      hospital_id: "h1", hospital_name: "오블리브 피부과", serial_number: "MR-2024-0001",
      firmware_version: "2.1.3", status: "online",
      last_heartbeat: new Date(now.getTime() - 30 * 1000).toISOString(),
      disk_total_gb: 128, disk_free_gb: 87.2, today_recording_count: 12,
      config: { recording_format: "wav", sample_rate: 44100, auto_upload: true, upload_interval_minutes: 5, max_recording_duration_minutes: 120 },
      is_active: true, created_at: "2024-01-15T09:00:00Z",
    },
    "dev-002": {
      id: "dev-002", room_id: "r2", room_number: "102", center_id: "c1", center_name: "송도점",
      hospital_id: "h1", hospital_name: "오블리브 피부과", serial_number: "MR-2024-0002",
      firmware_version: "2.1.3", status: "online",
      last_heartbeat: new Date(now.getTime() - 15 * 1000).toISOString(),
      disk_total_gb: 128, disk_free_gb: 45.6, today_recording_count: 8,
      config: { recording_format: "wav", sample_rate: 44100, auto_upload: true, upload_interval_minutes: 5, max_recording_duration_minutes: 120 },
      is_active: true, created_at: "2024-01-15T09:00:00Z",
    },
    "dev-003": {
      id: "dev-003", room_id: "r3", room_number: "201", center_id: "c1", center_name: "송도점",
      hospital_id: "h1", hospital_name: "오블리브 피부과", serial_number: "MR-2024-0003",
      firmware_version: "2.0.8", status: "offline",
      last_heartbeat: new Date(now.getTime() - 3600 * 1000 * 2).toISOString(),
      disk_total_gb: 128, disk_free_gb: 102.4, today_recording_count: 0,
      config: { recording_format: "wav", sample_rate: 44100, auto_upload: true, upload_interval_minutes: 5, max_recording_duration_minutes: 120 },
      is_active: true, created_at: "2024-02-01T09:00:00Z",
    },
    "dev-004": {
      id: "dev-004", room_id: "r4", room_number: "상담1", center_id: "c2", center_name: "종로점",
      hospital_id: "h1", hospital_name: "오블리브 피부과", serial_number: "MR-2024-0004",
      firmware_version: "2.1.3", status: "error",
      last_heartbeat: new Date(now.getTime() - 600 * 1000).toISOString(),
      disk_total_gb: 256, disk_free_gb: 12.1, today_recording_count: 3,
      config: { recording_format: "wav", sample_rate: 44100, auto_upload: true, upload_interval_minutes: 5, max_recording_duration_minutes: 120 },
      is_active: true, created_at: "2024-03-10T09:00:00Z",
    },
    "dev-005": {
      id: "dev-005", room_id: "r5", room_number: "상담2", center_id: "c2", center_name: "종로점",
      hospital_id: "h1", hospital_name: "오블리브 피부과", serial_number: "MR-2024-0005",
      firmware_version: "2.1.3", status: "online",
      last_heartbeat: new Date(now.getTime() - 10 * 1000).toISOString(),
      disk_total_gb: 256, disk_free_gb: 198.7, today_recording_count: 15,
      config: { recording_format: "wav", sample_rate: 44100, auto_upload: true, upload_interval_minutes: 5, max_recording_duration_minutes: 120 },
      is_active: true, created_at: "2024-03-10T09:00:00Z",
    },
    "dev-006": {
      id: "dev-006", room_id: "r6", room_number: "A-1", center_id: "c3", center_name: "강남점",
      hospital_id: "h2", hospital_name: "연세 정형외과", serial_number: "MR-2024-0006",
      firmware_version: "2.1.3", status: "online",
      last_heartbeat: new Date(now.getTime() - 5 * 1000).toISOString(),
      disk_total_gb: 128, disk_free_gb: 65.3, today_recording_count: 20,
      config: { recording_format: "wav", sample_rate: 44100, auto_upload: true, upload_interval_minutes: 5, max_recording_duration_minutes: 120 },
      is_active: true, created_at: "2024-04-01T09:00:00Z",
    },
  }
  return devices[id] || devices["dev-001"]
}

function generateDemoRecordings(deviceId: string): DeviceRecording[] {
  const now = new Date()
  const recordings: DeviceRecording[] = []
  const count = deviceId === "dev-003" ? 0 : 15

  for (let i = 0; i < count; i++) {
    const recordedAt = new Date(now.getTime() - i * 45 * 60 * 1000)
    const duration = Math.floor(Math.random() * 1800) + 120
    const statuses: RecordingUploadStatus[] = ["uploaded", "uploaded", "uploaded", "pending", "failed"]
    const uploadStatus = i < 2 ? statuses[Math.floor(Math.random() * 2) + 2] : statuses[Math.floor(Math.random() * 3)]

    recordings.push({
      id: `rec-${deviceId}-${String(i + 1).padStart(3, "0")}`,
      device_id: deviceId,
      filename: `REC_${recordedAt.toISOString().replace(/[-:T]/g, "").slice(0, 14)}.wav`,
      duration_seconds: duration,
      file_size_mb: parseFloat(((duration / 60) * 8.5).toFixed(1)),
      upload_status: uploadStatus,
      recorded_at: recordedAt.toISOString(),
      uploaded_at: uploadStatus === "uploaded" ? new Date(recordedAt.getTime() + 300 * 1000).toISOString() : undefined,
      created_at: recordedAt.toISOString(),
    })
  }
  return recordings
}

// --- 추후 Supabase 쿼리로 교체할 함수 ---
async function fetchDevice(id: string): Promise<Device> {
  // TODO: Supabase 연동 시 교체
  // const supabase = createClient()
  // const { data, error } = await supabase.from('devices').select('*').eq('id', id).single()
  return generateDemoDevice(id)
}

async function fetchRecordings(deviceId: string): Promise<DeviceRecording[]> {
  // TODO: Supabase 연동 시 교체
  // const supabase = createClient()
  // const { data, error } = await supabase.from('device_recordings').select('*').eq('device_id', deviceId).order('recorded_at', { ascending: false })
  return generateDemoRecordings(deviceId)
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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}분 ${s.toString().padStart(2, "0")}초`
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusConfig(status: DeviceStatus) {
  switch (status) {
    case "online":
      return { label: "온라인", color: "bg-emerald-500", icon: Wifi, textColor: "text-emerald-600" }
    case "offline":
      return { label: "오프라인", color: "bg-gray-400", icon: WifiOff, textColor: "text-gray-500" }
    case "error":
      return { label: "오류", color: "bg-red-500", icon: AlertTriangle, textColor: "text-red-600" }
  }
}

function getUploadStatusConfig(status: RecordingUploadStatus) {
  switch (status) {
    case "uploaded":
      return { label: "업로드 완료", icon: CheckCircle, textColor: "text-emerald-600" }
    case "pending":
      return { label: "대기 중", icon: Clock, textColor: "text-yellow-600" }
    case "failed":
      return { label: "실패", icon: XCircle, textColor: "text-red-600" }
  }
}

// --- 컴포넌트 ---

export default function DeviceDetailPage() {
  const params = useParams()
  const deviceId = params.id as string

  const [device, setDevice] = useState<Device | null>(null)
  const [recordings, setRecordings] = useState<DeviceRecording[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [deviceData, recordingsData] = await Promise.all([
        fetchDevice(deviceId),
        fetchRecordings(deviceId),
      ])
      setDevice(deviceData)
      setRecordings(recordingsData)
    } finally {
      setIsLoading(false)
    }
  }, [deviceId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 디스크 사용량 계산
  const diskUsage = useMemo(() => {
    if (!device) return { usedGb: 0, percent: 0 }
    const usedGb = device.disk_total_gb - device.disk_free_gb
    const percent = (usedGb / device.disk_total_gb) * 100
    return { usedGb: parseFloat(usedGb.toFixed(1)), percent: parseFloat(percent.toFixed(1)) }
  }, [device])

  if (isLoading || !device) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const statusConfig = getStatusConfig(device.status)
  const diskBarColor = diskUsage.percent >= 90 ? "bg-red-500" : diskUsage.percent >= 70 ? "bg-yellow-500" : "bg-emerald-500"

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/devices">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            목록으로
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {device.hospital_name} - {device.center_name} - {device.room_number}
            </h1>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${statusConfig.color}`} />
              <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            시리얼: {device.serial_number} | 펌웨어: {device.firmware_version}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          새로고침
        </Button>
      </div>

      {/* 디바이스 정보 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              마지막 하트비트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{formatTimeAgo(device.last_heartbeat)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(device.last_heartbeat).toLocaleString("ko-KR")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              오늘 녹음 건수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{device.today_recording_count}건</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              등록일
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {new Date(device.created_at).toLocaleDateString("ko-KR")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 디스크 사용량 + 설정 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              디스크 사용량
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">사용됨</span>
                <span className="font-medium">
                  {diskUsage.usedGb} GB / {device.disk_total_gb} GB ({diskUsage.percent}%)
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${diskBarColor}`}
                  style={{ width: `${diskUsage.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>여유: {device.disk_free_gb.toFixed(1)} GB</span>
                {diskUsage.percent >= 80 && (
                  <span className="text-red-500 font-medium">디스크 용량 부족 주의</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">디바이스 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">녹음 형식</span>
                <span className="font-medium">{device.config.recording_format.toUpperCase()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">샘플레이트</span>
                <span className="font-medium">{(device.config.sample_rate / 1000).toFixed(1)} kHz</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">자동 업로드</span>
                <Badge variant={device.config.auto_upload ? "default" : "secondary"}>
                  {device.config.auto_upload ? "활성" : "비활성"}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">업로드 주기</span>
                <span className="font-medium">{device.config.upload_interval_minutes}분</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">최대 녹음 시간</span>
                <span className="font-medium">{device.config.max_recording_duration_minutes}분</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 녹음 기록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 녹음 기록</CardTitle>
        </CardHeader>
        <CardContent>
          {recordings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <HardDrive className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground text-sm">녹음 기록이 없습니다</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>파일명</TableHead>
                  <TableHead>녹음 시각</TableHead>
                  <TableHead className="text-right">재생 시간</TableHead>
                  <TableHead className="text-right">파일 크기</TableHead>
                  <TableHead>업로드 상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordings.map((rec) => {
                  const uploadConfig = getUploadStatusConfig(rec.upload_status)
                  return (
                    <TableRow key={rec.id}>
                      <TableCell className="font-mono text-xs">{rec.filename}</TableCell>
                      <TableCell className="text-sm">{formatDateTime(rec.recorded_at)}</TableCell>
                      <TableCell className="text-right text-sm">
                        {formatDuration(rec.duration_seconds)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {rec.file_size_mb} MB
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1.5 ${uploadConfig.textColor}`}>
                          <uploadConfig.icon className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">{uploadConfig.label}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
