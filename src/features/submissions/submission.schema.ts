import { z } from 'zod';

export const SUBMISSION_TYPE_OPTIONS = [
  { value: 'TAHFIDZ', label: 'Tahfidz' },
  { value: 'TAHSIN_WAFA', label: 'Tahsin Wafa' },
  { value: 'TAHSIN_ALQURAN', label: "Tahsin Al-Qur'an" },
] as const;

export const ADAB_OPTIONS = [
  { value: 'BAIK', label: 'Baik' },
  { value: 'KURANG_BAIK', label: 'Kurang Baik' },
  { value: 'TIDAK_BAIK', label: 'Tidak Baik' },
] as const;

export const SUBMISSION_STATUS_OPTIONS = [
  { value: 'LULUS', label: 'Lulus' },
  { value: 'TIDAK_LULUS', label: 'Tidak Lulus' },
  { value: 'MENGULANG', label: 'Mengulang' },
] as const;

export const submissionSchema = z
  .object({
    studentId: z.string().min(1, 'Siswa wajib dipilih'),
    groupId: z.string().min(1, 'Kelompok wajib dipilih'),
    date: z.string().min(1, 'Tanggal wajib diisi'),
    submissionType: z.enum(['TAHFIDZ', 'TAHSIN_WAFA', 'TAHSIN_ALQURAN']),
    juzId: z.number().nullable(),
    surahId: z.number().nullable(),
    startVerse: z.number().int().min(1, 'Ayat minimal 1').max(286, 'Ayat maksimal 286').nullable(),
    endVerse: z.number().int().min(1, 'Ayat minimal 1').max(286, 'Ayat maksimal 286').nullable(),
    wafaId: z.number().nullable(),
    startPage: z.number().nullable(),
    endPage: z.number().nullable(),
    adab: z.enum(['BAIK', 'KURANG_BAIK', 'TIDAK_BAIK']),
    submissionStatus: z.enum(['LULUS', 'TIDAK_LULUS', 'MENGULANG']),
    note: z.string().max(191, 'Catatan maksimal 191 karakter').nullable(),
  })
  .refine(
    (data) =>
      data.submissionType === 'TAHSIN_WAFA'
        ? data.wafaId != null && data.startPage != null && data.endPage != null
        : data.surahId != null && data.startVerse != null && data.endVerse != null,
    { message: 'Lengkapi detail bacaan sesuai jenis setoran', path: ['submissionType'] },
  );

export type SubmissionSchema = z.infer<typeof submissionSchema>;
