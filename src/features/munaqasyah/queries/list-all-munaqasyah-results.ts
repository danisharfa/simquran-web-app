import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface MunaqasyahResultTableData {
  id: string;
  studentName: string;
  batch: string;
  stage: string;
  juzName: string;
  totalScore: number;
  grade: string;
  passed: boolean;
}

export async function listAllMunaqasyahResults(): Promise<MunaqasyahResultTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const results = await prisma.munaqasyahResult.findMany({
    include: { request: { include: { student: { include: { user: true } }, juz: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return results.map((r) => ({
    id: r.id,
    studentName: r.request.student.user.name,
    batch: r.request.batch,
    stage: r.request.stage,
    juzName: r.request.juz.name,
    totalScore: r.totalScore,
    grade: r.grade,
    passed: r.passed,
  }));
}
