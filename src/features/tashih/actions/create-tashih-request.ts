'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { tashihRequestSchema, type TashihRequestSchema } from '../tashih.schema';
import { isRangeFullyCovered } from '../is-range-covered';

export async function createTashihRequest(input: TashihRequestSchema) {
  const session = await requireRoleOrThrow(['teacher']);

  const parsed = tashihRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const { groupId, studentId, ...rest } = parsed.data;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group || group.teacherId !== session.user.id) {
    return { success: false, message: 'Kelompok tidak valid' };
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
  if (!student || student.groupId !== groupId) {
    return { success: false, message: 'Siswa bukan anggota kelompok ini' };
  }

  if (rest.tashihType === 'ALQURAN') {
    const surahJuz = await prisma.surahJuz.findFirst({
      where: { surahId: rest.surahId!, juzId: rest.juzId! },
    });
    if (!surahJuz) {
      return { success: false, message: 'Surah tidak termasuk dalam juz yang dipilih' };
    }

    const submissions = await prisma.submission.findMany({
      where: {
        studentId,
        submissionType: 'TAHFIDZ',
        submissionStatus: 'LULUS',
        surahId: rest.surahId!,
      },
      select: { startVerse: true, endVerse: true },
    });

    const covered = isRangeFullyCovered(
      surahJuz.startVerse,
      surahJuz.endVerse,
      submissions
        .filter((s) => s.startVerse != null && s.endVerse != null)
        .map((s) => ({ start: s.startVerse!, end: s.endVerse! })),
    );

    if (!covered) {
      return {
        success: false,
        message: 'Surah pada juz ini belum disetor penuh (lulus) oleh siswa, tashih belum bisa diajukan',
      };
    }
  } else {
    const submissions = await prisma.submission.findMany({
      where: {
        studentId,
        submissionType: 'TAHSIN_WAFA',
        submissionStatus: 'LULUS',
        wafaId: rest.wafaId!,
      },
      select: { startPage: true, endPage: true },
    });

    const covered = isRangeFullyCovered(
      rest.startPage!,
      rest.endPage!,
      submissions
        .filter((s) => s.startPage != null && s.endPage != null)
        .map((s) => ({ start: s.startPage!, end: s.endPage! })),
    );

    if (!covered) {
      return {
        success: false,
        message: 'Halaman Wafa ini belum disetor penuh (lulus) oleh siswa, tashih belum bisa diajukan',
      };
    }
  }

  await prisma.tashihRequest.create({
    data: {
      id: randomUUID(),
      studentId,
      groupId,
      teacherId: session.user.id,
      ...rest,
    },
  });

  revalidatePath('/dashboard/tashih/request');

  return { success: true, message: 'Permintaan tashih berhasil diajukan' };
}
