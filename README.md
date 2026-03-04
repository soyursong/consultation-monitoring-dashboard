# 병원 상담 모니터링 시스템

병원 상담실장들이 플라우드(Plaud AI)로 녹취한 상담 내역을 분석하고, 상담 전환율/객단가/채널별 성과 등을 모니터링할 수 있는 대시보드입니다.

## 주요 기능

- **대시보드** - KPI 카드(상담건수, 전환율, 매출, 객단가), 일별 추이 차트, 채널별 분석, 상담사 랭킹
- **상담 관리** - 상담 등록/조회, 필터링, 검색, 페이지네이션
- **상담사 성과** - 상담사별 KPI 비교, 전환율 차트, 채널별 전환율 분석
- **녹취 관리** - 플라우드 연동, STT 전사 텍스트 보기, AI 요약
- **역할별 권한** - 관리자/실장/상담사 역할 기반 접근 제어

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **DB/Auth**: Supabase (PostgreSQL + Auth + RLS)
- **녹취 연동**: Plaud Developer API

## 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local에 Supabase URL과 Key를 입력하세요

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 대시보드를 확인할 수 있습니다.

> 현재 데모 모드로 Supabase 연결 없이도 샘플 데이터로 동작합니다.

## DB 설정 (Supabase)

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. `supabase/schema.sql` 실행하여 테이블 생성
3. `.env.local`에 Supabase URL과 Anon Key 입력

## 프로젝트 구조

```
src/
  app/
    (dashboard)/        # 대시보드 레이아웃 그룹
      page.tsx          # 메인 대시보드
      consultations/    # 상담 관리
      counselors/       # 상담사 성과
      recordings/       # 녹취 관리
      settings/         # 설정
    login/              # 로그인
  components/
    dashboard/          # 대시보드 공통 컴포넌트
    charts/             # 차트 컴포넌트
    ui/                 # shadcn/ui 컴포넌트
  lib/
    supabase/           # Supabase 클라이언트
    types/              # TypeScript 타입 정의
    demo-data.ts        # 데모 데이터
    format.ts           # 포맷 유틸리티
```
