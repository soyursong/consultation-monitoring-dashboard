import type { Call, SalesRep, Center, Package, Recording, User, PlaudToken, PatientType, ReferralSource, CallStatus, PaymentStatus, ReviewStatus } from '@/lib/types/database'

// 풋케어센터 센터 정보
export const demoCenter: Center = {
  id: 'center-1',
  name: '풋케어센터 강남점',
  industry: '풋케어',
  is_active: true,
}

// 세일즈 담당자 (Lovable 앱 기준)
export const demoSalesReps: SalesRep[] = [
  { id: 'rep-1', name: '이아인', position: '총괄실장', center_id: 'center-1', is_active: true },
  { id: 'rep-2', name: '김정혜', position: '상담실장', center_id: 'center-1', is_active: true },
  { id: 'rep-3', name: '박윤지', position: '상담실장', center_id: 'center-1', is_active: true },
  { id: 'rep-4', name: '신선아', position: '상담실장', center_id: 'center-1', is_active: true },
  { id: 'rep-5', name: '이서연', position: '상담실장', center_id: 'center-1', is_active: true },
]

// 데모 사용자 (역할별)
export const demoUsers: User[] = [
  { id: 'user-1', name: '관리자', email: 'admin@footcare.com', role: 'master', center_id: 'center-1', is_active: true, created_at: '2025-01-01' },
  { id: 'user-2', name: '김본부', email: 'bo@footcare.com', role: 'bo', center_id: 'center-1', is_active: true, created_at: '2025-01-01' },
  { id: 'user-3', name: '이아인', email: 'ain@footcare.com', role: 'head_manager', center_id: 'center-1', sales_rep_id: 'rep-1', is_active: true, created_at: '2025-01-15' },
  { id: 'user-4', name: '김정혜', email: 'jh@footcare.com', role: 'counselor', center_id: 'center-1', sales_rep_id: 'rep-2', is_active: true, created_at: '2025-02-01' },
  { id: 'user-5', name: '박윤지', email: 'yj@footcare.com', role: 'counselor', center_id: 'center-1', sales_rep_id: 'rep-3', is_active: true, created_at: '2025-02-01' },
  { id: 'user-6', name: '신선아', email: 'sa@footcare.com', role: 'counselor', center_id: 'center-1', sales_rep_id: 'rep-4', is_active: true, created_at: '2025-03-01' },
  { id: 'user-7', name: '이서연', email: 'sy@footcare.com', role: 'counselor', center_id: 'center-1', sales_rep_id: 'rep-5', is_active: true, created_at: '2025-03-01' },
  { id: 'user-8', name: '최코디', email: 'coord@footcare.com', role: 'coordinator', center_id: 'center-1', is_active: true, created_at: '2025-04-01' },
]

// 상담실장별 플라우드 토큰
export const demoPlaudTokens: PlaudToken[] = [
  { id: 'pt-1', sales_rep_id: 'rep-1', token: 'plaud_tk_***ain1', label: '이아인 플라우드 1', is_active: true, last_synced: '2026-03-05T10:30:00', created_at: '2025-06-01' },
  { id: 'pt-2', sales_rep_id: 'rep-2', token: 'plaud_tk_***jh1', label: '김정혜 플라우드', is_active: true, last_synced: '2026-03-05T09:15:00', created_at: '2025-06-01' },
  { id: 'pt-3', sales_rep_id: 'rep-2', token: 'plaud_tk_***jh2', label: '김정혜 플라우드 2', is_active: true, last_synced: '2026-03-04T17:00:00', created_at: '2025-09-15' },
  { id: 'pt-4', sales_rep_id: 'rep-3', token: 'plaud_tk_***yj1', label: '박윤지 플라우드', is_active: true, last_synced: '2026-03-05T11:00:00', created_at: '2025-06-01' },
  { id: 'pt-5', sales_rep_id: 'rep-4', token: 'plaud_tk_***sa1', label: '신선아 플라우드', is_active: true, last_synced: '2026-03-04T16:45:00', created_at: '2025-07-01' },
  { id: 'pt-6', sales_rep_id: 'rep-5', token: 'plaud_tk_***sy1', label: '이서연 플라우드', is_active: true, last_synced: '2026-03-05T08:30:00', created_at: '2025-07-01' },
  { id: 'pt-7', sales_rep_id: 'rep-5', token: 'plaud_tk_***sy2', label: '이서연 보조 기기', is_active: false, created_at: '2025-10-01' },
]

