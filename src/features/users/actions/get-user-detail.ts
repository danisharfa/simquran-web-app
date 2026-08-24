'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface UserDetail {
  id: string;
  role: string; // dibutuhkan untuk menentukan field profile mana yang relevan (nip vs nis/nisn), tidak diedit
  name: string;
  username: string;
  email: string | null;
  phoneNumber: string | null;
  birthDate: Date | null;
  birthPlace: string | null;
  address: string | null;
  gender: string | null;
  bloodType: string | null;
  // Profile spesifik per role — cuma salah satu yang akan terisi
  nip: string | null;
  nis: string | null;
  nisn: string | null;
}

export async function getUserDetail(userId: string): Promise<UserDetail> {
  const session = await requireRoleOrThrow(['superadmin', 'admin']);
  const viewerRole = session.user.role.toLowerCase();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      teacherProfiles: true,
      coordinatorProfiles: true,
      studentProfiles: true,
    },
  });

  // Admin biasa tidak boleh melihat detail superadmin/admin lain
  if (viewerRole === 'admin' && ['admin', 'superadmin'].includes(user.role.toLowerCase())) {
    throw new Error('Forbidden: tidak memiliki akses ke data ini');
  }

  return {
    id: user.id,
    role: user.role,
    name: user.name,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    birthDate: user.birthDate,
    birthPlace: user.birthPlace,
    address: user.address,
    gender: user.gender,
    bloodType: user.bloodType,
    nip: user.teacherProfiles[0]?.nip ?? user.coordinatorProfiles[0]?.nip ?? null,
    nis: user.studentProfiles[0]?.nis ?? null,
    nisn: user.studentProfiles[0]?.nisn ?? null,
  };
}