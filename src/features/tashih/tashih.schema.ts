import { z } from 'zod';

export const TASHIH_TYPE_OPTIONS = [
  { value: 'ALQURAN', label: "Al-Qur'an" },
  { value: 'WAFA', label: 'Wafa' },
] as const;

export const TASHIH_STATUS_LABEL: Record<string, string> = {
  MENUNGGU: 'Menunggu',
  DITERIMA: 'Diterima',
  DITOLAK: 'Ditolak',
  SELESAI: 'Selesai',
};

export const tashihRequestSchema = z
  .object({
    groupId: z.string().min(1, 'Kelompok wajib dipilih'),
    studentId: z.string().min(1, 'Siswa wajib dipilih'),
    tashihType: z.enum(['ALQURAN', 'WAFA']),
    juzId: z.number().nullable(),
    surahId: z.number().nullable(),
    wafaId: z.number().nullable(),
    startPage: z.number().nullable(),
    endPage: z.number().nullable(),
    notes: z.string().max(191, 'Catatan maksimal 191 karakter').nullable(),
  })
  .refine(
    (data) =>
      data.tashihType === 'WAFA'
        ? data.wafaId != null && data.startPage != null && data.endPage != null
        : data.juzId != null && data.surahId != null,
    { message: 'Lengkapi detail bacaan sesuai jenis tashih', path: ['tashihType'] },
  );

export type TashihRequestSchema = z.infer<typeof tashihRequestSchema>;

export const tashihScheduleSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  sessionName: z.string().min(1, 'Nama sesi wajib diisi').max(100, 'Nama sesi maksimal 100 karakter'),
  startTime: z.string().min(1, 'Waktu mulai wajib diisi'),
  endTime: z.string().min(1, 'Waktu akhir wajib diisi'),
  location: z.string().min(1, 'Lokasi wajib diisi').max(150, 'Lokasi maksimal 150 karakter'),
  requestIds: z.array(z.string()).min(1, 'Pilih minimal satu permintaan'),
});

export type TashihScheduleSchema = z.infer<typeof tashihScheduleSchema>;
