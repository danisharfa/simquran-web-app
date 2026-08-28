import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface SchedulableMunaqasyahRequest {
  id: string;
  studentName: string;
  tahap: string;
  jenis: string;
  juzName: string;
}

export async function listSchedulableMunaqasyahRequests(): Promise<SchedulableMunaqasyahRequest[]> {
  await requireRoleOrThrow(['coordinator']);

  const requests = await prisma.munaqasyahRequest.findMany({
    where: { status: 'DITERIMA', scheduleRequests: { none: {} } },
    include: { student: { include: { user: true } }, juz: true },
    orderBy: { createdAt: 'asc' },
  });

  return requests.map((r) => ({
    id: r.id,
    studentName: r.student.user.name,
    tahap: r.tahap,
    jenis: r.jenis,
    juzName: r.juz.name,
  }));
}

export async function listSchedulableMunaqasyahRequestsForEdit(
  scheduleId: string,
): Promise<SchedulableMunaqasyahRequest[]> {
  await requireRoleOrThrow(['coordinator']);

  const requests = await prisma.munaqasyahRequest.findMany({
    where: {
      status: 'DITERIMA',
      OR: [{ scheduleRequests: { none: {} } }, { scheduleRequests: { some: { scheduleId } } }],
    },
    include: { student: { include: { user: true } }, juz: true },
    orderBy: { createdAt: 'asc' },
  });

  return requests.map((r) => ({
    id: r.id,
    studentName: r.student.user.name,
    tahap: r.tahap,
    jenis: r.jenis,
    juzName: r.juz.name,
  }));
}
