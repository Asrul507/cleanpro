# 🧹 CleanPro — Cleaning Service Patrol & Activity Monitoring System

> **Modern operational dashboard** untuk monitoring aktivitas dan kinerja leader cleaning service menggunakan QR patrol, checklist, upload foto, dan realtime timeline.

---

## ✨ Fitur Utama

| Fitur | Leader | Supervisor |
|-------|--------|-----------|
| QR Patrol Scan | ✅ | ✅ |
| Input Checklist | ✅ (saat shift) | ✅ |
| Upload Foto | ✅ (saat shift) | ✅ |
| Timeline Riwayat | Milik sendiri | Semua user |
| User Management | ❌ | ✅ |
| Area & QR Generator | ❌ | ✅ |
| Kelola Checklist | ❌ | ✅ |
| Jadwal Shift | ❌ | ✅ |
| Export PDF/Excel | ✅ | ✅ |
| Dashboard Realtime | - | ✅ |

---

## 🚀 Quick Start (5 Menit)

### Step 1 — Setup Supabase

1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Isi nama project, database password, pilih region terdekat (Singapore)
3. Tunggu project siap (~2 menit)
4. Buka **SQL Editor** → **New Query**
5. Copy-paste isi file `schema.sql` → klik **Run**
6. Buka **Project Settings** → **API**:
   - Copy **Project URL** → `SUPABASE_URL`
   - Copy **anon / public key** → `SUPABASE_ANON_KEY`

### Step 2 — Konfigurasi Aplikasi

Edit file `config/config.js`:

```js
window.CLEANPRO_CONFIG = {
  SUPABASE_URL: 'https://xxxxxxxxxxxx.supabase.co',  // ← ganti ini
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // ← ganti ini
  // ... (sisanya biarkan default)
};
```

### Step 3 — Upload ke GitHub

```bash
# Init git repository
git init
git add .
git commit -m "Initial commit - CleanPro v1.0"

# Buat repo baru di github.com lalu:
git remote add origin https://github.com/USERNAME/cleanpro.git
git branch -M main
git push -u origin main
```

### Step 4 — Deploy ke Netlify

