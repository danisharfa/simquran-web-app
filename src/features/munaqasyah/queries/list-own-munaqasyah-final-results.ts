import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { MunaqasyahFinalResultTableData } from './list-all-munaqasyah-final-results';

export async function listOwnMunaqasyahFinalResults(): Promise<MunaqasyahFinalResultTableData[]> {
  const session = await requireRoleOrThrow(['student']);

  const results = await prisma.munaqasyahFinalResult.findMany({
    where: { studentId: session.user.id },
    include: { student: { include: { user: true } }, group: true, juz: true },
    orderBy: { createdAt: 'desc' },
  });

  return results.map((r) => ({
    id: r.id,
    studentName: r.student.user.name,
    groupName: r.group.name,
    juzName: r.juz.name,
    batch: r.batch,
    finalScore: r.finalScore,
    finalGrade: r.finalGrade,
    passed: r.passed,
  }));
}
