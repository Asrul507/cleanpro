-- ============================================================
-- CLEANPRO — SUPABASE SQL SCHEMA
-- Cleaning Service Patrol & Activity Monitoring System
-- ============================================================
-- Jalankan script ini di Supabase SQL Editor
-- Project: https://app.supabase.com → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama        TEXT NOT NULL,
  username    TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('leader', 'supervisor')),
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: areas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.areas (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama_area   TEXT NOT NULL,
  kategori    TEXT DEFAULT 'Lainnya',
  qr_code     TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: checklists
-- ============================================================
CREATE TABLE IF NOT EXISTS public.checklists (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  area_id         UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  item_checklist  TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: shifts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shifts (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tanggal     DATE NOT NULL,
  shift       TEXT NOT NULL CHECK (shift IN ('pagi', 'siang', 'malam')),
  jam_masuk   TEXT,
  jam_keluar  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  area_id     UUID NOT NULL REFERENCES public.areas(id),
  waktu       TIMESTAMPTZ DEFAULT NOW(),
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: task_photos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_photos (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id     UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  photo_url   TEXT NOT NULL,
  photo_path  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: task_checklists
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_checklists (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id       UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  checklist_id  UUID NOT NULL REFERENCES public.checklists(id),
  status        BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id    ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_area_id    ON public.tasks(area_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shifts_user_id   ON public.shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_tanggal   ON public.shifts(tanggal);
CREATE INDEX IF NOT EXISTS idx_checklists_area  ON public.checklists(area_id);
CREATE INDEX IF NOT EXISTS idx_task_photos_task ON public.task_photos(task_id);
CREATE INDEX IF NOT EXISTS idx_task_chk_task    ON public.task_checklists(task_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_photos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_checklists ENABLE ROW LEVEL SECURITY;

-- NOTE: Karena aplikasi menggunakan custom auth (bukan Supabase Auth),
-- kita menggunakan anon key dengan policies terbuka.
-- Di production, migrasi ke Supabase Auth untuk keamanan lebih kuat.

-- Allow all operations via anon key (cocok untuk custom auth)
-- Ganti dengan RLS yang lebih ketat saat sudah pakai Supabase Auth

CREATE POLICY "Allow anon read users"   ON public.users          FOR SELECT USING (true);
CREATE POLICY "Allow anon insert users" ON public.users          FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update users" ON public.users          FOR UPDATE USING (true);

CREATE POLICY "Allow anon all areas"    ON public.areas          FOR ALL USING (true);
CREATE POLICY "Allow anon all checklists" ON public.checklists   FOR ALL USING (true);
CREATE POLICY "Allow anon all shifts"   ON public.shifts         FOR ALL USING (true);
CREATE POLICY "Allow anon all tasks"    ON public.tasks          FOR ALL USING (true);
CREATE POLICY "Allow anon all photos"   ON public.task_photos    FOR ALL USING (true);
CREATE POLICY "Allow anon all task_chk" ON public.task_checklists FOR ALL USING (true);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Buat bucket di Supabase Storage → New Bucket
-- Name: task-photos
-- Public: true (untuk akses foto via URL)
-- Jalankan ini di SQL Editor:

INSERT INTO storage.buckets (id, name, public)
VALUES ('task-photos', 'task-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow upload task-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'task-photos');

CREATE POLICY "Allow read task-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'task-photos');

CREATE POLICY "Allow delete task-photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'task-photos');

-- ============================================================
-- REALTIME
-- ============================================================
-- Enable realtime untuk tabel tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Supervisor account (password: supervisor123)
INSERT INTO public.users (nama, username, password, role, active) VALUES
  ('Admin Supervisor', 'supervisor', 'supervisor123', 'supervisor', true)
ON CONFLICT (username) DO NOTHING;

-- Leader accounts (password: leader123)
INSERT INTO public.users (nama, username, password, role, active) VALUES
  ('Budi Santoso', 'budi', 'leader123', 'leader', true),
  ('Siti Aminah', 'siti', 'leader123', 'leader', true),
  ('Eko Prasetyo', 'eko', 'leader123', 'leader', true),
  ('Dewi Rahayu', 'dewi', 'leader123', 'leader', true)
ON CONFLICT (username) DO NOTHING;

-- Sample areas
INSERT INTO public.areas (nama_area, kategori, qr_code) VALUES
  ('Toilet A Lt.1', 'Toilet', 'QR-TOILET-A-L1'),
  ('Toilet B Lt.1', 'Toilet', 'QR-TOILET-B-L1'),
  ('Toilet A Lt.2', 'Toilet', 'QR-TOILET-A-L2'),
  ('Toilet B Lt.2', 'Toilet', 'QR-TOILET-B-L2'),
  ('Lobby Utama', 'Lobby', 'QR-LOBBY-UTAMA'),
  ('Lobby Timur', 'Lobby', 'QR-LOBBY-TIMUR'),
  ('Foodcourt Lt.3', 'Foodcourt', 'QR-FOODCOURT-L3'),
  ('Musholla Lt.2', 'Musholla', 'QR-MUSHOLLA-L2'),
  ('Basement Parkir', 'Basement', 'QR-BASEMENT-PKR'),
  ('Koridor Utara', 'Koridor', 'QR-KORIDOR-UTARA')
ON CONFLICT (qr_code) DO NOTHING;

-- Checklist for Toilet areas
DO $$
DECLARE
  toilet_a_id UUID;
  toilet_b_id UUID;
  toilet_a2_id UUID;
  toilet_b2_id UUID;
  lobby_id UUID;
  foodcourt_id UUID;
  musholla_id UUID;
BEGIN
  SELECT id INTO toilet_a_id FROM public.areas WHERE qr_code = 'QR-TOILET-A-L1';
  SELECT id INTO toilet_b_id FROM public.areas WHERE qr_code = 'QR-TOILET-B-L1';
  SELECT id INTO toilet_a2_id FROM public.areas WHERE qr_code = 'QR-TOILET-A-L2';
  SELECT id INTO toilet_b2_id FROM public.areas WHERE qr_code = 'QR-TOILET-B-L2';
  SELECT id INTO lobby_id FROM public.areas WHERE qr_code = 'QR-LOBBY-UTAMA';
  SELECT id INTO foodcourt_id FROM public.areas WHERE qr_code = 'QR-FOODCOURT-L3';
  SELECT id INTO musholla_id FROM public.areas WHERE qr_code = 'QR-MUSHOLLA-L2';

  -- Toilet checklists
  INSERT INTO public.checklists (area_id, item_checklist) VALUES
    (toilet_a_id, 'Tissue tersedia'),
    (toilet_a_id, 'Lantai bersih dan kering'),
    (toilet_a_id, 'Wastafel bersih'),
    (toilet_a_id, 'Kaca wastafel bersih'),
    (toilet_a_id, 'Tempat sampah tidak penuh'),
    (toilet_a_id, 'Tidak ada bau tidak sedap'),
    (toilet_a_id, 'Sabun cair tersedia'),
    (toilet_b_id, 'Tissue tersedia'),
    (toilet_b_id, 'Lantai bersih dan kering'),
    (toilet_b_id, 'Wastafel bersih'),
    (toilet_b_id, 'Kaca wastafel bersih'),
    (toilet_b_id, 'Tempat sampah tidak penuh'),
    (toilet_b_id, 'Tidak ada bau tidak sedap'),
    (toilet_b_id, 'Sabun cair tersedia'),
    (toilet_a2_id, 'Tissue tersedia'),
    (toilet_a2_id, 'Lantai bersih dan kering'),
    (toilet_a2_id, 'Wastafel bersih'),
    (toilet_a2_id, 'Tempat sampah tidak penuh'),
    (toilet_a2_id, 'Tidak ada bau tidak sedap'),
    (toilet_b2_id, 'Tissue tersedia'),
    (toilet_b2_id, 'Lantai bersih dan kering'),
    (toilet_b2_id, 'Wastafel bersih'),
    (toilet_b2_id, 'Tempat sampah tidak penuh'),
    (toilet_b2_id, 'Tidak ada bau tidak sedap');

  -- Lobby checklists
  INSERT INTO public.checklists (area_id, item_checklist) VALUES
    (lobby_id, 'Lantai bersih dan mengkilap'),
    (lobby_id, 'Kaca pintu bersih'),
    (lobby_id, 'Sofa/kursi rapi'),
    (lobby_id, 'Asbak bersih'),
    (lobby_id, 'Tanaman hias bersih'),
    (lobby_id, 'Tidak ada sampah berserakan');

  -- Foodcourt checklists
  INSERT INTO public.checklists (area_id, item_checklist) VALUES
    (foodcourt_id, 'Meja dibersihkan'),
    (foodcourt_id, 'Kursi dirapikan'),
    (foodcourt_id, 'Lantai disapu dan dipel'),
    (foodcourt_id, 'Tempat sampah dikosongkan'),
    (foodcourt_id, 'Saluran air tidak tersumbat'),
    (foodcourt_id, 'Tidak ada sisa makanan di lantai');

  -- Musholla checklists
  INSERT INTO public.checklists (area_id, item_checklist) VALUES
    (musholla_id, 'Lantai disapu'),
    (musholla_id, 'Sajadah dirapikan'),
    (musholla_id, 'Tempat wudhu bersih'),
    (musholla_id, 'Tempat sampah dikosongkan'),
    (musholla_id, 'Al-Quran dirapikan');
END $$;

-- Sample shifts (today + 7 days)
DO $$
DECLARE
  budi_id UUID;
  siti_id UUID;
  eko_id UUID;
  dewi_id UUID;
BEGIN
  SELECT id INTO budi_id FROM public.users WHERE username = 'budi';
  SELECT id INTO siti_id FROM public.users WHERE username = 'siti';
  SELECT id INTO eko_id  FROM public.users WHERE username = 'eko';
  SELECT id INTO dewi_id FROM public.users WHERE username = 'dewi';

  INSERT INTO public.shifts (user_id, tanggal, shift, jam_masuk, jam_keluar) VALUES
    (budi_id, CURRENT_DATE, 'pagi',  '07:00', '15:00'),
    (siti_id, CURRENT_DATE, 'siang', '15:00', '23:00'),
    (eko_id,  CURRENT_DATE, 'malam', '23:00', '07:00'),
    (dewi_id, CURRENT_DATE, 'pagi',  '07:00', '15:00'),
    (budi_id, CURRENT_DATE + 1, 'siang', '15:00', '23:00'),
    (siti_id, CURRENT_DATE + 1, 'pagi',  '07:00', '15:00'),
    (eko_id,  CURRENT_DATE + 1, 'pagi',  '07:00', '15:00'),
    (dewi_id, CURRENT_DATE + 1, 'malam', '23:00', '07:00');
END $$;

-- ============================================================
-- VIEWS (opsional, untuk kemudahan query)
-- ============================================================

CREATE OR REPLACE VIEW public.v_tasks_full AS
SELECT
  t.id,
  t.created_at,
  t.note,
  t.waktu,
  u.nama AS leader_nama,
  u.username AS leader_username,
  a.nama_area,
  a.kategori,
  COUNT(DISTINCT tp.id) AS foto_count,
  COUNT(DISTINCT tc.id) AS checklist_total,
  SUM(CASE WHEN tc.status THEN 1 ELSE 0 END) AS checklist_done
FROM public.tasks t
JOIN public.users u ON t.user_id = u.id
JOIN public.areas a ON t.area_id = a.id
LEFT JOIN public.task_photos tp ON t.id = tp.task_id
LEFT JOIN public.task_checklists tc ON t.id = tc.task_id
GROUP BY t.id, u.nama, u.username, a.nama_area, a.kategori;
