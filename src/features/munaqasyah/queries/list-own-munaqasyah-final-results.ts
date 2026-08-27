import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { MunaqasyahFinalResultTableData } from './list-all-munaqasyah-final-results';

export async function listOwnMunaqasyahFinalResults(): Promise<MunaqasyahFinalResultTableData[]> {
  const session = await requireRoleOrThrow(['student']);

  const results = await prisma.munaqasyahFinalResult.findMany({
    where: { studentId: session.user.id },
    include: { student: { include: { user: true } }, group: { include: { classroom: true } }, juz: true },
    orderBy: { createdAt: 'desc' },
  });

  return results.map((r) => ({
    id: r.id,
    studentName: r.student.user.name,
    groupId: r.groupId,
    groupName: r.group.name,
    classroomId: r.group.classroomId,
    classroomName: `${r.group.classroom.level} ${r.group.classroom.name}`,
    academicYear: r.group.classroom.academicYear,
    semester: r.group.classroom.semester,
    juzName: r.juz.name,
    batch: r.batch,
    finalScore: r.finalScore,
    finalGrade: r.finalGrade,
    passed: r.passed,
  }));
}
