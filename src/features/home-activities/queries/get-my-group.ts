import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

export interface MyGroup {
  groupId: string;
  groupName: string;
}

export async function getMyGroup(): Promise<MyGroup | null> {
  const session = await requireRoleOrThrow(['student']);
  const setting = await getAcademicSetting();

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { group: { include: { classroom: true } } },
  });

  if (!student?.group) return null;

  if (
    setting &&
    (student.group.classroom.academicYear !== setting.currentYear ||
      student.group.classroom.semester !== setting.currentSemester)
  ) {
    return null;
  }

  return { groupId: student.group.id, groupName: student.group.name };
}
