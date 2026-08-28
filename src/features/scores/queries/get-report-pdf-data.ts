import { prisma } from '@/lib/prisma';
import { assertReportAccess } from '../assert-report-access';
import { getPeriodGroupIds } from './get-period-group-ids';
import type { Semester } from '@/lib/generated/prisma/enums';

export interface ReportPdfData {
  fullName: string;
  nis: string;
  nisn: string | null;
  address: string | null;
  className: string;
  academicYear: string;
  semester: Semester;
  teacherName: string;
  coordinatorName: string;
  schoolInfo: {
    schoolName: string;
    currentPrincipalName: string;
  };
  tahsin: { topic: string; score: number; grade: string; description: string | null }[];
  tahfidz: { surahName: string; score: number; grade: string; description: string | null }[];
  report: {
    tahfidzScore: number | null;
    tahsinScore: number | null;
    lastTahsinMaterial: string | null;
  };
}

export async function getReportPdfData(studentId: string, groupId: string): Promise<ReportPdfData> {
  await assertReportAccess(studentId, groupId);

  const entryGroup = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    include: { classroom: true },
  });
  const { academicYear, semester } = entryGroup.classroom;

  const { allGroupIds, currentGroupId } = await getPeriodGroupIds(studentId, academicYear, semester);
  const groupIds = Array.from(new Set([...allGroupIds, groupId]));

  const displayGroupId = currentGroupId ?? groupId;

  const [student, displayGroup, coordinator, schoolInfo, report, tahfidzScores, tahsinScores] = await Promise.all([
    prisma.studentProfile.findUniqueOrThrow({
      where: { userId: studentId },
      include: { user: true, classroom: true },
    }),
    prisma.group.findUniqueOrThrow({
      where: { id: displayGroupId },
      include: { teacher: { include: { user: true } }, classroom: true },
    }),
    prisma.coordinatorProfile.findFirst({ include: { user: true } }),
    prisma.academicSetting.findFirst(),
    prisma.report.findUnique({
      where: { studentId_academicYear_semester: { studentId, academicYear, semester } },
    }),
    prisma.tahfidzScore.findMany({
      where: { studentId, groupId: { in: groupIds } },
      include: { surah: true },
      orderBy: { surah: { id: 'asc' } },
    }),
    prisma.tahsinScore.findMany({
      where: { studentId, groupId: { in: groupIds } },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  return {
    fullName: student.user.name,
    nis: student.nis,
    nisn: student.nisn,
    address: student.user.address,
    className: student.classroom ? `${student.classroom.level} ${student.classroom.name}` : '-',
    academicYear: report?.academicYear ?? academicYear,
    semester: report?.semester ?? semester,
    teacherName: displayGroup.teacher.user.name,
    coordinatorName: coordinator?.user.name ?? '-',
    schoolInfo: {
      schoolName: schoolInfo?.schoolName ?? '-',
      currentPrincipalName: schoolInfo?.currentPrincipalName ?? '-',
    },
    tahsin: tahsinScores.map((s) => ({
      topic: s.topic,
      score: s.score,
      grade: s.grade,
      description: s.description,
    })),
    tahfidz: tahfidzScores.map((s) => ({
      surahName: s.surah.name,
      score: s.score,
      grade: s.grade,
      description: s.description,
    })),
    report: {
      tahfidzScore: report?.tahfidzScore ?? null,
      tahsinScore: report?.tahsinScore ?? null,
      lastTahsinMaterial: report?.lastTahsinMaterial ?? null,
    },
  };
}
