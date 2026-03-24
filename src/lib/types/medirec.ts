// MediRec 디바이스 모니터링 관련 타입 정의

export type DeviceStatus = 'online' | 'offline' | 'error'
export type RecordingUploadStatus = 'uploaded' | 'pending' | 'failed'

export interface Hospital {
  id: string
  name: string
  address?: string
  is_active: boolean
  created_at: string
}

export interface MedirecCenter {
  id: string
  hospital_id: string
  name: string
  floor?: string
  is_active: boolean
  created_at: string
}

export interface Room {
  id: string
  center_id: string
  name: string
  room_number: string
  is_active: boolean
}

export interface Device {
  id: string
  room_id: string
  room_number: string
  center_id: string
  center_name: string
  hospital_id: string
  hospital_name: string
  serial_number: string
  firmware_version: string
  status: DeviceStatus
  last_heartbeat: string
  disk_total_gb: number
  disk_free_gb: number
  today_recording_count: number
  config: DeviceConfig
  is_active: boolean
  created_at: string
}

export interface DeviceConfig {
  recording_format: string
  sample_rate: number
  auto_upload: boolean
  upload_interval_minutes: number
  max_recording_duration_minutes: number
}

export interface DeviceRecording {
  id: string
  device_id: string
  filename: string
  duration_seconds: number
  file_size_mb: number
  upload_status: RecordingUploadStatus
  recorded_at: string
  uploaded_at?: string
  created_at: string
}

export interface MedirecUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'viewer'
  hospital_id?: string
  center_id?: string
  is_active: boolean
  created_at: string
}
