import { z } from 'zod';

export const HOME_ACTIVITY_TYPE_OPTIONS = [
  { value: 'MURAJAAH', label: 'Murajaah' },
  { value: 'TILAWAH', label: 'Tilawah' },
  { value: 'TARJAMAH', label: 'Tarjamah' },
] as const;

export const HOME_ACTIVITY_STATUS_OPTIONS = [
  { value: 'BELUM_DIPERIKSA', label: 'Belum Diperiksa' },
  { value: 'SUDAH_DIPERIKSA', label: 'Sudah Diperiksa' },
] as const;

export const homeActivitySchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  activityType: z.enum(['MURAJAAH', 'TILAWAH', 'TARJAMAH']),
  juzId: z.number({ message: 'Juz wajib dipilih' }),
  surahId: z.number({ message: 'Surah wajib dipilih' }),
  startVerse: z.number({ message: 'Ayat mulai wajib diisi' }),
  endVerse: z.number({ message: 'Ayat akhir wajib diisi' }),
  note: z.string().nullable(),
});

export type HomeActivitySchema = z.infer<typeof homeActivitySchema>;
