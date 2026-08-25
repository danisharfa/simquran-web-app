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

### Tahap 5 — Penilaian & Rapor ✅ Selesai
- [x] `TahfidzScore`, `TahsinScore` — nilai per surah/topik. Guru input via `/dashboard/group/[groupId]/student/[studentId]/score` (panel Tahfidz per-surah, panel Tahsin per-topik, upsert berdasarkan unique constraint sehingga input ulang surah/topik yang sama otomatis update, bukan duplikat). Grade (A/B/C/D) dihitung otomatis dari skor (`features/scores/grade.ts`).
- [x] `Report` — **keputusan desain**: tabel `Report` tetap ada seperti skema lama (untuk `lastTahsinMaterial` + record resmi per academicYear/semester), TAPI `tahfidzScore`/`tahsinScore` di dalamnya **otomatis dihitung ulang** (bukan snapshot beku sekali generate) setiap ada perubahan nilai — lewat `features/scores/recalculate-report.ts` yang dipanggil di setiap upsert/delete skor. `lastTahsinMaterial` diedit terpisah oleh guru, tidak tergantung nilai. Ditampilkan read-only di `/dashboard/group/[groupId]/student/[studentId]/report` (guru/koordinator) dan `/dashboard/report` (siswa, otomatis pakai kelompoknya sendiri).
- [x] **Ekspor PDF rapor** — `@react-pdf/renderer` (user sudah install manual). Layout diadaptasi persis dari `StudentReportPdf.tsx` milik `sim-siswa-sdit` (kop dua logo dari `public/logo-sekolah.png` + `public/logo-wafa.png`, tabel evaluasi Tahsin/Tahfidz, tabel KKM, tanda tangan Kepala Sekolah & Koordinator). Query data gabungan di `features/scores/queries/get-report-pdf-data.ts`; tombol download client-only (`PDFDownloadLink`) di `features/scores/components/export-report-pdf-button.tsx`, dipasang di kedua halaman rapor.

Tombol "Nilai" dan "Rapor" ditambahkan ke tabel anggota kelompok (`GroupStudentTable`, prop `showScoreLink`/`showReportLink`) — guru dapat keduanya di kelompok bimbingannya, koordinator dapat "Rapor" saja (tidak input nilai).

### Tahap 6 — Munaqasyah (paling kompleks) ✅ Selesai
- [x] `MunaqasyahRequest` → `MunaqasyahSchedule` → `MunaqasyahResult` (+ `TasmiDetail`, `MunaqasyahDetail`, `MunaqasyahFinalResult`). Migrasi `20260824162255_add_munaqasyah`. Alur pola sama seperti Tashih (request → terima/tolak → jadwal → hasil), tapi dengan kompleksitas tambahan:
  - Request punya `batch` (Tahap 1-4), `stage` (TASMI/MUNAQASYAH), dan `juzId` yang diuji.
  - Jadwal (`/dashboard/munaqasyah/schedules`, koordinator) punya field **penguji** opsional (`examinerId`, guru manapun — tidak harus guru pembimbing siswa itu sendiri).
  - **Penilaian dipisah dari koordinator**: guru yang ditunjuk sebagai penguji (`schedule.examinerId === session.user.id`) yang menilai lewat `/dashboard/munaqasyah/assessment` (koordinator tetap boleh menilai juga sebagai fallback). Form Tasmi punya baris dinamis per-surah dalam juz yang diminta (dari `SurahJuz`); form Munaqasyah punya tepat 5 baris soal tetap. Skor dihitung live dari input khofi (kesalahan ringan, -2/-5 poin) dan jali (kesalahan berat) — logika di-porting dari `features/munaqasyah/munaqasyah-scoring.ts` (asli: `sim-siswa-sdit/src/lib/utils/munaqasyah-scoring.ts`).
  - Setelah kedua tahap (Tasmi & Munaqasyah) untuk siswa+juz+batch+kelompok yang sama selesai dinilai, `MunaqasyahFinalResult` **otomatis** dibuat/diperbarui (70% Tasmi + 30% Munaqasyah) lewat `features/munaqasyah/try-finalize-munaqasyah.ts` — dipanggil otomatis setiap submit hasil, tidak perlu tombol generate manual.
