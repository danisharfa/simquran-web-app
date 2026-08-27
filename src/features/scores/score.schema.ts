import { z } from 'zod';

export const TAHSIN_TYPE_OPTIONS = [
  { value: 'WAFA', label: 'Wafa' },
  { value: 'ALQURAN', label: "Al-Qur'an" },
] as const;

export const tahfidzScoreSchema = z.object({
  studentId: z.string().min(1),
  groupId: z.string().min(1),
  surahId: z.number({ message: 'Surah wajib dipilih' }),
  score: z.number().min(0).max(100),
});

export type TahfidzScoreSchema = z.infer<typeof tahfidzScoreSchema>;

export const tahsinScoreSchema = z.object({
  studentId: z.string().min(1),
  groupId: z.string().min(1),
  tahsinType: z.enum(['WAFA', 'ALQURAN']),
  topic: z.string().min(1, 'Topik wajib diisi'),
  score: z.number().min(0).max(100),
});

export type TahsinScoreSchema = z.infer<typeof tahsinScoreSchema>;