**Cara A — Via Netlify UI (Disarankan):**
1. Buka [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Pilih **GitHub** → authorize → pilih repo `cleanpro`
3. Build settings: biarkan default (sudah ada `netlify.toml`)
4. Klik **Deploy site**
5. Selesai! Situs live dalam ~1 menit ✅

**Cara B — Via Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Step 5 — Environment Variables (Opsional)

Untuk keamanan lebih baik di production, set di Netlify:
- **Site settings** → **Environment variables** → **Add variable**
  - `SUPABASE_URL` = URL project Anda
  - `SUPABASE_ANON_KEY` = anon key Anda

Lalu update `config/config.js` untuk membaca dari env (diperlukan build step).

---

## 🔑 Default Login

Setelah menjalankan `schema.sql`, akun default tersedia:

| Role | Username | Password |
|------|----------|----------|
| Supervisor | `supervisor` | `supervisor123` |
| Leader | `budi` | `leader123` |
| Leader | `siti` | `leader123` |
| Leader | `eko` | `leader123` |
| Leader | `dewi` | `leader123` |

> ⚠️ **Ganti password segera setelah pertama login!**

---

## 📁 Struktur Project

```
cleanpro/
│
├── index.html              # Entry point + auto-redirect
├── login.html              # Halaman login
├── netlify.toml            # Konfigurasi Netlify
├── schema.sql              # Database schema + sample data
│
├── config/
│   └── config.js           # 🔧 EDIT INI — Supabase credentials
│
├── assets/
│   └── css/
│       └── main.css        # Design system (glassmorphism, dark theme)
│
├── services/
│   ├── supabase.js         # Supabase client initialization
│   ├── auth.js             # Login, logout, session, role guard
│   ├── task.js             # CRUD task, checklist, area
│   └── upload.js           # Image compress + upload ke Storage
│
├── utils/
│   ├── helper.js           # Toast, DateUtils, ImageViewer, Sidebar
│   └── export.js           # Export ke PDF & Excel
│
├── components/
│   └── layout.js           # Sidebar & topbar builder
│
└── pages/
    ├── leader/
    │   ├── dashboard.html  # Dashboard leader
    │   ├── scan.html       # QR scan + checklist + foto
    │   ├── history.html    # Riwayat task sendiri
    │   └── profile.html    # Profile + ganti password
    │
    └── supervisor/
        ├── dashboard.html  # Dashboard + realtime monitoring
        ├── scan.html       # QR scan (tanpa batasan shift)
        ├── history.html    # Semua riwayat + filter lengkap
        ├── users.html      # CRUD users + reset password
        ├── areas.html      # Area management + QR generator
        ├── checklists.html # Kelola checklist per area
        ├── shifts.html     # Jadwal shift management
        ├── report.html     # Export laporan PDF & Excel
        └── profile.html    # Profile supervisor
```

---

## 📱 Cara Penggunaan

### Alur Leader (Saat Shift)
1. Login → pilih shift yang sedang berjalan
2. Dashboard → klik **Scan QR untuk Input Task**
3. Arahkan kamera ke QR code di area → sistem membaca area otomatis
4. Isi checklist item yang sudah selesai
5. Upload 1-2 foto sebagai bukti
6. Tambahkan note/keterangan jika perlu
7. Submit → task tersimpan ke timeline

### Alur Supervisor
1. Login → masuk ke dashboard monitoring
2. Lihat timeline realtime semua leader
3. Filter berdasarkan tanggal/user/area
4. Generate laporan PDF/Excel untuk pelaporan
5. Kelola user, area, checklist, dan jadwal shift

---

## 🔧 Konfigurasi Lanjutan

### Menambah Shift Baru
Edit `config/config.js`:
```js
SHIFTS: {
  pagi:  { start: '07:00', end: '15:00', label: 'Pagi',  icon: '🌅' },
  siang: { start: '15:00', end: '23:00', label: 'Siang', icon: '☀️' },
  malam: { start: '23:00', end: '07:00', label: 'Malam', icon: '🌙' },
  // Tambahkan shift baru di sini:
  // sore: { start: '12:00', end: '20:00', label: 'Sore', icon: '🌆' },
},
```

### Limit Upload Foto
```js
IMAGE: {
  MAX_PER_TASK: 2,    // maksimal foto per task
  MAX_SIZE_MB: 5,     // ukuran sebelum compress
  MAX_WIDTH: 1280,    // lebar maksimal
  QUALITY: 0.65,      // kualitas (0.1 - 1.0)
},
```

### Custom Domain Netlify
1. Netlify → **Domain settings** → **Add custom domain**
2. Ikuti instruksi DNS setup
3. SSL otomatis aktif via Let's Encrypt

---

## 🛡️ Keamanan

### Yang Sudah Diimplementasi
- ✅ Role-based route protection
- ✅ Session management (sessionStorage / localStorage)
- ✅ Row Level Security (RLS) Supabase
- ✅ Shift-based access control
- ✅ Image validation (type + size)
- ✅ Input sanitization

### Rekomendasi untuk Production
- [ ] Migrasi ke Supabase Auth (JWT) untuk autentikasi lebih kuat
- [ ] Hashing password menggunakan bcrypt
- [ ] Rate limiting pada endpoint
- [ ] Audit log untuk perubahan data penting

---

## 📊 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS (tanpa framework) |
| Backend-as-a-Service | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Image Compression | Canvas API (built-in browser) |
| QR Scanner | html5-qrcode |
| QR Generator | qrcodejs |
| Chart | Chart.js |
| Export Excel | SheetJS (xlsx) |
| Export PDF | jsPDF |
| Hosting | Netlify |
| CDN | Netlify Edge |

---

## 🐛 Troubleshooting

**Login gagal / "Koneksi bermasalah"**
→ Cek `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di `config/config.js`
→ Pastikan schema.sql sudah dijalankan di Supabase

**Kamera tidak muncul saat scan QR**
→ Pastikan akses kamera diizinkan di browser
→ Coba tombol "Input Manual" sebagai alternatif
→ HTTPS diperlukan untuk akses kamera (Netlify otomatis HTTPS)

**Foto gagal upload**
→ Pastikan Storage Bucket `task-photos` sudah dibuat
→ Cek storage policies sudah diset ke public

**Realtime tidak bekerja**
→ Pastikan `supabase_realtime` publication sudah dijalankan di schema.sql
→ Cek koneksi internet

---

## 📞 Support

Untuk pertanyaan dan dukungan, hubungi tim pengembang atau supervisor sistem.

---

*CleanPro v1.0 — Production Ready*  
*© 2024 Cleaning Service Management System*
