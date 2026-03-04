import type { Counselor, Consultation, Recording, Channel, Outcome } from '@/lib/types/database'

// 데모용 상담사 데이터
export const demoCounselors: Counselor[] = [
  { id: 'c1', name: '김서연', email: 'kim@clinic.com', branch: '강남점', position: '실장', role: 'manager', is_active: true, created_at: '2024-01-01' },
  { id: 'c2', name: '이지원', email: 'lee@clinic.com', branch: '강남점', position: '상담사', role: 'counselor', is_active: true, created_at: '2024-02-01' },
  { id: 'c3', name: '박민지', email: 'park@clinic.com', branch: '강남점', position: '상담사', role: 'counselor', is_active: true, created_at: '2024-03-01' },
  { id: 'c4', name: '정하늘', email: 'jung@clinic.com', branch: '서초점', position: '실장', role: 'manager', is_active: true, created_at: '2024-01-15' },
  { id: 'c5', name: '최은서', email: 'choi@clinic.com', branch: '서초점', position: '상담사', role: 'counselor', is_active: true, created_at: '2024-04-01' },
]

const channels: Channel[] = ['TM_OUTBOUND', 'TM_INBOUND', 'WALK_IN', 'ONLINE', 'KAKAO', 'REFERRAL', 'SNS', 'AD']
const treatmentCategories = ['피부', '체형', '안면윤곽', '눈', '코', '리프팅', '보톡스/필러']
const treatmentNames: Record<string, string[]> = {
  '피부': ['레이저토닝', '피코토닝', 'IPL', '스킨보톡스'],
  '체형': ['지방흡입', '지방분해주사', '체형교정'],
  '안면윤곽': ['사각턱', '광대축소', 'V라인'],
  '눈': ['쌍꺼풀', '눈매교정', '하안검'],
  '코': ['코끝성형', '콧대', '코재수술'],
  '리프팅': ['실리프팅', '울쎄라', '써마지'],
  '보톡스/필러': ['보톡스', '필러', '스킨보톡스'],
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// 최근 90일간의 데모 상담 데이터 생성
export function generateDemoConsultations(): Consultation[] {
  const consultations: Consultation[] = []
  const today = new Date()

  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
    const date = new Date(today)
    date.setDate(date.getDate() - dayOffset)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()

    // 주말은 상담 적음
    const dailyCount = dayOfWeek === 0 ? 0 : dayOfWeek === 6 ? Math.floor(seededRandom(dayOffset * 7) * 5) + 2 : Math.floor(seededRandom(dayOffset * 3) * 12) + 5

    for (let i = 0; i < dailyCount; i++) {
      const seed = dayOffset * 100 + i
      const counselor = demoCounselors[Math.floor(seededRandom(seed + 1) * demoCounselors.length)]
      const channel = channels[Math.floor(seededRandom(seed + 2) * channels.length)]
      const outcomeRand = seededRandom(seed + 3)
      const outcome: Outcome = outcomeRand < 0.35 ? 'CONVERTED' : outcomeRand < 0.55 ? 'FOLLOW_UP' : outcomeRand < 0.7 ? 'PENDING' : outcomeRand < 0.8 ? 'CANCELLED' : outcomeRand < 0.9 ? 'REJECTED' : 'NO_SHOW'

      const category = treatmentCategories[Math.floor(seededRandom(seed + 4) * treatmentCategories.length)]
      const names = treatmentNames[category]
      const treatment = names[Math.floor(seededRandom(seed + 5) * names.length)]

      const baseAmount = Math.floor(seededRandom(seed + 6) * 400 + 50) * 10000
      const isConverted = outcome === 'CONVERTED'

      consultations.push({
        id: `con-${dayOffset}-${i}`,
        counselor_id: counselor.id,
        patient_id: `pat-${seed}`,
        consultation_date: dateStr,
        duration_minutes: Math.floor(seededRandom(seed + 7) * 45) + 10,
        channel,
        outcome,
        treatment_category: category,
        treatment_name: treatment,
        quoted_amount: baseAmount,
        agreed_amount: isConverted ? Math.floor(baseAmount * (0.8 + seededRandom(seed + 8) * 0.2)) : 0,
        paid_amount: isConverted ? Math.floor(baseAmount * (0.7 + seededRandom(seed + 9) * 0.25)) : 0,
        consultation_notes: `${treatment} 상담 진행. ${isConverted ? '시술 예약 완료.' : outcome === 'FOLLOW_UP' ? '재상담 예정.' : ''}`,
        branch: counselor.branch,
        created_at: dateStr,
        counselor,
      })
    }
  }

  return consultations
}

