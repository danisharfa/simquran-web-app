'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface ReportPeriodOption {
  value: string;
  label: string;
  academicYear: string;
  semester: string;
  groupId: string;
}

export interface ReportPeriodData {
  periods: ReportPeriodOption[];
  defaultPeriod: string;
}

const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

export async function getMyReportPeriods(): Promise<ReportPeriodData> {
  const session = await requireRoleOrThrow(['student']);
  const studentId = session.user.id;

  const [student, groupHistories, academicSetting] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { userId: studentId },
      include: { group: { include: { classroom: true } } },
    }),
    // urutan kronologis: entri terakhir per periode = kelompok paling baru disinggahi
    prisma.groupHistory.findMany({ where: { studentId }, orderBy: { createdAt: 'asc' } }),
    prisma.academicSetting.findFirst(),
  ]);

  const periodsMap = new Map<string, ReportPeriodOption>();

  for (const gh of groupHistories) {
    const key = `${gh.academicYear}|${gh.semester}`;
    periodsMap.set(key, {
      value: key,
      label: `${gh.academicYear} ${SEMESTER_LABEL[gh.semester]}`,
      academicYear: gh.academicYear,
      semester: gh.semester,
      groupId: gh.groupId,
    });
  }

  // kelompok aktif saat ini selalu jadi representasi terbaru untuk periode itu
  if (student?.group) {
    const key = `${student.group.classroom.academicYear}|${student.group.classroom.semester}`;
    periodsMap.set(key, {
      value: key,
      label: `${student.group.classroom.academicYear} ${SEMESTER_LABEL[student.group.classroom.semester]}`,
      academicYear: student.group.classroom.academicYear,
      semester: student.group.classroom.semester,
      groupId: student.group.id,
    });
  }

  const periods = Array.from(periodsMap.values()).sort((a, b) => {
    if (a.academicYear !== b.academicYear) return b.academicYear.localeCompare(a.academicYear);
    return a.semester === 'GANJIL' ? -1 : 1;
  });

  const defaultKey = academicSetting
    ? `${academicSetting.currentYear}|${academicSetting.currentSemester}`
    : '';
  const defaultPeriod = periodsMap.has(defaultKey) ? defaultKey : (periods[0]?.value ?? '');

  return { periods, defaultPeriod };
}
