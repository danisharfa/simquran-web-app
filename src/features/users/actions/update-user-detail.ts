'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { headers } from 'next/headers';
import type { Gender, BloodType } from '@/lib/generated/prisma/enums';

export interface UpdateUserDetailInput {
  userId: string;
  role: string; // role TARGET user, dipakai untuk tahu profile mana yang diupdate — tidak ikut diubah
  name?: string;
  username?: string;
  email?: string | null;
  phoneNumber?: string | null;
  birthDate?: Date | null;
  birthPlace?: string | null;
  address?: string | null;
  gender?: Gender | null;
  bloodType?: BloodType | null;
  // Spesifik per role — kirim hanya yang relevan dari client
  nip?: string;
  nis?: string;
  nisn?: string | null;
}

export async function updateUserDetail(input: UpdateUserDetailInput) {
  const session = await requireRoleOrThrow(['superadmin', 'admin']);
  const viewerRole = session.user.role.toLowerCase();
  const targetRole = input.role.toLowerCase();

  // Admin biasa tidak boleh mengubah data superadmin/admin lain
  if (viewerRole === 'admin' && ['admin', 'superadmin'].includes(targetRole)) {
    throw new Error('Forbidden: tidak memiliki akses untuk mengubah data ini');
  }

  const { userId, name, username } = input;

  // 1. Field yang dikelola better-auth (name + username plugin)
  // Email tidak di-update lewat adminUpdateUser karena plugin admin melarangnya;
  // email di-update langsung via Prisma di bawah.
  const authData: Record<string, string> = {};
  if (name !== undefined) authData.name = name;
  if (username !== undefined) authData.username = username;

  if (Object.keys(authData).length > 0) {
    await auth.api.adminUpdateUser({
      body: { userId, data: authData },
      headers: await headers(),
    });
  }

  // 2. Field custom di tabel User (termasuk email) + 3. profile spesifik per role,
  // dibungkus transaction supaya atomic — kalau salah satu gagal
  // (misal NIS sudah dipakai user lain / unique constraint), semuanya rollback.
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        email: input.email,
        phoneNumber: input.phoneNumber,
        birthDate: input.birthDate,
        birthPlace: input.birthPlace,
        address: input.address,
        gender: input.gender,
        bloodType: input.bloodType,
      },
    });

    if (targetRole === 'teacher' && input.nip !== undefined) {
      await tx.teacherProfile.update({ where: { userId }, data: { nip: input.nip } });
    } else if (targetRole === 'coordinator' && input.nip !== undefined) {
      await tx.coordinatorProfile.update({ where: { userId }, data: { nip: input.nip } });
    } else if (targetRole === 'student' && (input.nis !== undefined || input.nisn !== undefined)) {
      await tx.studentProfile.update({
        where: { userId },
        data: {
          nis: input.nis,
          nisn: input.nisn,
        },
      });
    }
  });

  return { success: true };
}