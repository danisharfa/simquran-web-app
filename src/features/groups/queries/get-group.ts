import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface GroupDetail {
  id: string;
  name: string;
  classroomId: string;
  classroomName: string;
  teacherId: string;
  teacherName: string;
  isActive: boolean;
}

export async function getGroup(groupId: string): Promise<GroupDetail> {
  const session = await requireRoleOrThrow(['coordinator', 'teacher']);
  const role = session.user.role.toLowerCase();

  const group = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    include: { classroom: true, teacher: { include: { user: true } } },
  });

  // guru hanya boleh melihat kelompok bimbingannya sendiri
  if (role === 'teacher' && group.teacherId !== session.user.id) {
    throw new Error('Forbidden: tidak memiliki akses ke kelompok ini');
  }

  return {
    id: group.id,
    name: group.name,
    classroomId: group.classroomId,
    classroomName: `${group.classroom.level} ${group.classroom.name}`,
    teacherId: group.teacherId,
    teacherName: group.teacher.user.name,
    isActive: group.isActive,
  };
}
