import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { MunaqasyahRequestTableData } from './list-my-munaqasyah-requests';

export async function listAllMunaqasyahRequests(): Promise<MunaqasyahRequestTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const requests = await prisma.munaqasyahRequest.findMany({
    include: { student: { include: { user: true } }, group: { include: { classroom: true } }, juz: true },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map((r) => ({
    id: r.id,
    studentName: r.student.user.name,
    groupId: r.groupId,
    groupName: r.group.name,
    classroomId: r.group.classroomId,
    classroomName: `${r.group.classroom.level} ${r.group.classroom.name}`,
    academicYear: r.group.classroom.academicYear,
    semester: r.group.classroom.semester,
    tahap: r.tahap,
    jenis: r.jenis,
    juzName: r.juz.name,
    status: r.status,
    createdAt: r.createdAt,
  }));
}
