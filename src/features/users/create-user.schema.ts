import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  username: z
    .string()
    .min(8, 'Username minimal 8 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username hanya boleh huruf, angka, titik, garis bawah, dan strip'),
  role: z.enum(['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT'], {
    message: 'Role wajib dipilih',
  }),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
