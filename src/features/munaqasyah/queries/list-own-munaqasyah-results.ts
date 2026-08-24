import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { MunaqasyahResultTableData } from './list-all-munaqasyah-results';

export async function listOwnMunaqasyahResults(): Promise<MunaqasyahResultTableData[]> {
  const session = await requireRoleOrThrow(['student']);

  const results = await prisma.munaqasyahResult.findMany({
    where: { request: { studentId: session.user.id } },
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
