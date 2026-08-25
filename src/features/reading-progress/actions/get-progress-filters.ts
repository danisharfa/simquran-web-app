'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface PeriodOption {
  value: string;
  label: string;
  academicYear: string;
  semester: string;
}

export interface GroupFilterOption {
  id: string;
  label: string;
  period: string;
}

export interface ProgressFilterData {
  periods: PeriodOption[];
  groups: GroupFilterOption[];
  defaultPeriod: string;
}

const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

export async function getProgressFilters(): Promise<ProgressFilterData> {
  const session = await requireRoleOrThrow(['coordinator', 'teacher']);
  const role = session.user.role.toLowerCase();
  const teacherId = role === 'teacher' ? session.user.id : null;

  const [classrooms, groupHistories, academicSetting] = await Promise.all([
    prisma.classroom.findMany({
      include: { groups: teacherId ? { where: { teacherId } } : true },
    }),
    prisma.groupHistory.findMany({
      distinct: ['academicYear', 'semester', 'groupId'],
      include: { group: { include: { classroom: true } } },
      where: teacherId ? { group: { teacherId } } : undefined,
    }),
    prisma.academicSetting.findFirst(),
  ]);

  const periodsMap = new Map<string, PeriodOption>();
  const groupsMap = new Map<string, GroupFilterOption>();

  for (const classroom of classrooms) {
    const periodKey = `${classroom.academicYear}|${classroom.semester}`;
    periodsMap.set(periodKey, {
      value: periodKey,
      label: `${classroom.academicYear} ${SEMESTER_LABEL[classroom.semester]}`,
      academicYear: classroom.academicYear,
      semester: classroom.semester,
    });

    for (const group of classroom.groups) {
      groupsMap.set(`${group.id}-${periodKey}`, {
        id: group.id,
        label: `${group.name} - ${classroom.name}`,
        period: periodKey,
      });
    }
  }

  for (const gh of groupHistories) {
    const periodKey = `${gh.academicYear}|${gh.semester}`;
    periodsMap.set(periodKey, {
      value: periodKey,
      label: `${gh.academicYear} ${SEMESTER_LABEL[gh.semester]}`,
      academicYear: gh.academicYear,
      semester: gh.semester,
    });
    groupsMap.set(`${gh.group.id}-${periodKey}`, {
      id: gh.group.id,
      label: `${gh.group.name} - ${gh.group.classroom.name}`,
      period: periodKey,
    });
  }

  const periods = Array.from(periodsMap.values()).sort((a, b) => {
    if (a.academicYear !== b.academicYear) return b.academicYear.localeCompare(a.academicYear);
    return a.semester === 'GANJIL' ? -1 : 1;
  });

  const defaultPeriod = academicSetting
    ? `${academicSetting.currentYear}|${academicSetting.currentSemester}`
    : (periods[0]?.value ?? '');

  return { periods, groups: Array.from(groupsMap.values()), defaultPeriod };
}
