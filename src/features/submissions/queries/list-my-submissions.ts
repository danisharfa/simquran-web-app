import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatSubmissionDetail } from '../format-submission-detail';

export interface SubmissionTableData {
  id: string;
  date: Date;
  studentName: string;
  groupName: string;
  submissionType: string;
  detail: string;
  adab: string;
  submissionStatus: string;
  note: string | null;
}

export async function listMySubmissions(): Promise<SubmissionTableData[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const submissions = await prisma.submission.findMany({
    where: { teacherId: session.user.id },
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
