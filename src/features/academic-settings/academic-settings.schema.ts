import { z } from 'zod';

export const academicYearSchema = z.object({
  currentYear: z.string().min(1, 'Tahun ajaran wajib diisi'),
  currentSemester: z.enum(['GANJIL', 'GENAP']),
});

export const schoolInfoSchema = z.object({
  schoolName: z.string().min(1, 'Nama sekolah wajib diisi'),
  schoolAddress: z.string().min(1, 'Alamat sekolah wajib diisi'),
  currentPrincipalName: z.string().min(1, 'Nama kepala sekolah wajib diisi'),
});

export type AcademicYearSchema = z.infer<typeof academicYearSchema>;
export type SchoolInfoSchema = z.infer<typeof schoolInfoSchema>;
