-- ============================================================
-- MediRec 디바이스 관리 마이그레이션
-- 기존 schema.sql 테이블과 충돌 없음
-- 생성일: 2026-03-25
-- ============================================================

-- ============================================================
-- 1. 병원 (hospitals)
-- ============================================================
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                          -- 병원명
    code TEXT UNIQUE NOT NULL,                   -- 병원 고유 코드
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE hospitals IS '병원 마스터 테이블';
COMMENT ON COLUMN hospitals.code IS '병원 고유 식별 코드 (예: OBLIV, MEDI)';

-- ============================================================
-- 2. 센터 (centers) - 병원 하위 지점/센터
-- ============================================================
CREATE TABLE centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                          -- 센터명
    code TEXT NOT NULL,                          -- 센터 코드
    config JSONB DEFAULT '{}'::jsonb,            -- 센터별 설정 (녹취 설정, 업로드 경로 등)
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (hospital_id, code)
);

COMMENT ON TABLE centers IS '병원 하위 센터/지점 테이블';
COMMENT ON COLUMN centers.config IS '센터별 설정 (녹취 설정, Google Drive 경로, 업로드 주기 등)';

CREATE INDEX idx_centers_hospital ON centers(hospital_id);

-- ============================================================
-- 3. 상담실 (rooms)
-- ============================================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                          -- 상담실명
    number TEXT,                                 -- 상담실 번호 (예: '101', 'A-3')
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE rooms IS '센터 내 상담실 테이블';

CREATE INDEX idx_rooms_center ON rooms(center_id);

-- ============================================================
-- 4. MediRec 사용자 (users_medirec)
--    Supabase Auth의 auth.users.id를 PK로 사용
-- ============================================================
CREATE TABLE users_medirec (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,                         -- 이메일
    name TEXT NOT NULL,                          -- 사용자명
    role TEXT NOT NULL DEFAULT 'center_manager'
        CHECK (role IN ('super_admin', 'center_manager')),  -- 역할
    is_active BOOLEAN DEFAULT true,              -- 활성 여부
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE users_medirec IS 'MediRec 관리 시스템 사용자 테이블 (Supabase Auth 연동)';
COMMENT ON COLUMN users_medirec.role IS 'super_admin: 전체 관리자, center_manager: 센터 관리자';

-- ============================================================
-- 5. 사용자-센터 매핑 (user_centers)
--    센터 관리자가 접근 가능한 센터 지정
-- ============================================================
CREATE TABLE user_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users_medirec(id) ON DELETE CASCADE,
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, center_id)
);

COMMENT ON TABLE user_centers IS '사용자별 접근 가능 센터 매핑 테이블';

CREATE INDEX idx_user_centers_user ON user_centers(user_id);
CREATE INDEX idx_user_centers_center ON user_centers(center_id);

-- ============================================================
-- 6. 디바이스 (devices) - 녹취 장비
-- ============================================================
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    hostname TEXT NOT NULL,                      -- 디바이스 호스트명
    status TEXT NOT NULL DEFAULT 'offline'
        CHECK (status IN ('online', 'offline', 'error')),  -- 디바이스 상태
    last_heartbeat TIMESTAMPTZ,                  -- 마지막 하트비트 시각
    config JSONB DEFAULT '{}'::jsonb,            -- 디바이스 설정 (녹취 포맷, 스케줄 등)
    disk_free_gb NUMERIC(10, 2),                 -- 남은 디스크 용량 (GB)
    app_version TEXT,                            -- 앱 버전
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE devices IS '녹취 디바이스 (라즈베리파이 등) 관리 테이블';
COMMENT ON COLUMN devices.status IS 'online: 정상, offline: 미연결, error: 오류 발생';
COMMENT ON COLUMN devices.last_heartbeat IS '디바이스가 마지막으로 서버에 응답한 시각';
COMMENT ON COLUMN devices.disk_free_gb IS '디바이스 로컬 디스크 여유 공간 (GB)';

