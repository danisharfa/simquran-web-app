import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { MunaqasyahResultTableData } from './list-all-munaqasyah-results';

export async function listOwnMunaqasyahResults(): Promise<MunaqasyahResultTableData[]> {
  const session = await requireRoleOrThrow(['student']);

  const results = await prisma.munaqasyahResult.findMany({
    where: { request: { studentId: session.user.id } },
    include: {
      request: { include: { student: { include: { user: true } }, juz: true, group: { include: { classroom: true } } } },
      schedule: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return results.map((r) => ({
    id: r.id,
    studentName: r.request.student.user.name,
    groupId: r.request.groupId,
    groupName: r.request.group.name,
    classroomId: r.request.group.classroomId,
    classroomName: `${r.request.group.classroom.level} ${r.request.group.classroom.name}`,
    academicYear: r.request.group.classroom.academicYear,
    semester: r.request.group.classroom.semester,
    batch: r.request.batch,
    stage: r.request.stage,
    juzName: r.request.juz.name,
    totalScore: r.totalScore,
    grade: r.grade,
    passed: r.passed,
    scheduleDate: r.schedule.date,
  }));
}
