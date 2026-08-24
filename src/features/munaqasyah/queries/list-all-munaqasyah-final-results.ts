import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface MunaqasyahFinalResultTableData {
  id: string;
  studentName: string;
  groupName: string;
  juzName: string;
  batch: string;
  finalScore: number;
  finalGrade: string;
  passed: boolean;
}

export async function listAllMunaqasyahFinalResults(): Promise<MunaqasyahFinalResultTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const results = await prisma.munaqasyahFinalResult.findMany({
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
