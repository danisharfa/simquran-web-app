import { z } from 'zod';

export const classroomSchema = z.object({
  level: z
    .enum(['1', '2', '3', '4', '5', '6'], { message: 'Level wajib dipilih' })
    .transform(Number),
  name: z.string().min(1, 'Nama kelas wajib diisi'),
  academicYear: z.string().min(1, 'Tahun ajaran wajib diisi'),
  semester: z.enum(['GANJIL', 'GENAP'], { message: 'Semester wajib dipilih' }),
});

export type ClassroomSchema = z.infer<typeof classroomSchema>;

export const classroomNameSchema = z.object({
  name: z.string().min(1, 'Nama kelas wajib diisi'),
});

export type ClassroomNameSchema = z.infer<typeof classroomNameSchema>;
