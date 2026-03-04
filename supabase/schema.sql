-- 병원 상담 모니터링 시스템 DB 스키마
-- Supabase PostgreSQL

-- 상담사 테이블
CREATE TABLE counselors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    branch TEXT NOT NULL DEFAULT '본원',
    position TEXT NOT NULL DEFAULT '상담사',
    role TEXT NOT NULL DEFAULT 'counselor' CHECK (role IN ('admin', 'manager', 'counselor')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 환자/고객 테이블
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    gender TEXT CHECK (gender IN ('M', 'F')),
    is_new_patient BOOLEAN DEFAULT true,
    source_channel TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 상담 기록 테이블
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counselor_id UUID REFERENCES counselors(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    consultation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes INTEGER,
    channel TEXT NOT NULL CHECK (channel IN (
        'TM_OUTBOUND', 'TM_INBOUND', 'WALK_IN', 'ONLINE',
        'KAKAO', 'REFERRAL', 'SNS', 'AD', 'OTHER'
    )),
    outcome TEXT NOT NULL DEFAULT 'PENDING' CHECK (outcome IN (
        'PENDING', 'CONVERTED', 'FOLLOW_UP', 'CANCELLED', 'NO_SHOW', 'REJECTED'
    )),
    treatment_category TEXT,
    treatment_name TEXT,
    quoted_amount INTEGER DEFAULT 0,
    agreed_amount INTEGER DEFAULT 0,
    paid_amount INTEGER DEFAULT 0,
    consultation_notes TEXT,
    recording_url TEXT,
    branch TEXT NOT NULL DEFAULT '본원',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 녹취 기록 테이블
CREATE TABLE recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    plaud_transcription_id TEXT,
    transcript_text TEXT,
    summary TEXT,
    file_url TEXT,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_consultations_date ON consultations(consultation_date);
CREATE INDEX idx_consultations_counselor ON consultations(counselor_id);
CREATE INDEX idx_consultations_channel ON consultations(channel);
CREATE INDEX idx_consultations_outcome ON consultations(outcome);
CREATE INDEX idx_consultations_branch ON consultations(branch);
CREATE INDEX idx_recordings_consultation ON recordings(consultation_id);

-- RLS 활성화
ALTER TABLE counselors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 인증된 사용자만 읽기 가능
CREATE POLICY "Authenticated users can read counselors"
    ON counselors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read patients"
    ON patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read consultations"
    ON consultations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read recordings"
    ON recordings FOR SELECT TO authenticated USING (true);

-- 관리자만 쓰기 가능
CREATE POLICY "Admins can insert consultations"
    ON consultations FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Admins can update consultations"
    ON consultations FOR UPDATE TO authenticated
    USING (true);
