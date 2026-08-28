import { randomUUID } from 'node:crypto';

import type { Semester } from '@/lib/generated/prisma/enums';
import type { prisma } from '@/lib/prisma';

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

interface RecordGroupHistoryParams {
  tx: TransactionClient;
  studentId: string;
  groupId: string;
  academicYear: string;
  semester: Semester;
}

/** Mencatat GroupHistory untuk kelompok yang sedang/pernah disinggahi siswa di suatu periode. */
export async function recordGroupHistory({
  tx,
  studentId,
  groupId,
  academicYear,
  semester,
}: RecordGroupHistoryParams) {
  await tx.groupHistory.upsert({
    where: {
      studentId_groupId_academicYear_semester: { studentId, groupId, academicYear, semester },
    },
    create: {
      id: randomUUID(),
      studentId,
      groupId,
      academicYear,
      semester,
    },
    update: {},
  });
}

interface RecordClassroomHistoryParams {
  tx: TransactionClient;
  studentId: string;
  classroomId: string;
  academicYear: string;
  semester: Semester;
}

/** Mencatat ClassroomHistory untuk kelas yang sedang/pernah disinggahi siswa di suatu periode. */
export async function recordClassroomHistory({
  tx,
  studentId,
  classroomId,
  academicYear,
  semester,
}: RecordClassroomHistoryParams) {
  await tx.classroomHistory.upsert({
    where: {
      studentId_classroomId_academicYear_semester: { studentId, classroomId, academicYear, semester },
    },
    create: {
      id: randomUUID(),
      studentId,
      classroomId,
      academicYear,
      semester,
    },
    update: {},
  });
}

interface RecordClassroomExitHistoryParams {
  tx: TransactionClient;
  studentId: string;
  classroomId: string;
  groupId: string | null;
  academicYear: string;
  semester: Semester;
}

/** Mencatat ClassroomHistory & GroupHistory sebelum siswa dilepas dari kelas/kelompoknya. */
export async function recordClassroomExitHistory({
  tx,
  studentId,
  classroomId,
  groupId,
  academicYear,
  semester,
}: RecordClassroomExitHistoryParams) {
  await recordClassroomHistory({ tx, studentId, classroomId, academicYear, semester });

  if (groupId) {
    await recordGroupHistory({ tx, studentId, groupId, academicYear, semester });
  }
}
