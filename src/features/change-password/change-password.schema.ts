import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi').max(72, 'Password maksimal 72 karakter'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter').max(72, 'Password maksimal 72 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi').max(72, 'Password maksimal 72 karakter'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
