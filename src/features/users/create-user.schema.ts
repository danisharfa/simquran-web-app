import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  username: z.string().min(8, 'Username minimal 8 karakter'),
  role: z.enum(['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT'], {
    message: 'Role wajib dipilih',
  }),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
