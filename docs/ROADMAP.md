# Roadmap Pengembangan SimQuran v2

Dibuat: 2026-08-24. Disusun berdasarkan perbandingan dengan proyek lama (`sim-siswa-sdit`, lihat `docs/DOKUMENTASI-PROJECT.md` di sana untuk detail modul lama).

## Konteks

simquran-v2 adalah pembangunan ulang dari `sim-siswa-sdit` dengan perbaikan:
- Auth: NextAuth v5 → **better-auth** (username/password, plugin `username` + `admin`)
- Role baru **SUPERADMIN** (dulu tidak ada)
- API routes → **Server Actions**
- Struktur field diperbaiki (mis. `Classroom` punya `level`, `isActive`)

## Keputusan Arsitektur

- **Superadmin = akses penuh ke semua menu manajemen** (users, classrooms, academic settings, quran-reference, dst). Diimplementasikan sebagai bypass otomatis di `requireRole`/`requireRoleOrThrow` ([src/lib/require-role.ts](../src/lib/require-role.ts)) — role checks lain cukup ditulis untuk role yang dituju (mis. `['admin']`), superadmin tidak perlu ditambahkan manual. Tidak berlaku untuk menu personal per-role (kelompok/rapor milik guru-siswa) karena superadmin tidak punya profile record di sana — detail di CLAUDE.md.

## Sudah selesai

- Auth (better-auth, role SUPERADMIN/ADMIN/COORDINATOR/TEACHER/STUDENT)
- Manajemen User (`/dashboard/users`)
- Manajemen Kelas (`/dashboard/classrooms` + `[classroomId]`)
- Academic Settings (`/dashboard/academic-settings`)
- Account (change-password, profile)

## Model Prisma yang belum ada

`Group`, `GroupHistory`, `Surah`, `Juz`, `SurahJuz`, `Wafa`, `Submission`, `HomeActivity`, `WeeklyTarget`, `TashihRequest`, `TashihSchedule`, `TashihScheduleRequest`, `TashihResult`, `TahfidzScore`, `TahsinScore`, `Report`, `MunaqasyahRequest`, `MunaqasyahSchedule`, `MunaqasyahScheduleRequest`, `MunaqasyahResult`, `TasmiDetail`, `MunaqasyahDetail`, `MunaqasyahFinalResult`.

## Urutan Prioritas (berdasarkan dependensi data)

### Tahap 1 — Data Referensi (fondasi) ✅ Selesai
- [x] `Surah`, `Juz`, `SurahJuz` — seed 114 surah, 30 juz, pemetaan ayat (dari `prisma/data/*.json`)
- [x] `Wafa` — referensi buku metode Wafa + jumlah halaman
- [x] Halaman read-only `/dashboard/quran-reference` (superadmin only)

Alasan: dirujuk oleh submission, score, dan munaqasyah.

### Tahap 2 — Kelompok ✅ Selesai
- [x] `Group` model — CRUD kelompok tahfidz/tahsin + manajemen anggota (`/dashboard/group`, `/dashboard/group/[groupId]`). Koordinator (+ superadmin) mengelola penuh; guru hanya melihat kelompok bimbingannya sendiri (read-only, akses dibatasi lewat pengecekan `teacherId` di `queries/get-group.ts` & `list-group-students.ts`).
- [x] **Naik Kelas** (`features/classrooms/actions/promote-classroom.ts`, dialog di halaman detail kelas) — admin checklist siswa per siswa (bukan sekaligus satu kelas); siswa terpilih diarsipkan ke `ClassroomHistory` lalu dipindah ke kelas level+1 di tahun/semester tujuan yang diinput manual (dibuat otomatis jika belum ada); siswa kelas 6 langsung diluluskan (`status: LULUS`, `graduatedAt` diisi, `classroomId` dikosongkan) tanpa perlu kelas tujuan. Siswa yang tidak dicentang tetap di kelas lama (mis. tinggal kelas) — kelas lama baru ditandai `isActive: false` kalau sudah kosong.
- [x] **Naik Kelompok** (`features/groups/actions/promote-group.ts`, dialog konfirmasi di halaman detail kelompok) — aksi terpisah oleh koordinator, tidak otomatis mengikuti Naik Kelas. Mengarsipkan seluruh anggota ke `GroupHistory` (pakai academicYear/semester dari `Group.classroom`), melepas semua siswa dari kelompok, lalu menutup kelompok (`isActive: false`). Koordinator membentuk kelompok baru secara manual lewat "Tambah Kelompok" yang sudah ada.

