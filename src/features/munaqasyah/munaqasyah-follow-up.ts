import { randomUUID } from 'node:crypto';

import { prisma } from '@/lib/prisma';
import type { MunaqasyahTahap } from '@/lib/generated/prisma/enums';

export async function hasPassedTasmi(studentId: string, juzId: number): Promise<boolean> {
  const passedTasmi = await prisma.munaqasyahRequest.findFirst({
    where: { studentId, juzId, jenis: 'TASMI', status: 'SELESAI', result: { passed: true } },
  });
  return !!passedTasmi;
}

export async function findActiveMunaqasyahFollowUp(studentId: string, juzId: number) {
  return prisma.munaqasyahRequest.findFirst({
    where: { studentId, juzId, jenis: 'MUNAQASYAH', status: { not: 'DITOLAK' } },
  });
}

export function assertTasmiResultEditable(followUp: { status: string } | null): string | null {
  if (followUp && followUp.status !== 'MENUNGGU') {
    return 'Tidak dapat mengubah hasil Tasmi karena permintaan Munaqasyah lanjutannya sudah diterima/selesai. Batalkan penerimaan permintaan Munaqasyah tersebut terlebih dahulu.';
  }
  return null;
}

export async function syncMunaqasyahFollowUpAfterTasmiChange(
  request: { studentId: string; groupId: string; teacherId: string; juzId: number; tahap: MunaqasyahTahap },
  passed: boolean,
): Promise<void> {
  const followUp = await findActiveMunaqasyahFollowUp(request.studentId, request.juzId);

  if (passed && !followUp) {
    await prisma.munaqasyahRequest.create({
      data: {
        id: randomUUID(),
        studentId: request.studentId,
        groupId: request.groupId,
        teacherId: request.teacherId,
        tahap: request.tahap,
        jenis: 'MUNAQASYAH',
        juzId: request.juzId,
        status: 'MENUNGGU',
      },
    });
    return;
  }

  if (!passed && followUp && followUp.status === 'MENUNGGU') {
    await prisma.munaqasyahRequest.delete({ where: { id: followUp.id } });
  }
}
