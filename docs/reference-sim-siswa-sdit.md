# Rangkuman Fitur — Proyek Lama (sim-siswa-sdit)

> Referensi untuk migrasi/rebuild fitur penilaian, target mingguan, progress bar, dan chart ke `simquran-v2`.
> Sumber: `d:\Tugas Akhir\sim-siswa-sdit` (Next.js 15, Prisma 6/PostgreSQL, NextAuth v5, TanStack Table, Recharts, jsPDF/@react-pdf/renderer).
> Dokumentasi arsitektur lengkap asli juga tersedia di `d:\Tugas Akhir\sim-siswa-sdit\docs\DOKUMENTASI-PROJECT.md`.

---

## 1. Penilaian (Scoring/Assessment)

### A. Skor Tahfidz/Tahsin reguler (per semester, diinput guru)

- **UI**: `src/components/teacher/report/score/ScoreForm.tsx` — full-page form, 2 Card: "Penilaian Tahsin" & "Penilaian Tahfidz". Baris bisa ditambah/hapus dinamis.
  - Tahsin: tipe WAFA (topik bebas) atau ALQURAN (cascading select Juz → Surah dari `/api/surahJuz`).
  - Tahfidz: pilih dari daftar surah yang eligible (`/api/teacher/score/tahfidz/eligible/[studentId]`, mencegah duplikat surah).
  - Input skor otomatis menghitung huruf nilai + deskripsi kalimat otomatis.
- **Formula konversi nilai** (`src/lib/data/score-converter.ts`):
  ```
  score >= 92 → A
  score >= 83 → B
  score >= 75 → C
  else        → D
  ```
- **Deskripsi otomatis**: template string per grade (mis. "Sangat baik dalam menghafal {surah}" untuk A, sampai "Kurang dalam menghafal {surah}" untuk D) — duplikat di client form dan API route.
- **Simpan** (`src/app/api/teacher/score/route.ts`, POST):
  - Verifikasi kepemilikan grup oleh guru.
  - **Replace semua** baris `TahsinScore`/`TahfidzScore` milik siswa+grup (deleteMany + createMany — overwrite penuh, bukan upsert per baris).
  - Hitung rata-rata aritmatika sederhana per tipe:
    ```js
    tahsinAvg  = tahsin.length  ? sum(scores)/tahsin.length  : null
    tahfidzAvg = tahfidz.length ? sum(scores)/tahfidz.length : null
    ```
  - Upsert ke `Report` (unique per studentId+groupId+academicYear+semester) beserta `lastTahsinMaterial`.
- **Ambil data**: `src/app/api/teacher/score/[studentId]/route.ts` (GET) — raw rows + averages + `lastTahsinMaterial`.
- **Hapus baris**: `.../tahfidz/[id]/route.ts`, `.../tahsin/[id]/route.ts`.
- **Model data**:
  - `TahfidzScore`: studentId, groupId, surahId, score(Int), grade(GradeLetter), description — unique per student+group+surah.
  - `TahsinScore`: studentId, groupId, tahsinType(WAFA/ALQURAN), topic, score, grade, description — unique per student+group+type+topic.
  - `Report`: studentId, groupId, academicYear, semester, tahfidzScore(Float?), tahsinScore(Float?), lastTahsinMaterial — unique per student+group+year+semester (ini "rapor").
- **Tampilan/Export Rapor PDF**: `src/lib/data/teacher/report.ts` (`getStudentReportData`) dipakai `TeacherReportTable`/`ReportTable` dan `StudentReportPdf.tsx`/`src/components/student/report/ExportPdf.tsx` — pakai `@react-pdf/renderer` (layout rapor formal + TTD kepala sekolah/koordinator), berbeda dari pola jsPDF yang dipakai di tempat lain.

### B. Tashih (verifikasi bacaan) — hasil

- Model `TashihResult`: `passed`(boolean) + `notes`, 1:1 dengan `TashihRequest`, diinput koordinator lewat `TashihResultForm` setelah dijadwalkan (`TashihSchedule`). Pass/fail sederhana, bukan skor numerik.
- Alur: Guru buat `TashihRequest` (tipe ALQURAN/WAFA, juz/surah atau range halaman wafa) → Koordinator jadwalkan ke `TashihSchedule` (many-to-many via `TashihScheduleRequest`) → Koordinator catat `TashihResult` (pass/fail + catatan).
- **Penting**: hasil tashih (bukan `TahfidzScore`) yang jadi basis progress bar & chart juz (lihat bagian 3/4) — "surah selesai" = `TashihRequest` dengan `status=SELESAI` dan `tashihType=ALQURAN`.

### C. Munaqasyah (ujian akhir) — logika penilaian paling kompleks

