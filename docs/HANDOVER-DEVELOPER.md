# Dokumen Handover Developer — SimQuran v2

> Dokumen serah terima teknis untuk developer yang akan melanjutkan pengembangan/pemeliharaan SimQuran v2.
> Terakhir diperbarui: 2026-08-28. Dokumen ini juga menggabungkan isi `docs/ROADMAP.md` (riwayat pengembangan, Lampiran A) dan `docs/reference-sim-siswa-sdit.md` (referensi proyek lama, Lampiran B) yang sebelumnya terpisah.

---

## Daftar Isi

1. [Ringkasan Sistem](#1-ringkasan-sistem)
2. [Teknologi & Dependensi](#2-teknologi--dependensi)
3. [Setup & Menjalankan Proyek](#3-setup--menjalankan-proyek)
4. [Arsitektur Aplikasi](#4-arsitektur-aplikasi)
5. [Autentikasi & Kontrol Akses (RBAC)](#5-autentikasi--kontrol-akses-rbac)
6. [Model Data (Prisma)](#6-model-data-prisma)
7. [Peta Rute & Akses per Role](#7-peta-rute--akses-per-role)
8. [Daftar Modul Fitur (`src/features/`)](#8-daftar-modul-fitur-srcfeatures)
9. [Alur Bisnis Inti](#9-alur-bisnis-inti)
10. [Konvensi Kode & UI](#10-konvensi-kode--ui)
11. [Hal yang Belum Selesai / Trimming yang Disengaja](#11-hal-yang-belum-selesai--trimming-yang-disengaja)
- [Lampiran A — Riwayat Pengembangan & Keputusan Desain (eks-ROADMAP.md)](#lampiran-a--riwayat-pengembangan--keputusan-desain)
- [Lampiran B — Referensi Proyek Lama sim-siswa-sdit](#lampiran-b--referensi-proyek-lama-sim-siswa-sdit)

---

## 1. Ringkasan Sistem

**SimQuran v2** adalah Sistem Informasi Manajemen pembelajaran Al-Qur'an (tahfidz & tahsin) untuk sekolah, dibangun ulang dari proyek lama `sim-siswa-sdit`. Sistem ini mengelola:

- **Data master**: pengguna (5 role), kelas, kelompok tahfidz/tahsin, referensi Qur'an (surah/juz/wafa), pengaturan akademik.
- **Progres harian**: setoran siswa (dicatat guru), aktivitas rumah (dicatat siswa), target mingguan (dibuat guru).
- **Verifikasi bacaan (Tashih)**: alur request guru → persetujuan & penjadwalan koordinator → hasil lulus/tidak.
- **Ujian akhir (Munaqasyah)**: 2 tahap (Tasmi & Munaqasyah) per juz dengan penilaian terstruktur (kesalahan khofi/jali) dan nilai akhir gabungan berbobot.
- **Penilaian & Rapor**: nilai tahfidz per surah, tahsin per topik, rapor per semester dengan ekspor PDF resmi.
- **Dashboard & visualisasi**: stat card + chart per role (Recharts), termasuk progres bacaan kumulatif per Juz/Wafa.

Seluruh roadmap awal (7 tahap) **sudah selesai** per 2026-08-25 — sistem dalam kondisi fungsional penuh. Detail riwayat pengembangan ada di [Lampiran A](#lampiran-a--riwayat-pengembangan--keputusan-desain).

---

## 2. Teknologi & Dependensi

| Kategori | Teknologi | Versi |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.4 |
| UI Library | React | 19.2.4 |
| Bahasa | TypeScript | ^5 |
| Database | PostgreSQL (via Prisma 7 + `@prisma/adapter-pg`) | Prisma ^7.8.0 |
| Autentikasi | better-auth (plugin `username` + `admin`) | ^1.6.20 |
| Styling | Tailwind CSS v4 + shadcn/ui (base-nova) | — |
| Form | @tanstack/react-form + Zod v4 | ^1.33.0 / ^4.4.3 |
| Tabel | @tanstack/react-table | ^8.21.3 |
| Chart | Recharts | ^3.10.1 |
| PDF | @react-pdf/renderer | ^4.8.1 |
| Ikon | lucide-react, react-icons | — |
| Toast | sonner | ^2.0.7 |
| Tanggal | date-fns, react-day-picker | — |

> **Catatan migrasi**: database awalnya MariaDB/MySQL, sudah dimigrasi ke **PostgreSQL** (commit `101a599`). Prisma client di-generate ke `src/lib/generated/prisma/` (bukan `node_modules`) — jalankan `npx prisma generate` setiap kali skema berubah.

---

## 3. Setup & Menjalankan Proyek

### 3.1 Prasyarat

- Node.js (LTS) + npm
- PostgreSQL berjalan lokal (atau remote)

### 3.2 Environment Variables

Salin `.env.example` → `.env`:

```bash
# Koneksi PostgreSQL untuk Prisma (via @prisma/adapter-pg)
DATABASE_URL="postgresql://postgres:password@localhost:5432/simquran_db"

# better-auth — generate: openssl rand -base64 32
BETTER_AUTH_SECRET=
# Base URL aplikasi (tanpa trailing slash); pakai domain produksi saat deploy
BETTER_AUTH_URL=http://localhost:3000
```

### 3.3 Perintah

```bash
npm install
npx prisma migrate dev      # jalankan semua migrasi
npx prisma db seed          # seed data referensi + akun superadmin
npm run dev                 # dev server di http://localhost:3000

npm run build               # build produksi
npm run start               # jalankan build produksi
npm run lint                # ESLint
npx prisma studio           # GUI database
npx prisma migrate dev --name <nama>   # buat migrasi baru
npx prisma generate         # regenerate client setelah ubah schema
```

### 3.4 Data Seed

`prisma/seed.ts` mengisi:

1. **Data referensi Qur'an** dari `prisma/data/*.json`: 114 surah, 30 juz, pemetaan `SurahJuz` (rentang ayat per juz), daftar buku Wafa + jumlah halaman.
2. **`AcademicSetting`** singleton (id selalu `"singleton"`): tahun/semester berjalan, nama kepala sekolah, nama & alamat sekolah.
3. **Akun Superadmin awal**: username `superadmin`, password `superAdmin2026!` (email dummy `superadmin@local.test`). **Ganti password ini segera di lingkungan produksi.**

---

## 4. Arsitektur Aplikasi

### 4.1 Struktur Direktori

```
src/
├── app/                    # Next.js App Router (halaman tipis, delegasi ke features)
│   ├── login/
│   ├── dashboard/          # semua halaman modul (lihat Peta Rute, bag. 7)
│   └── api/auth/[...all]/  # handler better-auth
├── features/<nama>/        # modul fitur (lihat bag. 8)
│   ├── queries/            # fungsi baca data (TANPA 'use server')
│   ├── actions/            # Server Actions ('use server') untuk mutasi
│   ├── components/         # komponen React spesifik fitur
│   ├── lib/                # helper internal fitur (opsional)
│   └── *.schema.ts         # skema validasi Zod
├── components/
│   ├── ui/                 # shadcn/ui primitives (+ delete-confirm-dialog, dsb.)
│   └── layouts/            # app-sidebar, sidebar-menu.ts, page-header, filters/
└── lib/
    ├── auth.ts             # instance better-auth (server)
    ├── auth-client.ts      # client better-auth (browser)
    ├── permissions.ts      # access control & definisi role better-auth
    ├── require-role.ts     # guard session/role server-side
    ├── prisma.ts           # PrismaClient singleton (adapter pg)
    ├── pdf/                # utilitas format & download PDF
    └── generated/prisma/   # hasil prisma generate (JANGAN edit manual)
```

### 4.2 Pemisahan `queries/` vs `actions/` (penting!)

- **`queries/`** — fungsi async biasa **tanpa** `'use server'`, dipanggil langsung dari Server Component (`page.tsx`). Berjalan in-process, bisa pakai `unstable_cache`/React `cache()`. Tetap wajib panggil `requireSession`/`requireRoleOrThrow` di dalamnya.
- **`actions/`** — Server Actions (`'use server'`) untuk **mutasi**, PLUS fungsi baca (`get-*`) yang dipanggil dari **Client Component saat runtime** (mis. dialog edit yang fetch data di `useEffect`). Server Action adalah satu-satunya mekanisme RPC client→server di App Router.

> Build pernah gagal karena `get-submission.ts` dkk. salah taruh di `queries/` padahal dipanggil dari Client Component — makanya `get-*` yang dipakai dialog edit ada di `actions/`.

### 4.3 Refresh Data setelah Mutasi (pola wajib)

Setiap Server Action yang memutasi data **harus** dipasangkan dengan dua hal, kalau tidak UI akan menampilkan data basi:

1. **Server**: `revalidatePath(path)` di akhir action (setelah mutasi sukses). Pakai tipe `'layout'` (`revalidatePath('/dashboard', 'layout')`) bila data juga tampil di layout (mis. nama user di footer sidebar).
2. **Client**: `router.refresh()` setelah action resolve sukses — tanpa ini Router Cache di halaman yang sedang terbuka tidak refetch.

Pola referensi: `src/features/classrooms/actions/assign-students-to-classroom.ts` + `src/features/classrooms/components/add-student-to-classroom-form.tsx`.

### 4.4 Pola Form

Semua form pakai **@tanstack/react-form** + validator Zod:

```tsx
const form = useForm({
  defaultValues: { ... },
  validators: { onSubmit: zodSchema },
  onSubmit: async ({ value }) => { ... },
});
```

Komponen field kustom: `Field`, `FieldLabel`, `FieldError`, `FieldGroup` (`@/components/ui/field`); `InputGroup*` (`@/components/ui/input-group`).

---

## 5. Autentikasi & Kontrol Akses (RBAC)

### 5.1 better-auth

- Konfigurasi server: `src/lib/auth.ts` — plugin `username()` (login pakai **username**, bukan email) dan `admin()` dengan access control dari `src/lib/permissions.ts`.
- Client: `src/lib/auth-client.ts`; handler HTTP: `/api/auth/[...all]`.
- `adminRoles: ['SUPERADMIN', 'ADMIN']` — hanya kedua role ini punya izin manajemen user via plugin admin. `defaultRole: 'STUDENT'` (wajib, karena default plugin `"user"` tidak ada di enum Prisma).
- Key role di plugin **harus persis sama** (case-sensitive) dengan nilai kolom `role` di DB (uppercase).

### 5.2 Role

| Role (DB) | Deskripsi |
|---|---|
| `SUPERADMIN` | Akses penuh SEMUA menu manajemen + satu-satunya yang bisa edit Pengaturan Penilaian & lihat Data Referensi Qur'an |
| `ADMIN` | Manajemen pengguna, kelas, akademik; Pengaturan Penilaian read-only |
| `COORDINATOR` | Kelola kelompok, monitor setoran, approve/jadwal/nilai Tashih & Munaqasyah |
| `TEACHER` | Kelompok bimbingan, input setoran/target/nilai, ajukan Tashih/Munaqasyah, menilai sebagai penguji |
| `STUDENT` | Lihat data sendiri: rapor, target, setoran; input aktivitas rumah |

### 5.3 Guard Server-Side (`src/lib/require-role.ts`)

- `requireSession()` — redirect ke `/login` jika belum login.
- `requireRole(['admin', ...])` — redirect ke `/dashboard` jika role tidak diizinkan (role ditulis **lowercase**).
- `requireRoleOrThrow(roles)` — versi throw, dipakai di Server Actions/queries.

**Superadmin selalu bypass** pengecekan role di kedua helper — tidak perlu (dan jangan) menambah `'superadmin'` manual ke daftar role. **Caveat**: untuk halaman personal (data milik guru/siswa sendiri yang baca profile `session.user`), bypass ini berarti superadmin bisa masuk tapi tidak punya profile row — guard halaman seperti itu dengan cek keberadaan profile record, bukan hanya role.

### 5.4 Pola Pembuatan User (2 fase)

Lihat `src/features/users/actions/create-user.ts`:

1. `auth.api.createUser()` — buat identitas auth.
2. Prisma buat profile sesuai role (`CoordinatorProfile`/`TeacherProfile`/`StudentProfile`).

Jika fase 2 gagal, fase 1 di-rollback manual via `auth.api.removeUser()`. Email/password default digenerate dari username: `${username}@sekolah.local` / password = username. Ada juga **bulk import CSV** (`bulk-create-users.ts` + `lib/parse-csv.ts`).

---

## 6. Model Data (Prisma)

Skema lengkap: `prisma/schema.prisma` (PostgreSQL). Dikelompokkan per domain:

### 6.1 Auth & Pengguna

| Model | Keterangan |
|---|---|
| `User` | Inti pengguna: `username` (unique, login), `role` (enum), data pribadi (`phoneNumber`, `birthDate/Place`, `address`, `gender`, `bloodType`), field plugin admin (`banned`, `banReason`, `banExpires`) |
| `Session` / `Account` / `Verification` | Dikelola better-auth (password tersimpan di `Account.password`) |
| `CoordinatorProfile` | `userId` (PK), `nip` unique |
| `TeacherProfile` | `userId` (PK), `nip` unique; relasi ke groups, submissions, weeklyTargets, requests, `munaqasyahSchedulesAsExaminer` |
| `StudentProfile` | `userId` (PK), `nis` unique, `nisn?`, `classroomId?`, `groupId?`, `status` (`AKTIF`/`LULUS`/`PINDAH`/`KELUAR`), `graduatedAt?`, `exitedAt?` |

### 6.2 Kelas & Kelompok

| Model | Keterangan |
|---|---|
| `Classroom` | `level` (1–6), `name`, `academicYear`, `semester` (`GANJIL`/`GENAP`), `isActive`. Unique: `[name, academicYear, semester]` |
| `ClassroomHistory` | Arsip penempatan siswa per periode (dipakai saat Naik Kelas / siswa keluar). Unique: `[studentId, classroomId, academicYear, semester]` |
| `Group` | Kelompok tahfidz/tahsin: `name`, `classroomId`, `teacherId` (1 guru per kelompok), `isActive`. Unique: `[name, classroomId]` |
| `GroupHistory` | Arsip keanggotaan kelompok per periode (dipakai saat Naik Kelompok) |

### 6.3 Referensi Qur'an (data seed, read-only di app)

| Model | Keterangan |
|---|---|
| `Surah` | 114 surah: `name`, `verseCount`, `initialScore` (nilai awal Tasmi per surah, editable superadmin) |
| `Juz` | 30 juz |
| `SurahJuz` | Pemetaan surah↔juz dengan `startVerse`/`endVerse` (surah bisa membentang beberapa juz) |
| `Wafa` | Buku metode Wafa: `name`, `pageCount` |

### 6.4 Progres Harian

| Model | Keterangan |
|---|---|
| `Submission` | Setoran harian: `submissionType` (`TAHFIDZ`/`TAHSIN_WAFA`/`TAHSIN_ALQURAN`), referensi juz/surah+ayat ATAU wafa+halaman, `adab` (`BAIK`/`KURANG_BAIK`/`TIDAK_BAIK`), `submissionStatus` (`LULUS`/`TIDAK_LULUS`/`MENGULANG`), `note` |
| `SubmissionDeletionLog` | Log audit snapshot (nama-nama sebagai string) untuk setoran yang dihapus — delete bersifat permanen |
| `HomeActivity` | Aktivitas rumah siswa: `activityType` (`MURAJAAH`/`TILAWAH`/`TARJAMAH`), juz+surah+rentang ayat, `status` (`BELUM_DIPERIKSA`/`SUDAH_DIPERIKSA`) |
| `WeeklyTarget` | Target mingguan dari guru: `type`, rentang tanggal, rentang surah/ayat atau juz atau wafa/halaman, `status` (`TERCAPAI`/`TIDAK_TERCAPAI`), `progressPercent` (cache, dihitung ulang dari irisan ayat submission LULUS — lihat `weekly-targets/recalculate-weekly-target-progress.ts`) |

### 6.5 Tashih (verifikasi bacaan)

Alur: `TashihRequest` → (approve) → `TashihSchedule` (many-to-many via `TashihScheduleRequest`) → `TashihResult`.

| Model | Keterangan |
|---|---|
| `TashihRequest` | Diajukan guru untuk siswa: `tashihType` (`ALQURAN`/`WAFA`), juz/surah atau wafa+rentang halaman, `status` (`MENUNGGU`/`DITERIMA`/`DITOLAK`/`SELESAI`) |
| `TashihSchedule` | Jadwal koordinator: `date`, `sessionName`, `startTime`/`endTime`, `location` |
| `TashihScheduleRequest` | Join table jadwal↔request (satu jadwal berisi banyak peserta) |
| `TashihResult` | 1:1 dengan request: `passed` (boolean) + `notes`. Membuat result → status request jadi `SELESAI`; menghapus → kembali `DITERIMA` |

### 6.6 Penilaian & Rapor

| Model | Keterangan |
|---|---|
| `TahfidzScore` | Nilai per surah: `score`, `grade` (A–D), `description`. Unique `[studentId, groupId, surahId]` → input ulang = update (upsert) |
| `TahsinScore` | Nilai per topik: `tahsinType` (`WAFA`/`ALQURAN`), `topic`, `score`, `grade`. Unique `[studentId, groupId, tahsinType, topic]` |
| `Report` | Rapor per semester: `tahfidzScore`/`tahsinScore` (rata-rata, **dihitung ulang otomatis** setiap upsert/delete skor via `scores/recalculate-report.ts` — bukan snapshot), `lastTahsinMaterial` (diedit guru terpisah). Unique `[studentId, academicYear, semester]` |
| `GradeLetterSetting` | Mapping skor→huruf (A/B/C/D): `minScore` + `description`, editable superadmin |
| `ReportDescriptionTemplate` | Template kalimat deskripsi rapor per tipe (`TAHFIDZ`/`TAHSIN`) dengan placeholder `{grade}`, `{description}`, `{surahName}`/`{topic}` |

### 6.7 Munaqasyah (ujian akhir)

Alur: `MunaqasyahRequest` → `MunaqasyahSchedule` (m2m via `MunaqasyahScheduleRequest`, plus `examinerId` guru penguji opsional) → `MunaqasyahResult` (+ detail per baris) → `MunaqasyahFinalResult` otomatis.

| Model | Keterangan |
|---|---|
| `MunaqasyahRequest` | `tahap` (`TAHAP_1`–`TAHAP_4`), `jenis` (`TASMI`/`MUNAQASYAH`), `juzId`, `status` (sama seperti Tashih) |
| `MunaqasyahSchedule` | Seperti TashihSchedule + `examinerId?` (guru manapun bisa ditunjuk penguji) |
| `MunaqasyahResult` | 1:1 request: `totalScore`, `grade` (`MUMTAZ`/`JAYYID_JIDDAN`/`JAYYID`/`TIDAK_LULUS`), `passed` |
| `TasmiDetail` | Baris per surah dalam juz: `initialScore`, kesalahan khofi (`khofiAwalAyat`, `khofiMakhroj`, `khofiTajwidMad`) & jali (`jaliBaris`, `jaliLebihSatuKalimat`), `totalScore` |
| `MunaqasyahDetail` | Tepat 5 baris soal (`questionNo` 1–5, `initialScore` default 50), field kesalahan sama |
| `MunaqasyahFinalResult` | Dibuat **otomatis** saat kedua tahap (Tasmi & Munaqasyah) selesai untuk siswa+juz+tahap yang sama: `finalScore` = bobot Tasmi×skorTasmi + bobot Munaqasyah×skorMunaqasyah (default 70/30). Unique `[studentId, juzId, tahap]` |
| `MunaqasyahScoringSetting` | Bobot pengurangan per jenis kesalahan per jenis ujian (editable superadmin) |
| `MunaqasyahGradeSetting` | Ambang nilai per grade Munaqasyah |
| `MunaqasyahFinalScoreWeightSetting` | Singleton bobot Tasmi vs Munaqasyah untuk nilai final |

### 6.8 Pengaturan

| Model | Keterangan |
|---|---|
| `AcademicSetting` | Singleton (id `"singleton"`): tahun/semester berjalan, nama kepala sekolah, nama & alamat sekolah — jadi default periode di filter & rapor |

---

## 7. Peta Rute & Akses per Role

Semua rute dashboard dilindungi `requireSession`/`requireRole` server-side. Sumber menu sidebar per role: `src/components/layouts/sidebar-menu.ts`.

| Rute | Akses | Fungsi |
|---|---|---|
| `/` → `/login` | publik | Halaman login (username + password) |
| `/dashboard` | semua role | Beranda: stat card + chart, konten role-branch dalam satu page |
| `/dashboard/account` | semua role | Profil sendiri + ganti password |
| `/dashboard/users` | superadmin, admin | Manajemen pengguna (CRUD, reset password, bulk import CSV, tab per role) |
| `/dashboard/classrooms` | superadmin, admin | Manajemen kelas (CRUD) |
| `/dashboard/classrooms/[classroomId]` | superadmin, admin | Detail kelas: anggota, tambah/keluarkan siswa, **Naik Kelas**, siswa keluar/pindah + reaktivasi |
| `/dashboard/academic-settings` | superadmin, admin | Tahun/semester berjalan + info sekolah |
| `/dashboard/quran-reference` | superadmin | Data referensi surah/juz/wafa (read-only) |
| `/dashboard/scoring-settings` | superadmin (edit), admin (lihat) | 5 tab: Nilai Awal Surah, Bobot Pengurangan, Batas Lulus Munaqasyah, Mapping Huruf, Template Nilai Rapor |
| `/dashboard/group` | coordinator (kelola), teacher (lihat milik sendiri), superadmin | Daftar kelompok |
| `/dashboard/group/[groupId]` | coordinator, teacher (milik sendiri) | Detail kelompok: anggota, **Naik Kelompok**, riwayat |
| `/dashboard/group/[groupId]/student/[studentId]/score` | teacher | Input nilai Tahfidz (per surah) & Tahsin (per topik) |
| `/dashboard/group/[groupId]/student/[studentId]/report` | teacher, coordinator | Rapor siswa + ekspor PDF |
| `/dashboard/report` | student | Rapor sendiri + ekspor PDF |
| `/dashboard/submission` | coordinator (semua), teacher (input & riwayat sendiri), student (riwayat sendiri) | Setoran — role-branch di satu page |
| `/dashboard/home-activity` | student (input & kelola), teacher/coordinator (monitor read-only) | Aktivitas rumah |
| `/dashboard/weekly-target` | teacher (input & kelola), student (lihat sendiri) | Target mingguan |
| `/dashboard/tashih/request` | teacher | Ajukan tashih + riwayat request sendiri |
| `/dashboard/tashih/requests` | coordinator | Terima/tolak request (tombol hanya untuk status MENUNGGU) |
| `/dashboard/tashih/schedules` | coordinator | Buat jadwal dari request DITERIMA (checklist multi-peserta) |
| `/dashboard/tashih/results` | coordinator | Input hasil per peserta terjadwal |
| `/dashboard/tashih/schedule` | teacher, student | Jadwal tashih milik sendiri (read-only, role-branch) |
| `/dashboard/tashih/result` | teacher, student | Hasil tashih milik sendiri (read-only) |
| `/dashboard/munaqasyah/request` | teacher | Ajukan munaqasyah (tahap, jenis, juz) |
| `/dashboard/munaqasyah/requests` | coordinator | Terima/tolak request |
| `/dashboard/munaqasyah/schedules` | coordinator | Jadwal + tunjuk penguji (`examinerId`) |
| `/dashboard/munaqasyah/assessment` | teacher (penguji), coordinator (fallback) | Form penilaian Tasmi (baris per surah) / Munaqasyah (5 soal), kalkulasi live |
| `/dashboard/munaqasyah/results` | coordinator | Rekap hasil + nilai final gabungan |
| `/dashboard/munaqasyah/schedule` | teacher, student | Jadwal munaqasyah sendiri (read-only) |
| `/dashboard/munaqasyah/result` | student | Hasil munaqasyah sendiri |
| `/api/auth/[...all]` | publik | Handler better-auth |

---

## 8. Daftar Modul Fitur (`src/features/`)

| Modul | Fungsi | Catatan penting |
|---|---|---|
| `login` | Form login + skema | — |
| `change-password` | Ganti password sendiri | — |
| `users` | CRUD pengguna, detail profil, reset password, **bulk import CSV**, update profil sendiri | Pola 2 fase auth+profile (bag. 5.4) |
| `academic-settings` | Update tahun akademik & info sekolah | Singleton `AcademicSetting` |
| `classrooms` | CRUD kelas, assign/keluarkan siswa, **Naik Kelas** (`promote-classroom.ts`), siswa keluar (`exit-student.ts`) & reaktivasi | Arsip ke `ClassroomHistory` |
| `groups` | CRUD kelompok, anggota, **Naik Kelompok** (`promote-group` sudah termasuk), riwayat kelompok | `list-my-groups-with-students.ts` dipakai bersama Submission & WeeklyTarget untuk cascading select |
| `quran-reference` | Tabel referensi surah/juz/wafa; `list-reference-options.ts` untuk dropdown lintas-role (hanya butuh login) | Halaman superadmin-only, tapi query options tidak |
| `submissions` | CRUD setoran + cek duplikat + log penghapusan (`SubmissionDeletionLog`) + ekspor PDF | `get-locked-submission-ids.ts` — setoran terkunci dari edit |
| `home-activities` | CRUD aktivitas rumah siswa + update status periksa (guru) + ekspor PDF | `groupId` otomatis dari profil siswa |
| `weekly-targets` | CRUD target + `recalculate-weekly-target-progress.ts` (irisan ayat/halaman submission LULUS) + ekspor PDF | Opsi bulk "semua siswa di kelompok" |
| `tashih` | Request → respond → schedule → result lengkap dengan edit/delete, validasi cakupan (`validate-tashih-coverage.ts`, `is-range-covered.ts`), cek duplikat, ekspor PDF | Hapus result mengembalikan status request ke DITERIMA |
| `munaqasyah` | Request → respond → schedule (dengan penguji) → penilaian Tasmi/Munaqasyah → finalisasi otomatis (`try-finalize-munaqasyah.ts`); pengaturan bobot/grade/nilai awal surah; ekspor PDF | Logika skor di `munaqasyah-scoring.ts`; sudah ada edit/delete hasil (`update/delete-*-result.ts`) — lebih lengkap dari catatan roadmap lama |
| `scores` | Upsert/delete nilai Tahfidz & Tahsin, rekalkulasi `Report` otomatis, rapor + **PDF rapor resmi** (`student-report-pdf.tsx`), pengaturan mapping huruf & template deskripsi | Grade dihitung dari `GradeLetterSetting` (bukan hardcode) |
| `reading-progress` | Progres kumulatif per Juz/Wafa dari `TashihRequest` & `Submission`: panel chart (guru/koordinator, drill-down klik batang) & progress bar list (siswa) | Filter re-fetch via Server Action, bukan API route |
| `dashboard` | Query stat & chart per role + komponen stat-card/score-bar-chart | — |

---

## 9. Alur Bisnis Inti

### 9.1 Naik Kelas (`classrooms/actions/promote-classroom.ts`)

Admin checklist siswa **per siswa** (bukan satu kelas sekaligus) di halaman detail kelas:
- Siswa terpilih → diarsip ke `ClassroomHistory` → dipindah ke kelas level+1 pada tahun/semester tujuan yang diinput manual (kelas tujuan dibuat otomatis bila belum ada).
- Siswa **kelas 6** → langsung diluluskan: `status: LULUS`, `graduatedAt` diisi, `classroomId` dikosongkan.
- Siswa tidak dicentang → tetap di kelas lama (tinggal kelas). Kelas lama ditandai `isActive: false` hanya bila sudah kosong.

### 9.2 Naik Kelompok (`groups`)

Aksi terpisah oleh koordinator (tidak otomatis ikut Naik Kelas): seluruh anggota diarsip ke `GroupHistory` (periode dari `Group.classroom`), semua siswa dilepas, kelompok ditutup (`isActive: false`). Kelompok baru dibentuk manual.

### 9.3 Tashih

```
Guru ajukan request (pilih kelompok→siswa→jenis ALQURAN/WAFA + materi)
  → Koordinator terima/tolak (MENUNGGU → DITERIMA/DITOLAK)
  → Koordinator buat jadwal, checklist request DITERIMA yang belum terjadwal
  → Koordinator input hasil (passed/notes) → status request SELESAI
  (hapus hasil → status kembali DITERIMA)
```

Hasil tashih `SELESAI` + `tashihType=ALQURAN` adalah **basis perhitungan progres juz** di reading-progress (bukan TahfidzScore).

### 9.4 Munaqasyah

```
Guru ajukan request (tahap TAHAP_1–4, jenis TASMI/MUNAQASYAH, juz)
  → Koordinator terima/tolak
  → Koordinator jadwalkan + tunjuk penguji (guru manapun, opsional)
  → Penguji (schedule.examinerId) menilai via /dashboard/munaqasyah/assessment
    (koordinator juga boleh sebagai fallback)
  → Setelah TASMI & MUNAQASYAH selesai utk siswa+juz+tahap yang sama:
    MunaqasyahFinalResult dibuat OTOMATIS (try-finalize-munaqasyah.ts)
```

**Rumus skor** (`munaqasyah-scoring.ts`, bobot kini configurable via `MunaqasyahScoringSetting`):

- Tasmi per surah: `rawScore = max(0, initialScore − wKhofi×totalKhofi − wJali×totalJali)`; persentase = rawScore/initialScore×100; total = rata-rata persentase seluruh surah.
- Munaqasyah per soal (wajib 5 soal, basis 50): `rawScore = max(0, 50 − wKhofi×totalKhofi − wJali×totalJali)`; total = rata-rata 5 soal.
- Final: `finalScore = tasmi×bobotTasmi% + munaqasyah×bobotMunaqasyah%` (default 70/30, configurable). Grade dari `MunaqasyahGradeSetting` (default: ≥91 MUMTAZ, ≥85 JAYYID_JIDDAN, ≥80 JAYYID, sisanya TIDAK_LULUS).

### 9.5 Nilai & Rapor

- Guru input nilai per surah (Tahfidz) / per topik (Tahsin) — **upsert** berdasar unique constraint, input ulang = update.
- Huruf nilai (A–D) dan deskripsi otomatis dari `GradeLetterSetting` + `ReportDescriptionTemplate` (configurable superadmin, bukan hardcode).
- `Report.tahfidzScore/tahsinScore` **dihitung ulang otomatis** setiap upsert/delete skor (`recalculate-report.ts`) — bukan snapshot beku.
- `lastTahsinMaterial` diedit guru terpisah.
- Ekspor PDF rapor via `@react-pdf/renderer` (`student-report-pdf.tsx`): kop 2 logo (`public/logo-sekolah.png`, `public/logo-wafa.png`), tabel evaluasi, KKM, tanda tangan Kepala Sekolah & Koordinator.

### 9.6 Tiga Konsep "Progres" yang Berbeda (jangan tertukar)

1. **Progres target mingguan** — irisan level-ayat antara cakupan target dan `Submission` berstatus LULUS (`recalculate-weekly-target-progress.ts`).
2. **Progres bacaan Juz/Wafa** (chart dashboard) — dari `TashihRequest` SELESAI (Tahfidz/Wafa) dan `Submission` overlap ayat (Tahsin Al-Qur'an), kumulatif sampai periode berjalan (`reading-progress/`).
3. **Nilai rapor** — rata-rata `TahfidzScore`/`TahsinScore` di `Report`.

Ketiganya sengaja dipisah (mengikuti desain proyek lama).

---

## 10. Konvensi Kode & UI

- **Bahasa UI**: Indonesia (`"Masuk"`, `"Berhasil login!"`, dst).
- **Toast**: `toast.success()`/`toast.error()` dari `sonner`.
- **Styling**: Tailwind v4, shadcn/ui base-nova, util `cn()` dari `@/lib/utils`. Path alias `@/*` → `src/*`.
- **Tombol hapus wajib konfirmasi**: bungkus dengan `DeleteConfirmDialog` (`src/components/ui/delete-confirm-dialog.tsx`, pass sebagai `trigger`); handler return `true`/`false` — dialog hanya tutup saat sukses. Tombol edit tidak perlu.
- **Tabel wajib punya filter/pencarian**: pakai `TableFilters` (`src/components/layouts/filters/table-filters.tsx` — dropdown periode/kelas/kelompok/siswa, filter tambahan, rentang tanggal) atau minimal `filterColumn` text search di `DataTable`.
- **Komentar kode**: hanya untuk "why" yang tidak terbaca dari kode (constraint, workaround, aturan bisnis); satu baris pendek.
- **Ekspor PDF**: util bersama di `src/lib/pdf/`; tombol download client-only (`PDFDownloadLink`).

---

## 11. Hal yang Belum Selesai / Trimming yang Disengaja

- **Filter/drill-down dashboard** lanjutan — penyempurnaan sesuai kebutuhan nyata setelah dipakai sekolah.
- **Progres siswa tanpa filter periode** — versi siswa selalu kumulatif sampai semester berjalan (proyek lama punya filter periode; sengaja dipangkas).
- Redirect `requireRole` yang gagal masih ke `/dashboard` (belum ada halaman 403 khusus).
- Password superadmin seed masih default (`superAdmin2026!`) — wajib diganti di produksi.
- Belum ada test suite otomatis, CI/CD pipeline, maupun Dockerfile.

---

---

# Lampiran A — Riwayat Pengembangan & Keputusan Desain

> Diambil dari `docs/ROADMAP.md` (dibuat 2026-08-24, seluruh tahap selesai 2026-08-25). Berguna untuk memahami *mengapa* sistem berbentuk seperti sekarang.

## Konteks

simquran-v2 adalah pembangunan ulang dari `sim-siswa-sdit` dengan perbaikan:
- Auth: NextAuth v5 → **better-auth** (username/password, plugin `username` + `admin`)
- Role baru **SUPERADMIN** (dulu tidak ada)
- API routes → **Server Actions**
- Struktur field diperbaiki (mis. `Classroom` punya `level`, `isActive`)

## Keputusan Arsitektur

- **Superadmin = akses penuh ke semua menu manajemen**, diimplementasikan sebagai bypass otomatis di `requireRole`/`requireRoleOrThrow` — role checks lain cukup ditulis untuk role yang dituju. Tidak berlaku untuk menu personal per-role (superadmin tidak punya profile record).

## Urutan Pengerjaan (semua selesai)

### Tahap 1 — Data Referensi ✅
`Surah`, `Juz`, `SurahJuz` (seed 114 surah, 30 juz, pemetaan ayat dari `prisma/data/*.json`), `Wafa`, halaman read-only `/dashboard/quran-reference`. Dikerjakan pertama karena dirujuk submission, score, dan munaqasyah.

### Tahap 2 — Kelompok ✅
- `Group` CRUD + anggota. Koordinator (+ superadmin) kelola penuh; guru hanya lihat kelompok bimbingannya (dibatasi cek `teacherId` di query).
- **Naik Kelas**: checklist per siswa; arsip ke `ClassroomHistory`; kelas 6 langsung LULUS; kelas lama `isActive: false` hanya bila kosong.
- **Naik Kelompok**: aksi terpisah koordinator; arsip seluruh anggota ke `GroupHistory`, lepas siswa, tutup kelompok.

### Tahap 3 — Progres Harian ✅
- `Submission`: guru input & kelola riwayat sendiri (cek kepemilikan `teacherId`); koordinator monitor semua; siswa lihat sendiri (role-branch satu page).
- `HomeActivity`: siswa input (groupId otomatis dari profil); guru/koordinator monitor read-only.
- `WeeklyTarget`: input checklist siswa + opsi "semua siswa di kelompok"; guru update status/progress; siswa lihat sendiri.
- **Catatan penting**: `get-submission.ts` dkk. sengaja di `actions/` (bukan `queries/`) karena dipanggil dari Client Component saat runtime — build pernah gagal karena salah taruh.

### Tahap 4 — Tashih ✅
Alur request guru → terima/tolak & jadwal koordinator → hasil. Tombol Terima/Tolak hanya untuk status MENUNGGU; input hasil otomatis set request SELESAI; hapus hasil kembalikan ke DITERIMA.

### Tahap 5 — Penilaian & Rapor ✅
- Upsert nilai berdasar unique constraint (bukan replace-all seperti proyek lama).
- **Keputusan desain `Report`**: tabel tetap ada (untuk `lastTahsinMaterial` + record resmi per periode), TAPI skor di dalamnya dihitung ulang otomatis setiap perubahan nilai — bukan snapshot beku.
- Ekspor PDF rapor: layout diadaptasi persis dari `StudentReportPdf.tsx` proyek lama.

### Tahap 6 — Munaqasyah ✅
- Pola sama seperti Tashih + kompleksitas: `batch/tahap`, `stage/jenis`, `juzId`; jadwal punya penguji opsional (guru manapun).
- Penilaian oleh guru penguji (`schedule.examinerId`), koordinator fallback. Form Tasmi baris dinamis per surah dalam juz (dari `SurahJuz`); form Munaqasyah tepat 5 soal. Skor live dari input khofi/jali — logika di-porting dari proyek lama.
- `MunaqasyahFinalResult` otomatis (70% Tasmi + 30% Munaqasyah) setiap submit hasil.
- *Catatan roadmap lama menyebut hasil belum bisa diedit — kini `update/delete-*-result.ts` sudah ada di codebase.*

### Tahap 7 — Dashboard & Visualisasi ✅
- Chart per role dengan Recharts: Superadmin/Admin 5 stat card tanpa chart; Koordinator 4 stat card + bar chart rata-rata nilai per kelompok; Guru 3 stat card + nilai per siswa bimbingan; Siswa 3 stat card + nilai terbaru sendiri.
- **Progres bacaan per Juz/Wafa** (`features/reading-progress/`): progres kumulatif dari `TashihRequest` dan `Submission`, status SELESAI/SEDANG_DIJALANI/BELUM_DIMULAI. Koordinator & guru: 3 stacked bar chart + drill-down klik batang; siswa: daftar progress bar dengan filter chip. Filter re-fetch via Server Action, bukan API route.

---

# Lampiran B — Referensi Proyek Lama (sim-siswa-sdit)

> Diambil dari `docs/reference-sim-siswa-sdit.md`. Sumber: `d:\Tugas Akhir\sim-siswa-sdit` (Next.js 15, Prisma 6/PostgreSQL, NextAuth v5, TanStack Table, Recharts, jsPDF/@react-pdf/renderer). Dokumentasi lengkap proyek lama: `docs/DOKUMENTASI-PROJECT.md` di repo tersebut. Berguna sebagai pembanding bila perlu menelusuri asal-usul sebuah fitur.

## B.1 Penilaian di Proyek Lama

- **Skor reguler**: form full-page 2 card (Tahsin & Tahfidz), baris dinamis. Konversi nilai hardcode: ≥92 A, ≥83 B, ≥75 C, else D (di v2 jadi configurable `GradeLetterSetting`). Deskripsi otomatis per grade (template terduplikasi di client & API — di v2 disatukan jadi `ReportDescriptionTemplate`).
- **Simpan**: replace-all (`deleteMany` + `createMany`) per siswa+grup — di v2 diganti **upsert per baris**. Rata-rata aritmatika per tipe di-upsert ke `Report` (unique studentId+groupId+academicYear+semester).
- **Tashih**: `TashihResult` pass/fail 1:1 dengan request; alur sama dengan v2.
- **Munaqasyah**: formula sama yang di-porting ke v2 — Tasmi: `max(0, initialScore − 2×khofi − 5×jali)`; Munaqasyah: basis 50, `max(0, 50 − 2×khofi − 3×jali)`; final 70/30; grade ≥91 MUMTAZ, ≥85 JAYYID_JIDDAN, ≥80 JAYYID (di v2 semua bobot/ambang jadi configurable).

## B.2 Target Mingguan di Proyek Lama

Ada **2 implementasi paralel** kalkulasi pencapaian target (duplikasi yang sengaja TIDAK ditiru di v2):
1. Evaluator batch `evaluateTargetAchievement`: bangun required set (surahId:ayat / wafaId:halaman), submitted set dari Submission `LULUS`, `progress = round(matched/total×100)`, simpan bila berubah.
2. Evaluator on-the-fly untuk display riwayat siswa: logika sama tapi `Math.floor`, tidak disimpan.

Di v2 disatukan jadi `recalculate-weekly-target-progress.ts`.

## B.3 Progress Bar & Chart di Proyek Lama

- `ProgressBarCard` generik: hijau SELESAI, biru SEDANG_DIJALANI, abu BELUM_DIMULAI; filter segmented 3-arah.
- Chart batang stacked guru/koordinator per juz/buku Wafa: seri selesai/proses/belumDimulai, klik bar buka dialog daftar siswa (drill-down) — pola ini direplikasi di v2 `reading-progress`.
- **Sumber kebenaran persen**: `completedSurah` = jumlah `TashihRequest` ALQURAN SELESAI per juz, kumulatif sampai periode terpilih; `percent = completedSurah/totalSurah×100` — logika terduplikasi di 3 route API (student/teacher/coordinator); di v2 disatukan di `reading-progress/compute-*.ts`.
- **3 konsep progres terpisah** (target mingguan / completion juz / rata-rata rapor) — dipertahankan terpisah juga di v2.

## B.4 Fitur Lain Proyek Lama

- RBAC 3 lapis: middleware redirect berbasis path + server guard + cek session per API route; 4 role (tanpa superadmin).
- `Classroom`/`ClassroomHistory` + promosi massal `PromoteSemesterDialog` (di v2 jadi checklist per siswa).
- `Group`/`GroupHistory`, 1 guru per grup.
- `Submission` dengan `adab` dan `submissionStatus` — sama di v2.
- `HomeActivity` self-report siswa (murajaah/tilawah/tarjamah) — sama di v2.
- Konvensi UI: Tambah = card inline, Edit = dialog, Hapus = AlertDialog; ekspor PDF jsPDF kecuali rapor (`@react-pdf/renderer`). Di v2 hampir semua ekspor pakai `@react-pdf/renderer`.
- `AcademicSetting` singleton sebagai default periode — sama di v2.
