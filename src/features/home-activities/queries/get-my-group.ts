import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface MyGroup {
  groupId: string;
  groupName: string;
}

export async function getMyGroup(): Promise<MyGroup | null> {
  const session = await requireRoleOrThrow(['student']);

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { group: true },
  });

  if (!student?.group) return null;

  return { groupId: student.group.id, groupName: student.group.name };
}