// 풋케어 패키지
export const demoPackages: Package[] = [
  { id: 'pkg-1', center_id: 'center-1', name: '내성발톱 교정', price: 150000, is_active: true },
  { id: 'pkg-2', center_id: 'center-1', name: '발톱무좀 치료', price: 200000, is_active: true },
  { id: 'pkg-3', center_id: 'center-1', name: '발각질 관리', price: 80000, is_active: true },
  { id: 'pkg-4', center_id: 'center-1', name: '티눈/굳은살 제거', price: 100000, is_active: true },
  { id: 'pkg-5', center_id: 'center-1', name: '풋케어 종합 패키지', price: 350000, is_active: true },
  { id: 'pkg-6', center_id: 'center-1', name: '발톱 복원', price: 250000, is_active: true },
  { id: 'pkg-7', center_id: 'center-1', name: '무좀 집중 케어', price: 300000, is_active: true },
  { id: 'pkg-8', center_id: 'center-1', name: '발관리 정기권', price: 500000, is_active: true },
]

// 이탈 사유
export const dropReasons = [
  '가격 부담',
  '타 업체 비교',
  '시간 안맞음',
  '효과 의심',
  '단순 문의',
  '연락 두절',
  '치료 불필요 판단',
  '재방문 예정',
]

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const customerFirstNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍']
const customerLastNames = ['민수', '영희', '철수', '지은', '수진', '현우', '미나', '정호', '서연', '준혁', '하은', '도윤', '예진', '성민', '지현', '우진', '소율', '태현', '나은', '시우']

function generateCustomerName(seed: number): string {
  const first = customerFirstNames[Math.floor(seededRandom(seed) * customerFirstNames.length)]
  const last = customerLastNames[Math.floor(seededRandom(seed + 100) * customerLastNames.length)]
  return `${first}${last}`
}

// 최근 90일간의 데모 상담 데이터 생성
export function generateDemoCalls(): Call[] {
  const calls: Call[] = []
  const today = new Date()

  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
    const date = new Date(today)
    date.setDate(date.getDate() - dayOffset)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()

    // 일요일 휴무, 토요일 적음
    const dailyCount = dayOfWeek === 0 ? 0 : dayOfWeek === 6 ? Math.floor(seededRandom(dayOffset * 7) * 4) + 1 : Math.floor(seededRandom(dayOffset * 3) * 10) + 4

    for (let i = 0; i < dailyCount; i++) {
      const seed = dayOffset * 100 + i
      const rep = demoSalesReps[Math.floor(seededRandom(seed + 1) * demoSalesReps.length)]
      const pkg = demoPackages[Math.floor(seededRandom(seed + 2) * demoPackages.length)]

      // 신환/구환 (60% 신환, 40% 구환)
      const patientType: PatientType = seededRandom(seed + 3) < 0.6 ? 'new' : 'returning'

      // 유입 경로 (신환: 50% 광고, 50% 자연 / 구환: 20% 광고, 80% 자연)
      const adProb = patientType === 'new' ? 0.5 : 0.2
      const referralSource: ReferralSource = seededRandom(seed + 4) < adProb ? 'ad' : 'organic'

      // 상담 결과 - 상담사별 차이
      const repSkill = rep.id === 'rep-1' ? 0.55 : rep.id === 'rep-2' ? 0.45 : rep.id === 'rep-3' ? 0.40 : rep.id === 'rep-4' ? 0.35 : 0.38
      const outcomeRand = seededRandom(seed + 5)
      let status: CallStatus
      let paymentStatus: PaymentStatus
      let paymentAmount: number
      let isConfirmed: boolean
      let reviewStatus: ReviewStatus
      let dropReason: string | null = null

      if (outcomeRand < repSkill) {
        status = 'completed'
        paymentStatus = seededRandom(seed + 6) < 0.8 ? 'paid' : 'partial'
        const discount = 0.8 + seededRandom(seed + 7) * 0.2
        paymentAmount = Math.round(pkg.price * discount / 10000) * 10000
        isConfirmed = true
        reviewStatus = 'reviewed'
      } else if (outcomeRand < repSkill + 0.15) {
        status = 'in_progress'
        paymentStatus = 'unpaid'
        paymentAmount = 0
        isConfirmed = true
        reviewStatus = 'reviewed'
      } else {
        status = 'completed'
        paymentStatus = 'unpaid'
        paymentAmount = 0
        isConfirmed = seededRandom(seed + 8) < 0.7
        const reviewRand = seededRandom(seed + 14)
        reviewStatus = isConfirmed ? 'reviewed' : reviewRand < 0.7 ? 'unreviewed' : 'needs_edit'
        dropReason = dropReasons[Math.floor(seededRandom(seed + 9) * dropReasons.length)]
      }

      const durationMinutes = Math.floor(seededRandom(seed + 11) * 45) + 5
      const durationSeconds = durationMinutes * 60

      const hours = [9, 10, 11, 13, 14, 15, 16, 17]
      const hour = hours[Math.floor(seededRandom(seed + 12) * hours.length)]
      const minute = Math.floor(seededRandom(seed + 13) * 60)
      const callTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

      // 일부 데이터를 비활성화 처리 (테스트용)
      const isActive = !(dayOffset === 5 && i === 0) && !(dayOffset === 10 && i === 1)

      calls.push({
        id: `call-${dayOffset}-${i}`,
        center_id: 'center-1',
        sales_rep_id: rep.id,
        customer_name: generateCustomerName(seed + 20),
        patient_type: patientType,
        referral_source: referralSource,
        package_name: pkg.name,
        call_date: dateStr,
        call_time: callTime,
        duration_seconds: durationSeconds,
        status,
        payment_status: paymentStatus,
        payment_amount: paymentAmount,
        drop_reason: dropReason,
        is_confirmed: isConfirmed,
        review_status: reviewStatus,
        notes: paymentAmount > 0
          ? `${pkg.name} 상담 진행, 결제 완료`
          : dropReason
            ? `${pkg.name} 상담 - 이탈사유: ${dropReason}`
            : `${pkg.name} 상담 진행 중`,
        is_active: isActive,
        created_at: dateStr,
        sales_rep: rep,
      })
    }
  }

  return calls
}

