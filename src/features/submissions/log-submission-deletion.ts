import { prisma } from '@/lib/prisma';
import type { SubmissionType } from '@/lib/generated/prisma/enums';
import { formatSubmissionDetail } from './format-submission-detail';

interface SubmissionForLog {
  date: Date;
  submissionType: SubmissionType;
  note: string | null;
  surah: { name: string } | null;
  wafa: { name: string } | null;
  startVerse: number | null;
  endVerse: number | null;
  startPage: number | null;
  endPage: number | null;
  student: { user: { name: string } };
  group: { name: string; classroom: { level: number; name: string } };
}

export async function logSubmissionDeletion(submission: SubmissionForLog, deletedByName: string): Promise<void> {
  await prisma.submissionDeletionLog.create({
    data: {
      studentName: submission.student.user.name,
      teacherName: deletedByName,
      groupName: submission.group.name,
      classroomName: `${submission.group.classroom.level} ${submission.group.classroom.name}`,
      submissionDate: submission.date,
      submissionType: submission.submissionType,
      detail: formatSubmissionDetail(submission),
      note: submission.note,
      deletedByName,
    },
  });
}