- 2 tahap: TASMI lalu MUNAQASYAH, per `MunaqasyahBatch` (TAHAP_1..4) per Juz.
- Formula inti: `src/lib/utils/munaqasyah-scoring.ts`.
  - **Skor Tasmi** (per baris surah, `TasmiDetail`): mulai dari `initialScore` yang diberi guru, dikurangi kesalahan:
    ```
    totalKhofi = khofiAwalAyat + khofiMakhroj + khofiTajwidMad     (kesalahan ringan)
    totalJali  = jaliBaris + jaliLebihSatuKalimat                   (kesalahan berat)
    rawScore   = max(0, initialScore - 2*totalKhofi - 5*totalJali)
    percentage = rawScore / initialScore * 100
    ```
    `totalScore` keseluruhan Tasmi = rata-rata percentage per surah, clamp 0-100, dibulatkan 1 desimal.
  - **Skor Munaqasyah** (per pertanyaan 1-5, wajib tepat 5, `MunaqasyahDetail`): basis tetap 50 per pertanyaan:
    ```
    rawScore   = max(0, 50 - 2*totalKhofi - 3*totalJali)
    percentage = rawScore / 50 * 100
    ```
    `totalScore` = rata-rata percentage 5 pertanyaan.
  - **Mapping huruf nilai** (`scoreToGrade`, enum `MunaqasyahGrade`):
    ```
    >=91 MUMTAZ, >=85 JAYYID_JIDDAN, >=80 JAYYID, else TIDAK_LULUS
    ```
  - **Hasil akhir gabungan** (`MunaqasyahFinalResult`) — rata-rata tertimbang:
    ```
    finalScore = round1(clamp100(tasmiScore*0.7 + munaqasyahScore*0.3))
    ```
    yaitu **70% Tasmi + 30% Munaqasyah**, lalu grade via threshold yang sama; `passed`(boolean) juga disimpan.
  - Validasi (`validateTasmiDetails`/`validateMunaqasyahDetails`): jumlah kesalahan non-negatif, `initialScore` ≥ 1, Munaqasyah wajib 5 pertanyaan.
- **UI**: `AssessmentForm` guru (cascading jadwal→siswa→baris skor dinamis dengan **kalkulasi live** saat input jumlah kesalahan) di `/dashboard/teacher/munaqasyah/assessment`; `MunaqasyahResultForm`/`MunaqasyahResultEditDialog` koordinator meniru pola sama.
- Alur approve/reject `MunaqasyahRequest` (status MENUNGGU/DITERIMA/DITOLAK/SELESAI) via satu AlertDialog bertipe, sama pola dengan `TashihRequest`.

---

## 2. Target Mingguan (Weekly Target) — pelacakan progress

Model `WeeklyTarget`: target mingguan per siswa dari guru — `type` (TAHFIDZ / TAHSIN_WAFA / TAHSIN_ALQURAN), rentang tanggal (`startDate`/`endDate`), dan surah+range ayat ATAU range halaman wafa, plus `status` (TERCAPAI/TIDAK_TERCAPAI) dan `progressPercent`(Int, cached).

**Ada 2 implementasi paralel dari kalkulasi "pencapaian target" yang sama** (perlu dicatat sebagai duplikasi kode yang sebaiknya tidak ditiru mentah saat rebuild):

1. **Evaluator batch/background**: `src/lib/data/teacher/evaluate-target.ts` — `evaluateTargetAchievement(studentId, from, to)`.
   - Bangun **required set**: pasangan surahId:nomorAyat (atau wafaId:nomorHalaman) yang dicakup target, expand jika rentang surah beda-surah, pakai cache `verseCount` per surah.
   - Bangun **submitted set** dari `Submission` yang cocok tipe/tanggal/siswa, **hanya yang `submissionStatus === LULUS`** (mengulang/tidak lulus tidak dihitung).
   - `matched = required ∩ submitted` (irisan level ayat/halaman, bukan sekadar "ada submission").
   - `progress = Math.round(matched/total*100)`, `status = progress===100 ? TERCAPAI : TIDAK_TERCAPAI`.
   - Simpan balik ke `WeeklyTarget.status`/`progressPercent` hanya jika berubah.
2. **Evaluator on-the-fly untuk tampilan** riwayat target siswa sendiri: `src/lib/data/student/target.ts` (`fetchTargets`) — hitung ulang `progressPercent` dengan logika sama (expand set ayat/halaman, irisan dengan submission LULUS) tapi pakai `Math.floor` (bukan `Math.round`), TIDAK disimpan — murni untuk display, dikelompokkan/diurutkan per periode akademik (tahun+semester, dari group→classroom target).