CREATE INDEX idx_devices_room ON devices(room_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_last_heartbeat ON devices(last_heartbeat);

-- ============================================================
-- 7. 디바이스 녹취 파일 (device_recordings)
--    디바이스에서 생성된 녹취 파일 추적
-- ============================================================
CREATE TABLE device_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,                      -- 녹취 파일명
    date DATE NOT NULL,                          -- 녹취 날짜
    start_time TIMESTAMPTZ,                      -- 녹취 시작 시각
    end_time TIMESTAMPTZ,                        -- 녹취 종료 시각
    duration_sec INTEGER,                        -- 녹취 시간 (초)
    file_size_mb NUMERIC(10, 2),                 -- 파일 크기 (MB)
    gdrive_path TEXT,                            -- Google Drive 업로드 경로
    gdrive_uploaded BOOLEAN DEFAULT false,       -- Google Drive 업로드 완료 여부
    plaud_uploaded BOOLEAN DEFAULT false,        -- PLAUD 업로드 완료 여부
    local_deleted BOOLEAN DEFAULT false,         -- 로컬 파일 삭제 여부
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE device_recordings IS '디바이스에서 생성된 녹취 파일 관리 테이블';
COMMENT ON COLUMN device_recordings.gdrive_uploaded IS 'Google Drive 업로드 완료 여부';
COMMENT ON COLUMN device_recordings.plaud_uploaded IS 'PLAUD 서버 업로드 완료 여부';
COMMENT ON COLUMN device_recordings.local_deleted IS '디바이스 로컬에서 파일 삭제 여부';

CREATE INDEX idx_device_recordings_device ON device_recordings(device_id);
CREATE INDEX idx_device_recordings_date ON device_recordings(date);
CREATE INDEX idx_device_recordings_gdrive ON device_recordings(gdrive_uploaded);
CREATE INDEX idx_device_recordings_plaud ON device_recordings(plaud_uploaded);

-- ============================================================
-- RLS 활성화
-- ============================================================
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_medirec ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_recordings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS 정책: 인증된 사용자 읽기 (super_admin은 전체 접근)
-- ============================================================

-- 헬퍼 함수: 현재 사용자가 super_admin인지 확인
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM users_medirec
        WHERE id = auth.uid()
          AND role = 'super_admin'
          AND is_active = true
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_super_admin IS '현재 인증 사용자가 super_admin 역할인지 확인하는 헬퍼 함수';

-- 헬퍼 함수: 현재 사용자가 특정 센터에 접근 가능한지 확인
CREATE OR REPLACE FUNCTION has_center_access(p_center_id UUID)
RETURNS BOOLEAN AS $$
    SELECT is_super_admin() OR EXISTS (
        SELECT 1 FROM user_centers
        WHERE user_id = auth.uid()
          AND center_id = p_center_id
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION has_center_access IS '현재 인증 사용자가 해당 센터에 접근 권한이 있는지 확인';

-- ── hospitals ──
-- super_admin: 전체 읽기, center_manager: 자기 센터가 속한 병원만
CREATE POLICY "인증 사용자 병원 조회"
    ON hospitals FOR SELECT TO authenticated
    USING (
        is_super_admin()
        OR id IN (
            SELECT h.id FROM hospitals h
            JOIN centers c ON c.hospital_id = h.id
            JOIN user_centers uc ON uc.center_id = c.id
            WHERE uc.user_id = auth.uid()
        )
    );

CREATE POLICY "서비스 역할 병원 쓰기"
    ON hospitals FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- ── centers ──
CREATE POLICY "인증 사용자 센터 조회"
    ON centers FOR SELECT TO authenticated
    USING (
        is_super_admin()
        OR has_center_access(id)
    );

CREATE POLICY "서비스 역할 센터 쓰기"
    ON centers FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- ── rooms ──
CREATE POLICY "인증 사용자 상담실 조회"
    ON rooms FOR SELECT TO authenticated
    USING (
        is_super_admin()
        OR has_center_access(center_id)
    );

CREATE POLICY "서비스 역할 상담실 쓰기"
    ON rooms FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- ── users_medirec ──
-- 자기 자신은 항상 조회 가능, super_admin은 전체 조회
CREATE POLICY "사용자 본인 또는 관리자 조회"
    ON users_medirec FOR SELECT TO authenticated
    USING (
        id = auth.uid()
        OR is_super_admin()
    );

CREATE POLICY "서비스 역할 사용자 쓰기"
    ON users_medirec FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- ── user_centers ──
CREATE POLICY "인증 사용자 센터매핑 조회"
    ON user_centers FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR is_super_admin()
    );

CREATE POLICY "서비스 역할 센터매핑 쓰기"
    ON user_centers FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- ── devices ──
-- center_manager는 자기 센터 소속 상담실의 디바이스만 조회
CREATE POLICY "인증 사용자 디바이스 조회"
    ON devices FOR SELECT TO authenticated
    USING (
        is_super_admin()
        OR EXISTS (
            SELECT 1 FROM rooms r
            JOIN user_centers uc ON uc.center_id = r.center_id
            WHERE r.id = devices.room_id
              AND uc.user_id = auth.uid()
        )
    );

CREATE POLICY "서비스 역할 디바이스 쓰기"
    ON devices FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- ── device_recordings ──
-- center_manager는 자기 센터 소속 디바이스의 녹취만 조회
CREATE POLICY "인증 사용자 녹취파일 조회"
    ON device_recordings FOR SELECT TO authenticated
    USING (
        is_super_admin()
        OR EXISTS (
            SELECT 1 FROM devices d
            JOIN rooms r ON r.id = d.room_id
            JOIN user_centers uc ON uc.center_id = r.center_id
            WHERE d.id = device_recordings.device_id
              AND uc.user_id = auth.uid()
        )
    );

CREATE POLICY "서비스 역할 녹취파일 쓰기"
    ON device_recordings FOR ALL TO service_role
    USING (true) WITH CHECK (true);