Alasan: submission, weekly target, score, tashih, munaqasyah semua terkait ke Group, bukan langsung ke Classroom.

### Tahap 3 — Progres Harian (butuh Group + Tahap 1) ✅ Selesai
- [x] `Submission` — setoran harian tahfidz/tahsin. Guru input (`/dashboard/submission/input`) & kelola riwayat sendiri (`/dashboard/submission/history`, edit/hapus dengan cek kepemilikan `teacherId`); koordinator monitor semua (`/dashboard/submission`); siswa lihat riwayat sendiri (`/dashboard/submission`, role-branch di page yang sama).
- [x] `HomeActivity` — aktivitas rumah siswa. Siswa input (`/dashboard/home-activity/input`, otomatis pakai `groupId` dari profil sendiri) & kelola riwayat sendiri (`/dashboard/home-activity/history`); guru & koordinator monitor read-only (`/dashboard/home-activity`, guru dibatasi ke kelompok bimbingannya).
- [x] `WeeklyTarget` — target mingguan dari guru. Input dengan checklist siswa + opsi "untuk semua siswa di kelompok" (`/dashboard/weekly-target/input`); guru kelola riwayat & update status/progress (`/dashboard/weekly-target/history`); siswa lihat target sendiri (`/dashboard/weekly-target`).

Query referensi baru untuk dropdown lintas-role: `features/quran-reference/queries/list-reference-options.ts` (surah/juz/wafa, hanya butuh login, bukan superadmin-only seperti halaman `/dashboard/quran-reference`). Query gabungan `features/groups/queries/list-my-groups-with-students.ts` dipakai bersama oleh Submission & WeeklyTarget untuk cascading select kelompok→siswa.

**Catatan penting**: `get-submission.ts`, `get-home-activity.ts`, `get-weekly-target.ts` sengaja ditaruh di `actions/` (bukan `queries/`) karena dipanggil langsung dari Client Component (dialog edit) saat runtime — build sempat gagal karena awalnya salah taruh di `queries/`, lihat aturan di CLAUDE.md bagian Feature Structure.

### Tahap 4 — Tashih ✅ Selesai
- [x] `TashihRequest` → `TashihSchedule` → `TashihResult` (alur: request guru → terima/tolak & jadwal koordinator → hasil). Migrasi `20260824154329_add_tashih`.
  - Guru: ajukan tashih (`/dashboard/tashih/request`, pilih kelompok→siswa→jenis Al-Qur'an/Wafa) + lihat riwayat request sendiri di halaman yang sama; lihat jadwal (`/dashboard/tashih/schedule`) & hasil (`/dashboard/tashih/result`) miliknya (read-only, role-branch bareng siswa).
  - Koordinator: terima/tolak request (`/dashboard/tashih/requests`, tombol Terima/Tolak hanya muncul untuk status MENUNGGU); buat jadwal dari request yang DITERIMA & belum dijadwalkan (`/dashboard/tashih/schedules`, checklist multi-request); input hasil per peserta terjadwal (`/dashboard/tashih/results`, otomatis set status request jadi SELESAI; hapus hasil mengembalikan status ke DITERIMA).
  - Siswa: lihat jadwal & hasil tashih sendiri, read-only (`/dashboard/tashih/schedule`, `/dashboard/tashih/result`, sama-sama role-branch dengan guru).

### Tahap 5 — Penilaian & Rapor
- [ ] `TahfidzScore`, `TahsinScore` — nilai per surah/topik
- [ ] `Report` — rapor semester (gabungan skor) + ekspor PDF

### Tahap 6 — Munaqasyah (paling kompleks)
- [ ] `MunaqasyahRequest` → `MunaqasyahSchedule` → `MunaqasyahResult` (+ `TasmiDetail`, `MunaqasyahDetail`, `MunaqasyahFinalResult`, skor gabungan Tasmi 70% + Munaqasyah 30%)

Dikerjakan setelah pola CRUD+approval dari Tashih stabil sebagai referensi pola.

### Tahap 7 — Dashboard & Visualisasi
- [ ] Dashboard grafik per role (admin/koordinator/guru/siswa) dengan Recharts

Terakhir karena butuh data nyata dari semua modul di atas.

## Cara pakai file ini

Update checklist `[ ]` → `[x]` saat modul selesai. Tambahkan catatan singkat di bawah item jika ada perubahan skema/keputusan desain yang berbeda dari proyek lama.
