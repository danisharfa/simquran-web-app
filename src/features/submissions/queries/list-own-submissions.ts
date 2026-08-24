import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatSubmissionDetail } from '../format-submission-detail';
import type { SubmissionTableData } from './list-my-submissions';

export async function listOwnSubmissions(): Promise<SubmissionTableData[]> {
  const session = await requireRoleOrThrow(['student']);

  const submissions = await prisma.submission.findMany({
    where: { studentId: session.user.id },
    include: { student: { include: { user: true } }, group: true, surah: true, wafa: true },
    orderBy: { date: 'desc' },
  });

  return submissions.map((s) => ({
    id: s.id,
    date: s.date,
    studentName: s.student.user.name,
    groupName: s.group.name,
    submissionType: s.submissionType,
    detail: formatSubmissionDetail(s),
    adab: s.adab,
    submissionStatus: s.submissionStatus,
    note: s.note,
  }));
}
