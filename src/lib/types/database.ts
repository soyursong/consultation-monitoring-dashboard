export type PatientType = 'new' | 'returning'
export type ReferralSource = 'ad' | 'organic'
export type CallStatus = 'completed' | 'in_progress' | 'unconfirmed'
export type PaymentStatus = 'paid' | 'unpaid' | 'partial'

// 역할: 마스터 > BO그룹 > 총괄실장 > 상담실장 > 코디
export type UserRole = 'master' | 'bo' | 'head_manager' | 'counselor' | 'coordinator'

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  master: '마스터',
  bo: 'BO그룹',
  head_manager: '총괄실장',
  counselor: '상담실장',
  coordinator: '코디',
}

// 역할별 권한 정의
export const ROLE_PERMISSIONS: Record<UserRole, {
  viewAllData: boolean       // 전체 데이터 조회
  editData: boolean          // 데이터 수정
  deleteRecords: boolean     // 상담내역 삭제
  manageUsers: boolean       // 사용자 등록/수정
  grantPermissions: boolean  // 권한 부여
  confirmRecords: boolean    // 상담내역 확정
  viewOwnOnly: boolean       // 본인 데이터만 조회
}> = {
  master: {
    viewAllData: true,
    editData: true,
    deleteRecords: true,
    manageUsers: true,
    grantPermissions: true,
    confirmRecords: true,
    viewOwnOnly: false,
  },
  bo: {
    viewAllData: true,
    editData: true,
    deleteRecords: true,
    manageUsers: true,
    grantPermissions: false,
    confirmRecords: true,
    viewOwnOnly: false,
  },
  head_manager: {
    viewAllData: true,
    editData: true,
    deleteRecords: false,
    manageUsers: true,
    grantPermissions: false,
    confirmRecords: true,
    viewOwnOnly: false,
  },
  counselor: {
    viewAllData: false,
    editData: false,
    deleteRecords: false,
    manageUsers: false,
    grantPermissions: false,
    confirmRecords: false,
    viewOwnOnly: true,
  },
  coordinator: {
    viewAllData: true,
    editData: true,
    deleteRecords: false,
    manageUsers: false,
    grantPermissions: false,
    confirmRecords: true,
    viewOwnOnly: false,
  },
}

export interface Center {
  id: string
  name: string
  industry: string
  is_active: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  center_id: string
  sales_rep_id?: string // 상담실장인 경우 연결된 SalesRep
  is_active: boolean
  created_at: string
}

export interface SalesRep {
  id: string
  name: string
  position: '총괄실장' | '상담실장'
  center_id: string
  is_active: boolean
}

// 상담실장별 플라우드 토큰
export interface PlaudToken {
  id: string
  sales_rep_id: string
  token: string
  label: string  // 예: "플라우드 기기 1", "내 플라우드"
  is_active: boolean
  last_synced?: string
  created_at: string
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
  status: CallStatus
  payment_status: PaymentStatus
  payment_amount: number
  drop_reason?: string | null
  is_confirmed: boolean
  confirmed_by?: string // 확정한 사용자 ID (코디)
  notes?: string
  is_active: boolean
  created_at: string
  sales_rep?: SalesRep
}

export interface Recording {
  id: string
  call_id?: string
  plaud_id?: string
  plaud_token_id?: string // 어떤 토큰으로 가져왔는지
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
      users: { Row: User; Insert: Omit<User, 'id' | 'created_at'>; Update: Partial<Omit<User, 'id' | 'created_at'>> }
      sales_reps: { Row: SalesRep; Insert: Omit<SalesRep, 'id'>; Update: Partial<Omit<SalesRep, 'id'>> }
      plaud_tokens: { Row: PlaudToken; Insert: Omit<PlaudToken, 'id' | 'created_at'>; Update: Partial<Omit<PlaudToken, 'id' | 'created_at'>> }
      packages: { Row: Package; Insert: Omit<Package, 'id'>; Update: Partial<Omit<Package, 'id'>> }
      calls: { Row: Call; Insert: Omit<Call, 'id' | 'created_at' | 'sales_rep' | 'is_active'>; Update: Partial<Omit<Call, 'id' | 'created_at' | 'sales_rep'>> }
      recordings: { Row: Recording; Insert: Omit<Recording, 'id' | 'created_at'>; Update: Partial<Omit<Recording, 'id' | 'created_at'>> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
