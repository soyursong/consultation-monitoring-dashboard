-- ============================================================
-- MediRec 전체 마이그레이션 + 초기 데이터
-- Supabase SQL Editor에서 실행
-- ============================================================

-- ============================================================
-- 1. 테이블 생성
-- ============================================================

CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (hospital_id, code)
);

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    number TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    hostname TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error')),
    last_heartbeat TIMESTAMPTZ,
    config JSONB DEFAULT '{}'::jsonb,
    disk_free_gb NUMERIC(10, 2),
    app_version TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS device_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_sec INTEGER,
    file_size_mb NUMERIC(10, 2),
    gdrive_path TEXT,
    gdrive_uploaded BOOLEAN DEFAULT false,
    plaud_uploaded BOOLEAN DEFAULT false,
    local_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. 인덱스
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_centers_hospital ON centers(hospital_id);
CREATE INDEX IF NOT EXISTS idx_rooms_center ON rooms(center_id);
CREATE INDEX IF NOT EXISTS idx_devices_room ON devices(room_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_heartbeat ON devices(last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_recordings_device ON device_recordings(device_id);
CREATE INDEX IF NOT EXISTS idx_recordings_date ON device_recordings(date);

-- ============================================================
-- 3. RLS 활성화
-- ============================================================

ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_recordings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. RLS 정책 — anon 키로 디바이스 읽기/쓰기 허용
--    (클라이언트 앱이 anon key로 heartbeat 전송)
-- ============================================================

-- 모든 테이블: anon 읽기 허용
CREATE POLICY "anon_read_hospitals" ON hospitals FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_centers" ON centers FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_rooms" ON rooms FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_devices" ON devices FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_recordings" ON device_recordings FOR SELECT TO anon USING (true);

-- devices: anon 쓰기 허용 (heartbeat, 디바이스 등록)
CREATE POLICY "anon_insert_devices" ON devices FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_devices" ON devices FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- device_recordings: anon 쓰기 허용 (녹취 파일 보고)
CREATE POLICY "anon_insert_recordings" ON device_recordings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_recordings" ON device_recordings FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- 5. 초기 데이터 — 오블리브 풋센터 R01~R05
-- ============================================================

-- 병원
INSERT INTO hospitals (name, code) VALUES ('오블리브', 'OBLIV')
ON CONFLICT (code) DO NOTHING;

-- 센터
INSERT INTO centers (hospital_id, name, code, config)
SELECT h.id, '풋센터', 'FOOT', '{"schedule": {"mon": {"start": "09:00", "end": "20:00"}, "sat": {"start": "09:00", "end": "13:00"}}}'::jsonb
FROM hospitals h WHERE h.code = 'OBLIV'
ON CONFLICT (hospital_id, code) DO NOTHING;

-- 상담실 5개
INSERT INTO rooms (center_id, name, number)
SELECT c.id, '상담실 1', 'R01'
FROM centers c JOIN hospitals h ON c.hospital_id = h.id
WHERE h.code = 'OBLIV' AND c.code = 'FOOT';

INSERT INTO rooms (center_id, name, number)
SELECT c.id, '상담실 2', 'R02'
FROM centers c JOIN hospitals h ON c.hospital_id = h.id
WHERE h.code = 'OBLIV' AND c.code = 'FOOT';

INSERT INTO rooms (center_id, name, number)
SELECT c.id, '상담실 3', 'R03'
FROM centers c JOIN hospitals h ON c.hospital_id = h.id
WHERE h.code = 'OBLIV' AND c.code = 'FOOT';

INSERT INTO rooms (center_id, name, number)
SELECT c.id, '상담실 4', 'R04'
FROM centers c JOIN hospitals h ON c.hospital_id = h.id
WHERE h.code = 'OBLIV' AND c.code = 'FOOT';

INSERT INTO rooms (center_id, name, number)
SELECT c.id, '상담실 5', 'R05'
FROM centers c JOIN hospitals h ON c.hospital_id = h.id
WHERE h.code = 'OBLIV' AND c.code = 'FOOT';