export const demoRecordings: Recording[] = [
  {
    id: 'r1',
    consultation_id: 'con-1-0',
    plaud_transcription_id: 'plaud-abc123',
    transcript_text: '상담사: 안녕하세요, 어떤 시술에 관심이 있으신가요?\n고객: 네, 레이저토닝 시술에 대해 알고 싶어서요.\n상담사: 네, 레이저토닝은 피부 톤 개선과 잡티 제거에 효과적인 시술입니다...',
    summary: '레이저토닝 시술 상담. 고객은 피부톤 개선에 관심. 3회 패키지 할인 안내 후 예약 진행.',
    duration_seconds: 1200,
    created_at: '2026-03-01',
  },
  {
    id: 'r2',
    consultation_id: 'con-2-0',
    plaud_transcription_id: 'plaud-def456',
    transcript_text: '상담사: 안녕하세요, 보톡스 상담 예약하신 분이시죠?\n고객: 네 맞습니다. 이마 주름이 신경쓰여서요.\n상담사: 네, 이마 보톡스는 가장 많이 하시는 시술 중 하나예요...',
    summary: '이마 보톡스 상담. 시술 경험 없는 신규 고객. 가격 비교 후 결정하겠다고 함.',
    duration_seconds: 900,
    created_at: '2026-03-02',
  },
  {
    id: 'r3',
    consultation_id: 'con-3-0',
    plaud_transcription_id: 'plaud-ghi789',
    transcript_text: '상담사: 안녕하세요, 지방흡입 상담 문의주셨죠?\n고객: 네, 복부 지방흡입 비용이랑 과정이 궁금해서요.\n상담사: 복부 지방흡입은 보통 1-2시간 정도 소요되고요...',
    summary: '복부 지방흡입 상담. 비용 및 회복기간 안내. 다음 주 원장님 상담 예약.',
    duration_seconds: 1500,
    created_at: '2026-03-03',
  },
]

// 채널 한글 레이블
export const channelLabels: Record<Channel, string> = {
  TM_OUTBOUND: 'TM 아웃바운드',
  TM_INBOUND: 'TM 인바운드',
  WALK_IN: '내원',
  ONLINE: '온라인',
  KAKAO: '카카오톡',
  REFERRAL: '소개',
  SNS: 'SNS',
  AD: '광고',
  OTHER: '기타',
}

// 결과 한글 레이블
export const outcomeLabels: Record<Outcome, string> = {
  PENDING: '대기',
  CONVERTED: '전환',
  FOLLOW_UP: '재상담',
  CANCELLED: '취소',
  NO_SHOW: '노쇼',
  REJECTED: '보류',
}

// 결과 색상
export const outcomeColors: Record<Outcome, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONVERTED: 'bg-green-100 text-green-800',
  FOLLOW_UP: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  NO_SHOW: 'bg-red-100 text-red-800',
  REJECTED: 'bg-orange-100 text-orange-800',
}

// 채널 색상 (차트용)
export const channelColors: Record<string, string> = {
  TM_OUTBOUND: '#3b82f6',
  TM_INBOUND: '#60a5fa',
  WALK_IN: '#10b981',
  ONLINE: '#8b5cf6',
  KAKAO: '#f59e0b',
  REFERRAL: '#ec4899',
  SNS: '#06b6d4',
  AD: '#f97316',
  OTHER: '#6b7280',
}
