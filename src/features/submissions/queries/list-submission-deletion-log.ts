import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface SubmissionDeletionLogData {
  id: string;
  studentName: string;
  teacherName: string;
  groupName: string;
  classroomName: string;
  submissionDate: Date;
  submissionType: string;
  detail: string;
  note: string | null;
  deletedByName: string;
  deletedAt: Date;
}

export async function listSubmissionDeletionLog(): Promise<SubmissionDeletionLogData[]> {
  await requireRoleOrThrow(['coordinator']);

  const logs = await prisma.submissionDeletionLog.findMany({ orderBy: { deletedAt: 'desc' } });

  return logs.map((log) => ({
    id: log.id,
    studentName: log.studentName,
    teacherName: log.teacherName,
    groupName: log.groupName,
    classroomName: log.classroomName,
    submissionDate: log.submissionDate,
    submissionType: log.submissionType,
    detail: log.detail,
    note: log.note,
    deletedByName: log.deletedByName,
    deletedAt: log.deletedAt,
  }));
}