- **Trimming yang disengaja**: hasil penilaian (per-tahap maupun final) belum bisa diedit/dihapus lewat UI setelah tersimpan (beda dari Tashih yang punya edit/delete) — mengingat kompleksitas form multi-baris dengan kalkulasi, dan untuk MVP ini dianggap cukup karena kesalahan input jarang & datanya bisa dikoreksi langsung lewat Prisma Studio kalau perlu.

Dikerjakan setelah pola CRUD+approval dari Tashih stabil sebagai referensi pola.

### Tahap 7 — Dashboard & Visualisasi ✅ Selesai
- [x] Dashboard grafik per role di `/dashboard` (satu page.tsx, role-branch) dengan **Recharts** (baru diinstall, belum ada sebelumnya):
  - Superadmin/Admin: 5 stat card (Koordinator/Guru/Siswa/Kelas/Kelompok), tanpa chart — sama seperti proyek lama.
  - Koordinator: 4 stat card (Kelompok Aktif, Siswa Berkelompok, Tashih Menunggu, Munaqasyah Menunggu) + bar chart rata-rata nilai Tahfidz/Tahsin per kelompok (dari `Report`, top 8 kelompok).
  - Guru: 3 stat card (Kelompok Bimbingan, Siswa Bimbingan, Setoran Bulan Ini) + bar chart nilai terkini per siswa bimbingan.
  - Siswa: 3 stat card (Target Berjalan, Target Tercapai, Total Setoran) + bar chart nilai Tahfidz/Tahsin terbaru miliknya.
- [x] **Progres bacaan per Juz/Wafa (ditambahkan setelah replikasi dari `sim-siswa-sdit`)** — `features/reading-progress/`. Chart lama proyek ini bukan nilai rata-rata, tapi progres kumulatif per Juz/buku Wafa dihitung dari `TashihRequest` (Tahfidz Al-Qur'an, Wafa) dan `Submission` (Tahsin Al-Qur'an, berbasis overlap ayat), dibagi status SELESAI/SEDANG_DIJALANI/BELUM_DIMULAI:
  - Koordinator & Guru: `ReadingProgressPanel` — filter Tahun Akademik + Kelompok (guru dibatasi ke kelompok bimbingannya via `teacherId`), 3 stacked bar chart (Tahfidz, Wafa, Tahsin Al-Qur'an), klik batang buka dialog daftar siswa. Filter re-fetch lewat Server Action (`getProgressCharts`), bukan API route seperti versi lama.
  - Siswa: `ProgressBarList` — daftar progress bar per juz/buku (bukan chart batang, meniru `ProgressBarCard` versi siswa di proyek lama), filter chip Semua/Sedang/Selesai, tanpa pilihan periode (selalu progres kumulatif sampai semester berjalan — trimming yang disengaja dibanding versi lama yang punya filter periode juga).
- **Trimming lain yang disengaja**: bar chart nilai rata-rata (dari Tahap 7 awal) tetap dipertahankan berdampingan dengan chart progres di atas — proyek lama tidak punya ini, jadi ini tambahan, bukan pengurangan.

Terakhir karena butuh data nyata dari semua modul di atas.

## Status akhir

Seluruh 7 tahap roadmap awal (Tahap 1–7) sudah selesai per 2026-08-25. Modul database, alur bisnis inti (kelas, kelompok, setoran, tashih, munaqasyah, penilaian & rapor termasuk ekspor PDF), dan dashboard visualisasi sudah berjalan. Pekerjaan lanjutan yang tersisa (opsional, bukan bagian roadmap awal): edit/hapus hasil Munaqasyah, filter/drill-down dashboard, dan penyempurnaan lain sesuai kebutuhan nyata sekolah setelah dipakai.

## Cara pakai file ini

Update checklist `[ ]` → `[x]` saat modul selesai. Tambahkan catatan singkat di bawah item jika ada perubahan skema/keputusan desain yang berbeda dari proyek lama.
