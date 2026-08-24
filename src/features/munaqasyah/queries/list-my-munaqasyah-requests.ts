import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface MunaqasyahRequestTableData {
  id: string;
  studentName: string;
  groupName: string;
  batch: string;
  stage: string;
  juzName: string;
  status: string;
}

export async function listMyMunaqasyahRequests(): Promise<MunaqasyahRequestTableData[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const requests = await prisma.munaqasyahRequest.findMany({
    where: { teacherId: session.user.id },
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
