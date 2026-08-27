import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatSubmissionDetail } from '../format-submission-detail';

export interface SubmissionTableData {
  id: string;
  date: Date;
  studentName: string;
  groupId: string;
  groupName: string;
  classroomId: string;
  classroomName: string;
  academicYear: string;
  semester: string;
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
    include: {
      student: { include: { user: true } },
      group: { include: { classroom: true } },
      surah: true,
      wafa: true,
    },
    orderBy: { date: 'desc' },
  });

  return submissions.map((s) => ({
    id: s.id,
    date: s.date,
    studentName: s.student.user.name,
    groupId: s.groupId,
    groupName: s.group.name,
    classroomId: s.group.classroomId,
    classroomName: `${s.group.classroom.level} ${s.group.classroom.name}`,
    academicYear: s.group.classroom.academicYear,
    semester: s.group.classroom.semester,
    submissionType: s.submissionType,
    detail: formatSubmissionDetail(s),
    adab: s.adab,
    submissionStatus: s.submissionStatus,
    note: s.note,
  }));
}