- **CRUD target**: `TargetForm` (guru, halaman terpisah `/dashboard/teacher/weekly-target/input`) — ada checkbox bulk-create "untuk semua siswa", field kondisional tergantung tipe Tahfidz vs Tahsin.
- **Riwayat/monitoring**: `TargetTable` (varian guru & siswa) — Card ringkasan (Total/Tercapai/Tidak Tercapai), **kolom progress bar** per baris pakai shadcn `Progress`, filterable periode/grup/siswa/status/tipe, `ExportToPDFButton` (jsPDF).
- **Widget "target hari ini"** dashboard siswa: `src/app/api/student/today-targets/route.ts` — filter `WeeklyTarget` dengan `startDate <= besok && endDate >= hari ini`, hitung `daysRemaining = ceil((endDate-today)/86400000)` clamp ≥0, flag `isExpired` jika negatif. Dipakai `TodayTargets.tsx`, render satu `TargetProgressChart` (donut/radial) per target aktif.

---

## 3. Progress Bar Siswa (UI penyelesaian individual)

- **`ProgressBarCard`** (`src/components/student/charts/ProgressBarCard.tsx`) — card reusable generik yang render list item, masing-masing punya `Progress` bar shadcn, warna berdasar status:
  - SELESAI → hijau (`rgb(34 197 94)`)
  - SEDANG_DIJALANI atau `percent > 0` saat status BELUM_DIMULAI → biru (`rgb(59 130 246)`)
  - BELUM_DIMULAI dengan 0% → abu-abu (`rgb(209 213 219)`)
  - Ada filter segmented 3-arah: "Semua" / "Sedang Dijalani" (status SEDANG_DIJALANI atau percent>0) / "Selesai", masing-masing dengan badge jumlah live.
  - Tiap baris: nama, subtitle opsional, fraksi `completed/total`, `percent%`, progress bar, pill status berwarna.
  - Dipakai per role untuk Tahfidz (per Juz), Tahsin Wafa (per buku/halaman), Tahsin Al-Quran (per Juz) — lihat `TahfidzChart.tsx`, `WafaChart.tsx`, `TahsinAlquranChart.tsx` di `src/components/{student,teacher,coordinator}/charts/` (masing-masing hanya transform data API → `ProgressItem[]` lalu feed ke `ProgressBarCard`).
- **Progress radial/donut per target**: `TargetProgressChart.tsx` — Recharts `RadialBarChart` (donut gauge) menampilkan `progressPercent` satu weekly target sebagai arc animasi (`endAngle = 90 + 360*percent/100`), teks persen besar di tengah via custom `<Label>`, warna sama (hijau jika TERCAPAI, oranye jika hampir expire yaitu daysRemaining===0, biru jika in-progress, abu jika 0%). Footer tampilkan rentang tanggal dan "X hari tersisa" / peringatan "Berakhir dalam X hari". Dipakai `TodayTargets.tsx` — satu card per target aktif dalam grid.
- **Sumber perhitungan persen** (completion Juz/Surah individual siswa, basis `ProgressBarCard`): dihitung server-side di route API chart (lihat bagian 4) — BUKAN dari `TahfidzScore`, tapi dari **jumlah `TashihRequest` selesai per juz dibanding total surah di juz itu** (`percent = completedSurah/totalSurah*100`).

---

## 4. Progress Bar Chart / Visualisasi Data (Recharts)

Library: **Recharts**, dibungkus lewat primitif shadcn `ChartContainer`/`ChartConfig`/`ChartTooltip`/`ChartLegend` di `src/components/ui/chart.tsx`.

### A. Chart dashboard siswa sendiri
`src/components/student/charts/{TahfidzChart,WafaChart,TahsinAlquranChart}.tsx`: fetch `/api/student/chart/[period]/{tahfidz|tahsin/wafa|tahsin/alquran}`, transform ke `ProgressItem[]`, render via `ProgressBarCard` (list progress bar, bukan chart grafis walau namanya "Chart"). Difilter periode akademik via `ChartFilters.tsx`.

### B. Chart dashboard grup guru/koordinator — grafik batang beneran
`src/components/{teacher,coordinator}/charts/{TahfidzChart,WafaChart,TahsinAlquranChart}.tsx` + `ChartCard.tsx` bersama: ini **stacked/grouped Recharts `BarChart`**:
- X-axis: nomor Juz (1-30) atau buku Wafa, Y-axis: "Jumlah Siswa".
- 3 seri bar stacked per juz: `selesai` (hijau/chart-1), `proses` (chart-2), `belumDimulai` (chart-3) — jumlah siswa per status di juz itu, agregat seluruh grup/filter terpilih.
- Toggle filter 2-arah: "Semua Data" vs "Sedang Dijalani" (hanya tampilkan juz dengan `selesai+proses > 0`).
- **Klik bar buka `Dialog`** berisi daftar tiap siswa di juz itu dengan persen/status masing-masing (`onClick` pada `BarChart` baca `activePayload[0].payload`, yang membawa array `detail: []` breakdown per-siswa yang sudah di-embed di item data chart) — pola drill-down.
- Filter: `ChartFilters.tsx` (select cascading periode → grup), backed `/api/{teacher,coordinator}/chart/filters`.

