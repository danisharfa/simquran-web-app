import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { MunaqasyahRequestTableData } from './list-my-munaqasyah-requests';

export async function listAllMunaqasyahRequests(): Promise<MunaqasyahRequestTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const requests = await prisma.munaqasyahRequest.findMany({
    include: { student: { include: { user: true } }, group: true, juz: true },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map((r) => ({
    id: r.id,
    studentName: r.student.user.name,
    groupName: r.group.name,
    batch: r.batch,
    stage: r.stage,
    juzName: r.juz.name,
    status: r.status,
  }));
}
