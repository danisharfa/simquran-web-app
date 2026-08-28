# Panduan Pengguna — SimQuran v2

> Panduan penggunaan Sistem Informasi Manajemen pembelajaran Al-Qur'an (Tahfidz & Tahsin) untuk seluruh pengguna: Admin, Koordinator, Guru, dan Siswa.
> Terakhir diperbarui: 2026-08-28.

---

## Daftar Isi

1. [Pengenalan Sistem](#1-pengenalan-sistem)
2. [Masuk ke Sistem (Login)](#2-masuk-ke-sistem-login)
3. [Panduan Admin / Superadmin](#3-panduan-admin--superadmin)
4. [Panduan Koordinator](#4-panduan-koordinator)
5. [Panduan Guru](#5-panduan-guru)
6. [Panduan Siswa](#6-panduan-siswa)
7. [Istilah yang Dipakai](#7-istilah-yang-dipakai)
8. [Pertanyaan Umum (FAQ)](#8-pertanyaan-umum-faq)

---

## 1. Pengenalan Sistem

SimQuran v2 membantu sekolah mengelola pembelajaran Al-Qur'an dari hulu ke hilir:

- **Admin** mengelola data pengguna, kelas, dan pengaturan akademik.
- **Koordinator** mengelola kelompok tahfidz/tahsin, menyetujui & menjadwalkan Tashih/Munaqasyah, serta memantau seluruh setoran.
- **Guru** mencatat setoran harian, membuat target mingguan, mengajukan Tashih/Munaqasyah, dan menginput nilai rapor siswa bimbingannya.
- **Siswa** mencatat aktivitas rumah, serta melihat target, setoran, jadwal ujian, hasil, dan rapornya sendiri.

Setiap pengguna hanya melihat menu sesuai perannya. Menu berada di **sidebar kiri**; profil dan tombol keluar ada di bagian bawah sidebar.

---

## 2. Masuk ke Sistem (Login)

1. Buka alamat aplikasi di browser — Anda akan diarahkan ke halaman **Masuk**.
2. Isi **Username** dan **Password** yang diberikan oleh admin sekolah, lalu klik **Masuk**.
3. Setelah berhasil, Anda dibawa ke halaman **Beranda** sesuai peran Anda.

> **Akun baru**: secara bawaan password akun baru **sama dengan username** Anda. Segera ganti password setelah login pertama.

**Mengganti password**: buka menu **Akun** (klik nama Anda di bawah sidebar) → tab ganti password → isi password lama dan password baru → simpan.

**Lupa password**: hubungi admin sekolah — admin dapat mereset password Anda dari menu Manajemen Pengguna.

---

## 3. Panduan Admin / Superadmin

Menu: **Beranda, Manajemen Pengguna, Manajemen Kelas, Akademik, Data Referensi Qur'an (khusus superadmin), Pengaturan Penilaian, Kelompok (khusus superadmin)**.

### 3.1 Beranda

Menampilkan ringkasan jumlah Koordinator, Guru, Siswa, Kelas, dan Kelompok.

### 3.2 Manajemen Pengguna

- **Menambah pengguna satu per satu**: klik tombol tambah pengguna → pilih peran (Admin/Koordinator/Guru/Siswa) → isi nama, username, dan data pendukung (NIP untuk koordinator/guru; NIS/NISN untuk siswa) → simpan. Password awal otomatis = username.
- **Impor massal (CSV)**: gunakan tombol **Impor** untuk menambahkan banyak pengguna sekaligus dari file CSV — ikuti format kolom yang ditampilkan pada dialog impor.
- **Melihat/mengubah detail**: klik baris pengguna untuk membuka detail; data profil (telepon, tanggal lahir, alamat, dsb.) bisa diubah dari sini.
- **Reset password**: dari detail pengguna, gunakan aksi reset password — password kembali menjadi sama dengan username.
- **Menghapus pengguna**: tombol hapus selalu meminta konfirmasi terlebih dahulu.
- Tab di bagian atas memisahkan daftar per peran; gunakan kotak pencarian untuk mencari nama/username.

### 3.3 Manajemen Kelas

- **Menambah kelas**: isi tingkat (level 1–6), nama kelas, tahun ajaran, dan semester.
- **Detail kelas** (klik nama kelas):
  - **Menambahkan siswa** ke kelas dari daftar siswa yang belum punya kelas.
  - **Mengeluarkan siswa** dari kelas (dengan konfirmasi).
  - **Siswa keluar/pindah sekolah**: gunakan aksi "Keluarkan Siswa" — status siswa menjadi KELUAR/PINDAH dan tercatat tanggalnya. Siswa yang keluar bisa **diaktifkan kembali** bila kembali bersekolah.
  - **Naik Kelas**: klik tombol Naik Kelas → **centang siswa yang naik** (siswa yang tidak dicentang tinggal kelas) → tentukan tahun ajaran & semester tujuan → konfirmasi. Siswa pindah ke kelas tingkat berikutnya (kelas tujuan dibuat otomatis bila belum ada). **Siswa kelas 6 yang dicentang otomatis diluluskan.**

### 3.4 Akademik

Mengatur **tahun ajaran & semester berjalan**, serta **nama kepala sekolah, nama, dan alamat sekolah**. Data ini menjadi acuan periode di seluruh sistem dan tercetak di rapor — pastikan selalu diperbarui setiap pergantian semester.

### 3.5 Data Referensi Qur'an (superadmin)

Daftar 114 surah, 30 juz beserta pemetaan ayatnya, dan buku metode Wafa. Bersifat **hanya-lihat** — data ini adalah acuan tetap sistem.

### 3.6 Pengaturan Penilaian

Superadmin dapat mengubah (admin hanya melihat), melalui 5 tab:

| Tab | Fungsi |
|---|---|
| **Nilai Awal Surah** | Nilai awal (basis) tiap surah untuk penilaian Tasmi |
| **Bobot Pengurangan** | Besar pengurangan nilai per kesalahan ringan (khofi) dan berat (jali) untuk Tasmi & Munaqasyah |
| **Batas Lulus Munaqasyah** | Ambang nilai untuk predikat Mumtaz / Jayyid Jiddan / Jayyid, serta bobot gabungan Tasmi:Munaqasyah (bawaan 70:30) |
| **Mapping Huruf** | Batas nilai huruf A/B/C/D untuk rapor |
| **Template Nilai Rapor** | Kalimat deskripsi otomatis di rapor (mendukung placeholder seperti `{grade}`, `{surahName}`) |

> Ubah pengaturan ini **sebelum** periode penilaian dimulai agar nilai konsisten.

---

## 4. Panduan Koordinator

Menu: **Beranda, Kelompok, Setoran, Aktivitas Rumah, Tashih (Permintaan/Penjadwalan/Penilaian), Munaqasyah (Permintaan/Penjadwalan/Penilaian)**.

### 4.1 Beranda

Ringkasan: kelompok aktif, siswa berkelompok, permintaan Tashih & Munaqasyah yang menunggu, grafik rata-rata nilai per kelompok, dan **grafik progres bacaan** per Juz/buku Wafa (klik batang grafik untuk melihat daftar siswa di dalamnya; filter per tahun ajaran & kelompok tersedia).

### 4.2 Mengelola Kelompok

- **Membuat kelompok**: pilih kelas → beri nama kelompok → pilih guru pembimbing (satu guru per kelompok).
- **Mengelola anggota** (halaman detail kelompok): tambahkan siswa dari kelasnya yang belum berkelompok; keluarkan siswa bila perlu.
- **Naik Kelompok** (akhir semester/tahun): dari detail kelompok, jalankan aksi Naik Kelompok — seluruh anggota diarsipkan ke riwayat, kelompok ditutup. Bentuk kelompok baru untuk periode berikutnya lewat "Tambah Kelompok" seperti biasa. (Naik Kelompok terpisah dari Naik Kelas yang dilakukan admin.)

### 4.3 Memantau Setoran & Aktivitas Rumah

- **Setoran**: melihat seluruh setoran semua kelompok. Gunakan filter periode/kelompok/siswa dan tombol ekspor PDF bila perlu.
- **Aktivitas Rumah**: memantau aktivitas rumah seluruh siswa (hanya-lihat).

### 4.4 Alur Tashih (verifikasi bacaan)

1. **Permintaan Tashih** — daftar pengajuan dari guru. Untuk status **MENUNGGU**, tersedia tombol **Terima** / **Tolak**.
2. **Penjadwalan Tashih** — buat jadwal (tanggal, sesi, jam, lokasi) lalu **centang permintaan-permintaan berstatus DITERIMA** yang akan ikut jadwal tersebut. Jadwal bisa diedit; tersedia ekspor PDF jadwal.
3. **Penilaian Tashih** — untuk tiap peserta terjadwal, isi hasil **Lulus / Tidak Lulus** beserta catatan. Setelah hasil disimpan, status permintaan menjadi **SELESAI**. Bila hasil dihapus, permintaan kembali berstatus DITERIMA.

### 4.5 Alur Munaqasyah (ujian akhir)

1. **Permintaan Munaqasyah** — terima/tolak pengajuan guru (setiap pengajuan menyebutkan tahap 1–4, jenis ujian Tasmi/Munaqasyah, dan juz yang diuji).
2. **Penjadwalan Munaqasyah** — seperti Tashih, dengan tambahan memilih **guru penguji** (boleh guru manapun, tidak harus pembimbing siswa).
3. **Penilaian Munaqasyah** — rekap hasil penilaian. Penilaian umumnya dilakukan guru penguji; koordinator juga dapat menilai sebagai cadangan. Setelah kedua tahap (Tasmi dan Munaqasyah) seorang siswa untuk juz & tahap yang sama selesai dinilai, **nilai akhir gabungan dan predikat kelulusan muncul otomatis** — tidak perlu tombol apa pun.

---

## 5. Panduan Guru

Menu: **Beranda, Kelompok, Target Setoran, Setoran, Aktivitas Rumah, Tashih (Pendaftaran/Jadwal/Hasil), Munaqasyah (Pendaftaran/Jadwal/Penilaian)**.

### 5.1 Beranda

Ringkasan kelompok & siswa bimbingan, jumlah setoran bulan ini, grafik nilai siswa bimbingan, dan grafik progres bacaan kelompok Anda.

### 5.2 Kelompok Bimbingan

Menu **Kelompok** menampilkan kelompok yang Anda bimbing (hanya-lihat — pengelolaan anggota dilakukan koordinator). Dari daftar anggota kelompok, tiap siswa punya tombol:

- **Nilai** — input nilai rapor siswa (lihat 5.6).
- **Rapor** — lihat & unduh rapor siswa (lihat 5.7).

### 5.3 Mencatat Setoran Harian

Menu **Setoran** → tombol tambah setoran:

1. Pilih **kelompok** lalu **siswa**.
2. Pilih **jenis setoran**: Tahfidz, Tahsin Wafa, atau Tahsin Al-Qur'an.
3. Isi materi: surah + rentang ayat (Tahfidz/Tahsin Al-Qur'an) atau buku Wafa + rentang halaman (Tahsin Wafa).
4. Isi **adab** (Baik/Kurang Baik/Tidak Baik) dan **status** (Lulus/Tidak Lulus/Mengulang), catatan bila perlu → simpan.

Riwayat setoran Anda bisa diedit/dihapus (hapus selalu minta konfirmasi dan tercatat di log). Setoran berstatus **Lulus** otomatis dihitung ke progres target mingguan siswa.

### 5.4 Membuat Target Setoran Mingguan

Menu **Target Setoran** → tambah target:

1. Pilih kelompok, lalu **centang siswa** — atau centang opsi **"untuk semua siswa di kelompok"**.
2. Pilih jenis target dan materinya (rentang surah/ayat, juz, atau halaman Wafa) serta rentang tanggal berlaku.
3. Simpan. **Progres pencapaian (%) dihitung otomatis** dari setoran Lulus siswa yang materinya beririsan dengan target.

Anda dapat mengedit/menghapus target dari riwayat, dan mengekspor daftar target ke PDF.

### 5.5 Memeriksa Aktivitas Rumah

Menu **Aktivitas Rumah** menampilkan catatan aktivitas rumah siswa bimbingan Anda (murajaah/tilawah/tarjamah). Tandai catatan sebagai **Sudah Diperiksa** setelah Anda meninjaunya.

### 5.6 Menginput Nilai Rapor

Dari **Kelompok → anggota → tombol Nilai**:

- **Panel Tahfidz**: pilih surah → isi skor. Huruf nilai (A–D) dan deskripsi muncul otomatis. Menginput ulang surah yang sama akan **memperbarui** nilai lama (tidak dobel).
- **Panel Tahsin**: pilih jenis (Wafa/Al-Qur'an) dan topik → isi skor.
- **Materi Tahsin Terakhir**: isi kolom khusus ini untuk dicantumkan di rapor.

Rata-rata nilai rapor diperbarui otomatis setiap kali Anda menambah/mengubah/menghapus nilai.

### 5.7 Mengajukan Tashih

Menu **Tashih → Pendaftaran Tashih**: pilih kelompok → siswa → jenis (Al-Qur'an: juz/surah, atau Wafa: rentang halaman) → ajukan. Pantau status pengajuan (Menunggu/Diterima/Ditolak/Selesai) di halaman yang sama. Jadwal dan hasil tashih siswa Anda dapat dilihat di **Jadwal Tashih** dan **Hasil Tashih**.

### 5.8 Mengajukan & Menilai Munaqasyah

- **Pendaftaran Munaqasyah**: pilih siswa, **tahap (1–4)**, **jenis ujian (Tasmi/Munaqasyah)**, dan **juz** → ajukan. Catatan: setiap juz diuji dua kali (Tasmi dulu, lalu Munaqasyah) — ajukan keduanya secara terpisah.
- **Jadwal Munaqasyah**: melihat jadwal ujian siswa Anda, termasuk bila Anda ditunjuk sebagai penguji.
- **Penilaian Munaqasyah** (bila Anda penguji): pilih jadwal → siswa → form penilaian terbuka:
  - **Tasmi**: satu baris per surah dalam juz. Isi jumlah kesalahan **khofi** (ringan: awal ayat, makhroj, tajwid/mad) dan **jali** (berat: per baris, lebih satu kalimat) — nilai terhitung **langsung saat Anda mengetik**.
  - **Munaqasyah**: 5 soal tetap, cara isi sama.
  - Simpan. Bila kedua tahap siswa untuk juz itu sudah dinilai, nilai akhir & predikat muncul otomatis.

---

## 6. Panduan Siswa

Menu: **Beranda, Rapor, Target Setoran, Setoran, Aktivitas Rumah, Tashih (Jadwal/Hasil), Munaqasyah (Jadwal/Hasil)**.

### 6.1 Beranda

Ringkasan target berjalan & tercapai, total setoran, grafik nilai terbaru, dan **progres bacaan** Anda per juz/buku Wafa (bilah progres dengan filter Semua / Sedang Dijalani / Selesai).

### 6.2 Melihat Target & Setoran

- **Target Setoran**: daftar target dari guru beserta persentase pencapaian Anda. Pencapaian bertambah otomatis saat setoran Anda yang **Lulus** mencakup materi target.
- **Setoran**: riwayat setoran Anda yang dicatat guru (hanya-lihat), lengkap dengan status dan nilai adab.

### 6.3 Mencatat Aktivitas Rumah

Menu **Aktivitas Rumah** → tambah:

1. Pilih jenis: **Murajaah** (mengulang hafalan), **Tilawah** (membaca), atau **Tarjamah**.
2. Pilih juz, surah, dan rentang ayat; tambahkan catatan bila perlu → simpan.

Catatan Anda dapat diedit/dihapus selama belum diperiksa guru. Status berubah menjadi **Sudah Diperiksa** setelah ditinjau guru.

### 6.4 Jadwal & Hasil Ujian

- **Jadwal Tashih / Jadwal Munaqasyah**: tanggal, sesi, jam, dan lokasi ujian Anda yang sudah dijadwalkan koordinator.
- **Hasil Tashih**: lulus/tidak beserta catatan koordinator.
- **Hasil Munaqasyah**: nilai per tahap dan **nilai akhir gabungan** beserta predikat (Mumtaz / Jayyid Jiddan / Jayyid / Tidak Lulus).

### 6.5 Melihat & Mengunduh Rapor

Menu **Rapor**: pilih periode (tahun ajaran & semester) → tampil nilai Tahfidz per surah, Tahsin per topik, rata-rata, dan materi tahsin terakhir. Klik **Unduh PDF** untuk mendapatkan rapor resmi (berlogo sekolah, dengan kolom tanda tangan Kepala Sekolah dan Koordinator).

---

## 7. Istilah yang Dipakai

| Istilah | Arti |
|---|---|
| **Tahfidz** | Hafalan Al-Qur'an |
| **Tahsin** | Perbaikan bacaan (via buku Wafa atau langsung Al-Qur'an) |
| **Wafa** | Buku metode belajar membaca Al-Qur'an (berjenjang, per halaman) |
| **Setoran** | Bacaan/hafalan yang disetorkan siswa ke guru dan dicatat harian |
| **Murajaah** | Mengulang hafalan lama |
| **Tashih** | Ujian verifikasi bacaan (lulus/tidak) sebelum melanjutkan materi |
| **Munaqasyah** | Ujian akhir hafalan per juz, terdiri dari 2 tahap penilaian |
| **Tasmi** | Tahap pertama munaqasyah: memperdengarkan seluruh hafalan juz |
| **Khofi** | Kesalahan ringan (awal ayat, makhroj, tajwid/mad) |
| **Jali** | Kesalahan berat (salah baris, terlewat lebih satu kalimat) |
| **Mumtaz / Jayyid Jiddan / Jayyid** | Predikat kelulusan munaqasyah: Istimewa / Baik Sekali / Baik |
| **Adab** | Penilaian sikap saat setoran |
| **NIS/NISN** | Nomor induk siswa (sekolah/nasional) |
| **NIP** | Nomor induk pegawai (guru/koordinator) |

---

## 8. Pertanyaan Umum (FAQ)

**Saya tidak bisa login.**
Pastikan username & password benar (password peka huruf besar/kecil). Bila tetap gagal, minta admin mereset password Anda.

**Kenapa menu saya berbeda dengan pengguna lain?**
Menu mengikuti peran akun (admin/koordinator/guru/siswa). Bila peran Anda salah, hubungi admin.

**Guru: siswa saya tidak muncul saat input setoran.**
Siswa harus sudah dimasukkan ke **kelompok** yang Anda bimbing oleh koordinator. Pastikan juga siswa berstatus aktif.

**Kenapa progres target siswa tidak bertambah padahal sudah setoran?**
Hanya setoran berstatus **Lulus** yang dihitung, dan materinya (surah/ayat/halaman) harus beririsan dengan cakupan target serta berada dalam rentang tanggal target.

**Koordinator: tombol Terima/Tolak tidak muncul di permintaan.**
Tombol hanya tampil untuk permintaan berstatus **MENUNGGU**. Permintaan yang sudah direspons tidak bisa direspons ulang.

**Nilai akhir munaqasyah belum muncul.**
Nilai akhir terbit otomatis hanya setelah **kedua** tahap (Tasmi dan Munaqasyah) untuk siswa, juz, dan tahap yang sama selesai dinilai.

**Data baru tidak muncul di tabel.**
Muat ulang halaman (refresh). Periksa juga filter periode/kelompok yang sedang aktif — data mungkin tersaring.

**Rapor kosong.**
Pastikan guru sudah menginput nilai untuk periode tersebut, dan periode yang dipilih sesuai dengan tahun ajaran/semester saat nilai diinput.

**Kapan admin harus mengganti pengaturan Akademik?**
Setiap pergantian semester/tahun ajaran, **sebelum** aktivitas input dimulai — karena tahun & semester berjalan menjadi acuan rapor dan filter di seluruh sistem.
