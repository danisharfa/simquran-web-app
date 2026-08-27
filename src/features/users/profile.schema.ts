import { z } from 'zod';

// Shared by update-own-profile and update-user-detail: both write these columns straight to
// `User`/profile tables with no other guardrail, so this is the only thing stopping oversized
// or malformed input (XSS payloads, huge blobs, junk NIP/NIS) from reaching the database.
export const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter').optional(),
  username: z
    .string()
    .min(8, 'Username minimal 8 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username hanya boleh huruf, angka, titik, garis bawah, dan strip')
    .optional(),
  email: z.string().max(191, 'Email maksimal 191 karakter').email('Email tidak valid').nullable().optional(),
  phoneNumber: z
    .string()
    .max(20, 'No. HP maksimal 20 karakter')
    .regex(/^[0-9+\-\s]*$/, 'No. HP hanya boleh angka, +, -, dan spasi')
    .nullable()
    .optional(),
  birthDate: z.date().nullable().optional(),
  birthPlace: z.string().max(100, 'Tempat lahir maksimal 100 karakter').nullable().optional(),
  address: z.string().max(191, 'Alamat maksimal 191 karakter').nullable().optional(),
  gender: z.enum(['MALE', 'FEMALE']).nullable().optional(),
  bloodType: z.enum(['A', 'B', 'AB', 'O']).nullable().optional(),
  nip: z.string().max(30, 'NIP maksimal 30 karakter').optional(),
  nis: z.string().max(30, 'NIS maksimal 30 karakter').optional(),
  nisn: z.string().max(30, 'NISN maksimal 30 karakter').nullable().optional(),
});

export function firstProfileValidationError(input: unknown): string | null {
  const result = profileUpdateSchema.safeParse(input);
  return result.success ? null : (result.error.issues[0]?.message ?? 'Data tidak valid');
}
