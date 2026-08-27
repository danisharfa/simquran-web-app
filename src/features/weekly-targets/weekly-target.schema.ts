import { z } from 'zod';

export const TARGET_TYPE_OPTIONS = [
  { value: 'TAHFIDZ', label: 'Tahfidz' },
  { value: 'TAHSIN_WAFA', label: 'Tahsin Wafa' },
  { value: 'TAHSIN_ALQURAN', label: "Tahsin Al-Qur'an" },
] as const;

export const TARGET_STATUS_OPTIONS = [
  { value: 'TIDAK_TERCAPAI', label: 'Tidak Tercapai' },
  { value: 'TERCAPAI', label: 'Tercapai' },
] as const;

export const weeklyTargetFieldsSchema = z
  .object({
    groupId: z.string().min(1, 'Kelompok wajib dipilih'),
    type: z.enum(['TAHFIDZ', 'TAHSIN_WAFA', 'TAHSIN_ALQURAN']),
    startDate: z.string().min(1, 'Tanggal awal wajib diisi'),
    endDate: z.string().min(1, 'Tanggal akhir wajib diisi'),
    description: z.string().max(191, 'Deskripsi maksimal 191 karakter'),
    status: z.enum(['TIDAK_TERCAPAI', 'TERCAPAI']),
    progressPercent: z.number().min(0).max(100).nullable(),
    surahStartId: z.number().nullable(),
    surahEndId: z.number().nullable(),
    startAyat: z.number().int().min(1, 'Ayat minimal 1').max(286, 'Ayat maksimal 286').nullable(),
    endAyat: z.number().int().min(1, 'Ayat minimal 1').max(286, 'Ayat maksimal 286').nullable(),
    juzStartId: z.number().nullable(),
    juzEndId: z.number().nullable(),
    wafaId: z.number().nullable(),
    startPage: z.number().nullable(),
    endPage: z.number().nullable(),
  })
  .refine(
    (data) =>
      data.type === 'TAHSIN_WAFA'
        ? data.wafaId != null && data.startPage != null && data.endPage != null
        : data.surahStartId != null && data.surahEndId != null && data.startAyat != null && data.endAyat != null,
    { message: 'Lengkapi detail target sesuai jenis', path: ['type'] },
  );

export const createWeeklyTargetSchema = weeklyTargetFieldsSchema.and(
  z.object({ studentIds: z.array(z.string()).min(1, 'Pilih minimal satu siswa') }),
);

export type WeeklyTargetFields = z.infer<typeof weeklyTargetFieldsSchema>;
export type CreateWeeklyTargetInput = z.infer<typeof createWeeklyTargetSchema>;
