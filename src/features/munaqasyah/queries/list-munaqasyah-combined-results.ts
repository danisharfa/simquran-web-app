import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { Prisma } from '@/lib/generated/prisma/client';
import type { MunaqasyahGrade, MunaqasyahTahap } from '@/lib/generated/prisma/enums';

export interface MunaqasyahCombinedResultData {
  key: string;
  studentId: string;
  nis: string;
  studentName: string;
  groupId: string;
  groupName: string;
  classroomId: string;
  classroomName: string;
  academicYear: string;
  semester: string;
  juzId: number;
  juzName: string;
  tahap: MunaqasyahTahap;
  tasmi: { resultId: string; totalScore: number; grade: MunaqasyahGrade } | null;
  munaqasyah: { resultId: string; totalScore: number; grade: MunaqasyahGrade } | null;
  lastActivityDate: Date;
  finalScore: number | null;
  finalGrade: MunaqasyahGrade | null;
  passed: boolean | null;
}

async function buildCombinedResults(resultWhere: Prisma.MunaqasyahResultWhereInput) {
  const [results, finals] = await Promise.all([
    prisma.munaqasyahResult.findMany({
      where: resultWhere,
      include: {
        request: { include: { student: { include: { user: true } }, juz: true, group: { include: { classroom: true } } } },
        schedule: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.munaqasyahFinalResult.findMany(),
  ]);

  const finalByKey = new Map(finals.map((f) => [`${f.studentId}|${f.juzId}|${f.tahap}`, f]));
  const map = new Map<string, MunaqasyahCombinedResultData>();

  for (const r of results) {
    const req = r.request;
    const key = `${req.studentId}|${req.juzId}|${req.tahap}`;

    let row = map.get(key);
    if (!row) {
      const final = finalByKey.get(key);
      row = {
        key,
        studentId: req.studentId,
        nis: req.student.nis,
        studentName: req.student.user.name,
        groupId: req.groupId,
        groupName: req.group.name,
        classroomId: req.group.classroomId,
        classroomName: `${req.group.classroom.level} ${req.group.classroom.name}`,
        academicYear: req.group.classroom.academicYear,
        semester: req.group.classroom.semester,
        juzId: req.juzId,
        juzName: req.juz.name,
        tahap: req.tahap,
        tasmi: null,
        munaqasyah: null,
        lastActivityDate: r.schedule.date,
        finalScore: final?.finalScore ?? null,
        finalGrade: final?.finalGrade ?? null,
        passed: final?.passed ?? null,
      };
      map.set(key, row);
    }

    const detail = { resultId: r.id, totalScore: r.totalScore, grade: r.grade };
    if (req.jenis === 'TASMI') row.tasmi = detail;
    else row.munaqasyah = detail;

    if (r.schedule.date > row.lastActivityDate) row.lastActivityDate = r.schedule.date;
  }

  return Array.from(map.values());
}

export async function listAllMunaqasyahCombinedResults(): Promise<MunaqasyahCombinedResultData[]> {
  await requireRoleOrThrow(['coordinator']);

  return buildCombinedResults({});
}

export async function listMyMunaqasyahCombinedResults(): Promise<MunaqasyahCombinedResultData[]> {
  const session = await requireRoleOrThrow(['teacher']);

  return buildCombinedResults({
    OR: [{ request: { teacherId: session.user.id } }, { schedule: { examinerId: session.user.id } }],
  });
}

export async function listOwnMunaqasyahCombinedResults(): Promise<MunaqasyahCombinedResultData[]> {
  const session = await requireRoleOrThrow(['student']);

  return buildCombinedResults({ request: { studentId: session.user.id } });
}
