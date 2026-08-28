import { z } from 'zod';

export const TAHAP_OPTIONS = [
  { value: 'TAHAP_1', label: 'Tahap 1' },
  { value: 'TAHAP_2', label: 'Tahap 2' },
  { value: 'TAHAP_3', label: 'Tahap 3' },
  { value: 'TAHAP_4', label: 'Tahap 4' },
] as const;

export const JENIS_UJIAN_OPTIONS = [
  { value: 'TASMI', label: 'Tasmi' },
  { value: 'MUNAQASYAH', label: 'Munaqasyah' },
] as const;

export const STATUS_LABEL: Record<string, string> = {
  MENUNGGU: 'Menunggu',
  DITERIMA: 'Diterima',
  DITOLAK: 'Ditolak',
  SELESAI: 'Selesai',
};

export const munaqasyahRequestSchema = z.object({
  groupId: z.string().min(1, 'Kelompok wajib dipilih'),
  studentId: z.string().min(1, 'Siswa wajib dipilih'),
  tahap: z.enum(['TAHAP_1', 'TAHAP_2', 'TAHAP_3', 'TAHAP_4']),
  jenis: z.enum(['TASMI', 'MUNAQASYAH']),
  juzId: z.number({ message: 'Juz wajib dipilih' }),
});

export type MunaqasyahRequestSchema = z.infer<typeof munaqasyahRequestSchema>;

export const munaqasyahScheduleSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  sessionName: z.string().min(1, 'Nama sesi wajib diisi').max(100, 'Nama sesi maksimal 100 karakter'),
  startTime: z.string().min(1, 'Waktu mulai wajib diisi'),
  endTime: z.string().min(1, 'Waktu akhir wajib diisi'),
  location: z.string().min(1, 'Lokasi wajib diisi').max(150, 'Lokasi maksimal 150 karakter'),
  examinerId: z.string().nullable(),
  requestIds: z.array(z.string()).min(1, 'Pilih minimal satu permintaan'),
});

export type MunaqasyahScheduleSchema = z.infer<typeof munaqasyahScheduleSchema>;

export const scoringWeightsSchema = z.object({
  khofiAwalAyatWeight: z.number().min(0, 'Bobot tidak boleh negatif'),
  khofiMakhrojWeight: z.number().min(0, 'Bobot tidak boleh negatif'),
  khofiTajwidMadWeight: z.number().min(0, 'Bobot tidak boleh negatif'),
  jaliBarisWeight: z.number().min(0, 'Bobot tidak boleh negatif'),
  jaliLebihSatuKalimatWeight: z.number().min(0, 'Bobot tidak boleh negatif'),
});

export type ScoringWeightsSchema = z.infer<typeof scoringWeightsSchema>;

export const surahInitialScoreSchema = z.object({
  surahId: z.number(),
  initialScore: z.number().min(1, 'Nilai awal harus minimal 1'),
});

export const updateSurahInitialScoresSchema = z.object({
  scores: z.array(surahInitialScoreSchema).min(1),
});

export type UpdateSurahInitialScoresSchema = z.infer<typeof updateSurahInitialScoresSchema>;

export const munaqasyahGradeSettingSchema = z.object({
  grade: z.enum(['MUMTAZ', 'JAYYID_JIDDAN', 'JAYYID', 'TIDAK_LULUS']),
  minScore: z.number().min(0, 'Nilai minimal tidak boleh negatif').max(100, 'Nilai minimal maksimal 100'),
  label: z.string().min(1, 'Label wajib diisi').max(50, 'Label maksimal 50 karakter'),
});

export const updateMunaqasyahGradeSettingsSchema = z
  .object({ settings: z.array(munaqasyahGradeSettingSchema).length(4) })
  .refine(
    (data) => {
      const byGrade = Object.fromEntries(data.settings.map((s) => [s.grade, s.minScore]));
      return byGrade.MUMTAZ > byGrade.JAYYID_JIDDAN && byGrade.JAYYID_JIDDAN > byGrade.JAYYID && byGrade.JAYYID > byGrade.TIDAK_LULUS;
    },
    { message: 'Nilai minimal harus menurun berurutan: Mumtaz > Jayyid Jiddan > Jayyid > Tidak Lulus' },
  );

export type UpdateMunaqasyahGradeSettingsSchema = z.infer<typeof updateMunaqasyahGradeSettingsSchema>;

export const finalScoreWeightsSchema = z
  .object({
    tasmiWeight: z.number().min(0, 'Bobot tidak boleh negatif').max(100, 'Bobot maksimal 100'),
    munaqasyahWeight: z.number().min(0, 'Bobot tidak boleh negatif').max(100, 'Bobot maksimal 100'),
  })
  .refine((data) => data.tasmiWeight + data.munaqasyahWeight === 100, {
    message: 'Total bobot Tasmi dan Munaqasyah harus 100%',
  });

export type FinalScoreWeightsSchema = z.infer<typeof finalScoreWeightsSchema>;
