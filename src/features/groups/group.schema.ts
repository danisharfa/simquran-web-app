import { z } from 'zod';

export const groupSchema = z.object({
  name: z.string().min(1, 'Nama kelompok wajib diisi'),
  classroomId: z.string().min(1, 'Kelas wajib dipilih'),
  teacherId: z.string().min(1, 'Guru pembimbing wajib dipilih'),
});

export type GroupSchema = z.infer<typeof groupSchema>;
