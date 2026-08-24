'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { createUserSchema } from '../create-user.schema';

export async function createUser(formData: FormData) {
  const session = await requireRoleOrThrow(['superadmin', 'admin']);
  const callerRole = session.user.role.toLowerCase();

  const parsed = createUserSchema.safeParse({
    name: formData.get('name'),
    username: formData.get('username'),
    role: formData.get('role'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Data tidak valid',
    };
  }

  const { name, username, role } = parsed.data;

  if (callerRole === 'admin' && role === 'ADMIN') {
    return { success: false, error: 'Admin tidak dapat membuat akun dengan role Admin' };
  }

  // Default: nip/nis sama dengan username, tidak diisi manual.
  const nip = username;
  const nis = username;

  // SUPERADMIN dan ADMIN tidak butuh profile tambahan —
  // tidak ada validasi atau pembuatan profile untuk role ini.

  // Email & password di-generate otomatis dari username, sesuai keputusan
  // produk: pengguna tidak perlu input email/password manual saat dibuat.
  const generatedEmail = `${username}@sekolah.local`;
  const generatedPassword = username;

  // Tahap 1: buat identitas login lewat better-auth.
  let createdUserId: string;

  try {
    const newUser = await auth.api.createUser({
      body: {
        name,
        email: generatedEmail,
        password: generatedPassword,
        role,
        data: { username },
      },
      headers: await headers(),
    });

    createdUserId = newUser.user.id;
  } catch (error) {
    console.error('Failed to create user account:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal membuat akun pengguna',
    };
  }

  // Tahap 2: buat data profile sesuai role (kalau memang butuh profile).
  // Kalau gagal, ROLLBACK manual dengan menghapus user yang baru dibuat
  // di Tahap 1, supaya tidak ada akun "setengah jadi" tanpa profile.
  try {
    if (role === 'COORDINATOR') {
      await prisma.coordinatorProfile.create({
        data: {
          userId: createdUserId,
          nip,
        },
      });
    }

    if (role === 'TEACHER') {
      await prisma.teacherProfile.create({
        data: {
          userId: createdUserId,
          nip,
        },
      });
    }

    if (role === 'STUDENT') {
      await prisma.studentProfile.create({
        data: {
          userId: createdUserId,
          nis,
        },
      });
    }

    // SUPERADMIN & ADMIN: tidak ada Tahap 2, langsung lanjut.
  } catch (error) {
    console.error('Failed to create profile, rolling back user:', error);

    // Rollback: hapus user yang sudah terbuat di Tahap 1
    await auth.api.removeUser({
      body: { userId: createdUserId },
      headers: await headers(),
    });

    return {
      success: false,
      error:
        error instanceof Error
          ? `Gagal membuat profil: ${error.message}`
          : 'Gagal membuat profil pengguna',
    };
  }

  revalidatePath('/dashboard/users');

  return { success: true };
}
