export type Channel =
  | 'TM_OUTBOUND'
  | 'TM_INBOUND'
  | 'WALK_IN'
  | 'ONLINE'
  | 'KAKAO'
  | 'REFERRAL'
  | 'SNS'
  | 'AD'
  | 'OTHER'

export type Outcome =
  | 'PENDING'
  | 'CONVERTED'
  | 'FOLLOW_UP'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'REJECTED'

export type UserRole = 'admin' | 'manager' | 'counselor'

export interface Counselor {
  id: string
  name: string
  email: string
  phone?: string
  branch: string
  position: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface Patient {
  id: string
  name: string
  phone?: string
  gender?: 'M' | 'F'
  is_new_patient: boolean
  source_channel?: Channel
  created_at: string
}

export interface Consultation {
  id: string
  counselor_id: string
  patient_id?: string
  consultation_date: string
  duration_minutes?: number
  channel: Channel
  outcome: Outcome
  treatment_category?: string
  treatment_name?: string
  quoted_amount: number
  agreed_amount: number
  paid_amount: number
  consultation_notes?: string
  recording_url?: string
  branch: string
  created_at: string
  // joined
  counselor?: Counselor
  patient?: Patient
}

export interface Recording {
  id: string
  consultation_id?: string
  plaud_transcription_id?: string
  transcript_text?: string
  summary?: string
  file_url?: string
  duration_seconds?: number
  created_at: string
}

// Supabase DB type (simplified for demo - Supabase 연결 시 supabase gen types로 대체)
export interface Database {
  public: {
    Tables: {
      counselors: {
        Row: Counselor
        Insert: Omit<Counselor, 'id' | 'created_at'>
        Update: Partial<Omit<Counselor, 'id' | 'created_at'>>
      }
      patients: {
        Row: Patient
        Insert: Omit<Patient, 'id' | 'created_at'>
        Update: Partial<Omit<Patient, 'id' | 'created_at'>>
      }
      consultations: {
        Row: Consultation
        Insert: Omit<Consultation, 'id' | 'created_at' | 'counselor' | 'patient'>
        Update: Partial<Omit<Consultation, 'id' | 'created_at' | 'counselor' | 'patient'>>
      }
      recordings: {
        Row: Recording
        Insert: Omit<Recording, 'id' | 'created_at'>
        Update: Partial<Omit<Recording, 'id' | 'created_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
