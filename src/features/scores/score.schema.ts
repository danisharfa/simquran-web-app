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
  topic: z.string().min(1, 'Topik wajib diisi').max(100, 'Topik maksimal 100 karakter'),
  score: z.number().min(0).max(100),
});

export type TahsinScoreSchema = z.infer<typeof tahsinScoreSchema>;

export const gradeLetterSettingSchema = z.object({
  grade: z.enum(['A', 'B', 'C', 'D']),
  minScore: z.number().min(0, 'Nilai minimal tidak boleh negatif').max(100, 'Nilai minimal maksimal 100'),
  description: z.string().min(1, 'Deskripsi wajib diisi').max(50, 'Deskripsi maksimal 50 karakter'),
});

export const updateGradeLetterSettingsSchema = z
  .object({ settings: z.array(gradeLetterSettingSchema).length(4) })
  .refine(
    (data) => {
      const byGrade = Object.fromEntries(data.settings.map((s) => [s.grade, s.minScore]));
      return byGrade.A > byGrade.B && byGrade.B > byGrade.C && byGrade.C > byGrade.D;
    },
    { message: 'Nilai minimal harus menurun berurutan: A > B > C > D' },
  );

export type UpdateGradeLetterSettingsSchema = z.infer<typeof updateGradeLetterSettingsSchema>;

export const reportTemplateSchema = z.object({
  template: z.string().min(1, 'Template wajib diisi').max(191, 'Template maksimal 191 karakter'),
});

export type ReportTemplateSchema = z.infer<typeof reportTemplateSchema>;
