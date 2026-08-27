import { z } from 'zod';

export const academicYearSchema = z.object({
  currentYear: z.string().min(1, 'Tahun ajaran wajib diisi').max(20, 'Tahun ajaran maksimal 20 karakter'),
  currentSemester: z.enum(['GANJIL', 'GENAP']),
});

export const schoolInfoSchema = z.object({
  schoolName: z.string().min(1, 'Nama sekolah wajib diisi').max(150, 'Nama sekolah maksimal 150 karakter'),
  schoolAddress: z.string().min(1, 'Alamat sekolah wajib diisi').max(191, 'Alamat sekolah maksimal 191 karakter'),
  currentPrincipalName: z
    .string()
    .min(1, 'Nama kepala sekolah wajib diisi')
    .max(100, 'Nama kepala sekolah maksimal 100 karakter'),
});

export type AcademicYearSchema = z.infer<typeof academicYearSchema>;
export type SchoolInfoSchema = z.infer<typeof schoolInfoSchema>;
