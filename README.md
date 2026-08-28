# SimQuran v2

Sistem Informasi Manajemen pembelajaran Al-Qur'an (Tahfidz & Tahsin) untuk sekolah — mengelola pengguna, kelas, kelompok bimbingan, setoran harian, target mingguan, tashih (verifikasi bacaan), munaqasyah (ujian akhir per juz), penilaian, dan rapor dengan ekspor PDF.

Dibangun ulang dari proyek `sim-siswa-sdit` dengan arsitektur yang diperbarui.

## Teknologi

- **Next.js 16** (App Router) + React 19 + TypeScript
- **PostgreSQL** via Prisma 7 (`@prisma/adapter-pg`)
- **better-auth** — login username/password, plugin `username` + `admin`
- Tailwind CSS v4 + shadcn/ui, @tanstack/react-form + Zod, Recharts, @react-pdf/renderer

## Fitur Utama

| Peran | Kemampuan |
|---|---|
| **Superadmin / Admin** | Manajemen pengguna (+ impor CSV), kelas & naik kelas, pengaturan akademik, pengaturan penilaian |
| **Koordinator** | Kelola kelompok, approve & jadwalkan Tashih/Munaqasyah, input hasil, monitor seluruh setoran |
| **Guru** | Catat setoran harian, target mingguan, input nilai rapor, ajukan Tashih/Munaqasyah, menilai sebagai penguji |
| **Siswa** | Catat aktivitas rumah, lihat target, setoran, jadwal/hasil ujian, dan rapor sendiri |

## Menjalankan Proyek

Prasyarat: Node.js (LTS) dan PostgreSQL.

```bash
# 1. Install dependensi
npm install

# 2. Konfigurasi environment
#    Salin .env.example → .env, lalu isi DATABASE_URL dan BETTER_AUTH_SECRET
#    (generate secret: openssl rand -base64 32)

# 3. Siapkan database
npx prisma migrate dev      # jalankan migrasi
npx prisma db seed          # seed data referensi Qur'an + akun superadmin

# 4. Jalankan
npm run dev                 # http://localhost:3000
```

Login awal hasil seed: username `superadmin`, password `superAdmin2026!` — **segera ganti di produksi**.

### Perintah Lain

```bash
npm run build               # build produksi
npm run start               # jalankan build produksi
npm run lint                # ESLint
npx prisma studio           # GUI database
npx prisma generate         # regenerate client setelah ubah schema
                            # (output ke src/lib/generated/prisma/)
```

## Dokumentasi

- [docs/HANDOVER-DEVELOPER.md](docs/HANDOVER-DEVELOPER.md) — dokumen teknis lengkap: arsitektur, model data, peta rute, alur bisnis, konvensi kode, riwayat pengembangan
- [docs/PANDUAN-PENGGUNA.md](docs/PANDUAN-PENGGUNA.md) — panduan penggunaan per peran untuk end user
- [CLAUDE.md](CLAUDE.md) — panduan konvensi kode untuk pengembangan berbantuan AI

Versi PDF kedua dokumen tersedia di folder `docs/`.

## Struktur Proyek (ringkas)

```
src/
├── app/                  # halaman App Router (login, dashboard/*)
├── features/<nama>/      # modul fitur: queries/ (baca), actions/ (mutasi),
│                         # components/, *.schema.ts (Zod)
├── components/           # shadcn/ui + layout (sidebar, filter tabel)
└── lib/                  # auth, prisma, guard role, util PDF
prisma/                   # schema, migrasi, seed + data referensi JSON
```

Penjelasan lengkap tiap bagian ada di dokumen handover developer.