### C. Perhitungan sumber kebenaran persentase progress
(logika identik terduplikasi di route `student/chart/[period]/tahfidz`, `teacher/chart/[period]/[group]/tahfidz`, `coordinator/chart/[period]/[group]/tahfidz`):
- Untuk tiap 30 Juz, hitung `totalSurah` = jumlah `SurahJuz` yang map ke juz itu.
- `completedSurah` = jumlah `TashihRequest` siswa dengan `tashihType=ALQURAN`, `status=SELESAI`, `juzId` cocok, **dan kumulatif sampai periode akademik terpilih** (filter OR: classroom.academicYear < tahun terpilih, ATAU tahun sama dengan semester ≤ semester terpilih — jadi total berjalan/kumulatif, bukan hanya semester berjalan).
- `percent = completedSurah/totalSurah*100` (dibulatkan 2 desimal).
- `status`: `SELESAI` jika `completedSurah >= totalSurah`; `SEDANG_DIJALANI` jika `0 < completedSurah < totalSurah`; selain itu `BELUM_DIMULAI`.
- Juga menghasilkan `currentJuz` (juz tertinggi dengan status in-progress) dan `lastSurah` (nama surah tashih terakhir) untuk header (`StudentInfoCard`/`CoordinatorInfoCard`/`TeacherInfoCard`).
- Chart Tahsin Wafa/Al-Quran mengikuti pola analog tapi berbasis completion halaman/juz Wafa (bukan surah).

> **Catatan untuk migrasi**: logika progress di sini berbasis **hasil Tashih**, sepenuhnya independen dari `TahfidzScore`/`TahsinScore` (skor rapor) dan independen dari progress `WeeklyTarget` (berbasis irisan ayat submission). Ada 3 konsep "progress" terpisah yang hidup berdampingan di codebase ini:
> 1. Persentase pencapaian target mingguan (irisan ayat submission),
> 2. Persentase completion juz/surah untuk chart dashboard (berbasis TashihRequest),
> 3. Rata-rata skor semester (TahfidzScore/TahsinScore, ditampilkan di Report/rapor).
>
> Saat rebuild, perlu diputuskan apakah ketiganya disatukan atau memang sengaja dipisah.

---

## 5. Fitur Lain yang Perlu Dicatat

- **RBAC 3 lapis**: middleware (`src/middleware.ts`) redirect berbasis path; server guard `requireRole()`/`requireStudentRole()` dll (`src/lib/auth/require-role.ts`); cek session per route API. 4 role: admin, coordinator, teacher, student.
- **Classroom & kenaikan kelas**: model `Classroom`/`ClassroomHistory`; admin bisa "Naik Semester" (promosi) siswa massal via `PromoteSemesterDialog`, snapshot penempatan lama ke history.
- **Group (kelompok tahfidz/tahsin)**: manajemen dengan `GroupHistory` untuk kontinuitas antar semester, 1 guru per grup.
- **Submission (log bacaan harian)**: model `Submission` — guru catat bacaan harian tahfidz/tahsin dengan enum `adab` (BAIK/KURANG_BAIK/TIDAK_BAIK, nilai sikap) dan `submissionStatus` (LULUS/TIDAK_LULUS/MENGULANG). Ini sumber data mentah yang sebenarnya bisa jadi basis progress target mingguan maupun (tidak langsung) progress juz — meski chart juz di proyek lama justru pakai TashihRequest, bukan Submission.
- **HomeActivity**: log aktivitas rumah self-report siswa (murajaah/tilawah/tarjamah), CRUD sendiri oleh siswa, dipantau read-only oleh guru/koordinator.
- **Konvensi UI konsisten**: Tambah = Card inline di halaman, Edit = Dialog, Hapus = AlertDialog, Approve/Reject = satu AlertDialog bertipe; DataTable pakai TanStack Table dengan hook `useDataTableState`; export PDF hampir di semua tempat via `ExportToPDFButton` (jsPDF+autotable, download instan) kecuali rapor siswa yang pakai `@react-pdf/renderer` dengan layout formal bertanda tangan.
- **Dashboard admin**: 5 stat card (jumlah Koordinator/Guru/Siswa/Kelas/Grup), server component, tanpa chart.
- **AcademicSetting** singleton: tahun/semester berjalan, nama/alamat sekolah, nama kepala sekolah — menjadi default "periode saat ini" di hampir semua filter dan laporan.