// 데모 녹취 데이터
export const demoRecordings: Recording[] = [
  {
    id: 'r1',
    call_id: 'call-1-0',
    plaud_id: 'plaud-abc123',
    title: '내성발톱 교정 상담',
    transcript: '상담사: 안녕하세요, 풋케어센터입니다.\n고객: 네, 내성발톱 교정 때문에 전화드렸어요.\n상담사: 네, 내성발톱은 저희가 특화된 분야이구요, 한번 내원하셔서 상태를 보고 치료 계획을 세워드립니다.',
    summary: '내성발톱 교정 상담. 신규 고객. 엄지 발톱 양쪽 내성. 교정 패키지 안내 후 내원 예약 완료.',
    duration_seconds: 720,
    speakers: ['이아인', '고객'],
    date: '2026-03-01',
    created_at: '2026-03-01',
  },
  {
    id: 'r2',
    call_id: 'call-2-0',
    plaud_id: 'plaud-def456',
    title: '발톱무좀 치료 상담',
    transcript: '상담사: 안녕하세요, 풋케어센터입니다.\n고객: 발톱무좀이 좀 심한데 치료가 가능할까요?\n상담사: 물론이죠. 무좀 정도에 따라 치료 기간이 달라지지만 충분히 호전 가능합니다.',
    summary: '발톱무좀 치료 문의. 3년 정도 된 무좀. 집중 케어 패키지 안내. 가격 비교 후 재연락 예정.',
    duration_seconds: 540,
    speakers: ['김정혜', '고객'],
    date: '2026-03-02',
    created_at: '2026-03-02',
  },
  {
    id: 'r3',
    call_id: 'call-3-0',
    plaud_id: 'plaud-ghi789',
    title: '종합 패키지 재상담',
    transcript: '상담사: 안녕하세요, 지난번에 상담받으셨던 분이시죠?\n고객: 네 맞아요. 종합 패키지로 결정하려고요.\n상담사: 좋은 결정이세요! 종합 패키지는 발톱 교정과 각질 관리를 함께 받으실 수 있어요.',
    summary: '종합 패키지 결정 상담. 구환 재방문. 풋케어 종합 패키지 35만원 결제 완료.',
    duration_seconds: 480,
    speakers: ['박윤지', '고객'],
    date: '2026-03-03',
    created_at: '2026-03-03',
  },
]

// 상태 레이블
export const statusLabels: Record<CallStatus, string> = {
  completed: '완료',
  in_progress: '진행중',
  unconfirmed: '미확인',
}

export const statusColors: Record<CallStatus, string> = {
  completed: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  unconfirmed: 'bg-yellow-100 text-yellow-800',
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  paid: '결제완료',
  unpaid: '미결제',
  partial: '부분결제',
}

export const paymentStatusColors: Record<PaymentStatus, string> = {
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-red-100 text-red-800',
  partial: 'bg-orange-100 text-orange-800',
}

export const patientTypeLabels: Record<PatientType, string> = {
  new: '신환',
  returning: '구환',
}

export const referralSourceLabels: Record<ReferralSource, string> = {
  ad: '광고',
  organic: '자연유입',
}

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  unreviewed: '미확인',
  reviewed: '확인',
  needs_edit: '수정필요',
}

export const reviewStatusColors: Record<ReviewStatus, string> = {
  unreviewed: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-green-100 text-green-800',
  needs_edit: 'bg-red-100 text-red-800',
}
