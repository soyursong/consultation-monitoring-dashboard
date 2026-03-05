export type PatientType = 'new' | 'returning'
export type ReferralSource = 'ad' | 'organic'
export type CallStatus = 'completed' | 'in_progress' | 'unconfirmed'
export type PaymentStatus = 'paid' | 'unpaid' | 'partial'
export type UserRole = 'master' | 'manager' | 'counselor'

export interface Center {
  id: string
  name: string
  industry: string
  is_active: boolean
}

export interface SalesRep {
  id: string
  name: string
  position: '총괄실장' | '상담실장'
  center_id: string
  is_active: boolean
}

export interface Package {
  id: string
  center_id: string
  name: string
  price: number
  is_active: boolean
}

export interface Call {
  id: string
  center_id: string
  sales_rep_id: string
  customer_name: string
  hospital_name?: string
  patient_type: PatientType
  referral_source?: ReferralSource
  package_name?: string
  call_date: string
  call_time?: string
  duration_seconds: number
  consultation_score?: number
  status: CallStatus
  payment_status: PaymentStatus
  payment_amount: number
  drop_reason?: string | null
  is_confirmed: boolean
  notes?: string
  created_at: string
  sales_rep?: SalesRep
}

export interface Recording {
  id: string
  call_id?: string
  plaud_id?: string
  title?: string
  transcript?: string
  summary?: string
  duration_seconds?: number
  speakers?: string[]
  date?: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      centers: { Row: Center; Insert: Omit<Center, 'id'>; Update: Partial<Omit<Center, 'id'>> }
      sales_reps: { Row: SalesRep; Insert: Omit<SalesRep, 'id'>; Update: Partial<Omit<SalesRep, 'id'>> }
      packages: { Row: Package; Insert: Omit<Package, 'id'>; Update: Partial<Omit<Package, 'id'>> }
      calls: { Row: Call; Insert: Omit<Call, 'id' | 'created_at' | 'sales_rep'>; Update: Partial<Omit<Call, 'id' | 'created_at' | 'sales_rep'>> }
      recordings: { Row: Recording; Insert: Omit<Recording, 'id' | 'created_at'>; Update: Partial<Omit<Recording, 'id' | 'created_at'>> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
