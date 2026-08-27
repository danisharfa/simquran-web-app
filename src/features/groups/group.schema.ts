import { z } from 'zod';

export const groupSchema = z.object({
  name: z.string().min(1, 'Nama kelompok wajib diisi').max(50, 'Nama kelompok maksimal 50 karakter'),
  classroomId: z.string().min(1, 'Kelas wajib dipilih'),
  teacherId: z.string().min(1, 'Guru pembimbing wajib dipilih'),
});

export type GroupSchema = z.infer<typeof groupSchema>;

export const groupNameSchema = z.object({
  name: z.string().min(1, 'Nama kelompok wajib diisi').max(50, 'Nama kelompok maksimal 50 karakter'),
});

export type GroupNameSchema = z.infer<typeof groupNameSchema>;
