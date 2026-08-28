import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface MunaqasyahFinalResultTableData {
  id: string;
  studentName: string;
  groupId: string;
  groupName: string;
  classroomId: string;
  classroomName: string;
  academicYear: string;
  semester: string;
  juzName: string;
  tahap: string;
  finalScore: number;
  finalGrade: string;
  passed: boolean;
}

export async function listAllMunaqasyahFinalResults(): Promise<MunaqasyahFinalResultTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const results = await prisma.munaqasyahFinalResult.findMany({
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
    tahap: r.tahap,
    finalScore: r.finalScore,
    finalGrade: r.finalGrade,
    passed: r.passed,
  }));
}
