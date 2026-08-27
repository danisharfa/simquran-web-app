import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

export interface GroupWithStudents {
  id: string;
  name: string;
  classroomName: string;
  students: { userId: string; name: string; nis: string }[];
}

export async function listMyGroupsWithStudents(): Promise<GroupWithStudents[]> {
  const session = await requireRoleOrThrow(['teacher']);
  const setting = await getAcademicSetting();

  const groups = await prisma.group.findMany({
    where: {
      isActive: true,
      teacherId: session.user.id,
      ...(setting && { classroom: { academicYear: setting.currentYear, semester: setting.currentSemester } }),
    },
    include: {
      classroom: true,
      students: { include: { user: true }, orderBy: { user: { name: 'asc' } } },
    },
    orderBy: { name: 'asc' },
  });

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    classroomName: `${group.classroom.level} ${group.classroom.name}`,
    students: group.students.map((student) => ({
      userId: student.userId,
      name: student.user.name,
      nis: student.nis,
    })),
  }));
}
