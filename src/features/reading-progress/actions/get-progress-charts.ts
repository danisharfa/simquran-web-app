'use server';

import { requireRoleOrThrow } from '@/lib/require-role';
import type { Semester } from '@/lib/generated/prisma/enums';
import { getStudentsInPeriod } from '../students-in-period';
import { computeTahfidzProgress } from '../compute-tahfidz-progress';
import { computeTahsinAlquranProgress } from '../compute-tahsin-alquran-progress';
import { computeWafaProgress } from '../compute-wafa-progress';
import { aggregateForChart, type ChartBar } from '../aggregate-for-chart';

export interface ProgressChartsResult {
  studentCount: number;
  tahfidz: ChartBar[];
  tahsinAlquran: ChartBar[];
  wafa: ChartBar[];
}

export async function getProgressCharts(
  academicYear: string,
  semester: Semester,
  classroomId: string | null,
  groupId: string | null,
): Promise<ProgressChartsResult> {
  const session = await requireRoleOrThrow(['coordinator', 'teacher']);
  const role = session.user.role.toLowerCase();
  const teacherId = role === 'teacher' ? session.user.id : null;

  const students = await getStudentsInPeriod(academicYear, semester, classroomId, groupId, teacherId);

  if (students.length === 0) {
    return { studentCount: 0, tahfidz: [], tahsinAlquran: [], wafa: [] };
  }

  const [tahfidzProgress, tahsinProgress, wafaProgress] = await Promise.all([
    computeTahfidzProgress(students, academicYear, semester),
    computeTahsinAlquranProgress(students, academicYear, semester),
    computeWafaProgress(students, academicYear, semester),
  ]);

  return {
    studentCount: students.length,
    tahfidz: aggregateForChart(tahfidzProgress),
    tahsinAlquran: aggregateForChart(tahsinProgress),
    wafa: aggregateForChart(wafaProgress),
  };
}
