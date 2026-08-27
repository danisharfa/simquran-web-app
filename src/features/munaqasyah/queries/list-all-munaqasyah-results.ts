import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface MunaqasyahResultTableData {
  id: string;
  studentName: string;
  groupId: string;
  groupName: string;
  classroomId: string;
  classroomName: string;
  academicYear: string;
  semester: string;
  batch: string;
  stage: string;
  juzName: string;
  totalScore: number;
  grade: string;
  passed: boolean;
  scheduleDate: Date;
}

export async function listAllMunaqasyahResults(): Promise<MunaqasyahResultTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const results = await prisma.munaqasyahResult.findMany({
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
