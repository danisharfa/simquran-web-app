import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface MunaqasyahRequestTableData {
  id: string;
  studentName: string;
  groupId: string;
  groupName: string;
  classroomId: string;
  classroomName: string;
  academicYear: string;
  semester: string;
  tahap: string;
  jenis: string;
  juzName: string;
  status: string;
  createdAt: Date;
}

export async function listMyMunaqasyahRequests(): Promise<MunaqasyahRequestTableData[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const requests = await prisma.munaqasyahRequest.findMany({
    where: { teacherId: session.user.id },
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
