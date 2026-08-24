import { requireRole } from '@/lib/require-role';
import { BackButton } from '@/components/ui/back-button';
import { getGroup } from '@/features/groups/queries/get-group';
import { listGroupStudents } from '@/features/groups/queries/list-group-students';
import { listClassroomStudentsWithoutGroup } from '@/features/groups/queries/list-classroom-students-without-group';
import { AddStudentToGroupForm } from '@/features/groups/components/add-student-to-group-form';
import { GroupStudentTable } from '@/features/groups/components/group-student-table';
import { PromoteGroupDialog } from '@/features/groups/components/promote-group-dialog';

interface Props {
  params: Promise<{ groupId: string }>;
}

export default async function GroupDetailPage({ params }: Props) {
  const session = await requireRole(['coordinator', 'teacher']);
  const role = session.user.role.toLowerCase();
  const { groupId } = await params;

  const group = await getGroup(groupId);

  if (role === 'teacher') {
    const students = await listGroupStudents(groupId);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard/group" />
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground text-sm">Kelas {group.classroomName}</p>
          </div>
        </div>

        <GroupStudentTable groupId={groupId} data={students} readOnly showScoreLink showReportLink />
      </div>
    );
  }

  const [students, availableStudents] = await Promise.all([
    listGroupStudents(groupId),
    listClassroomStudentsWithoutGroup(group.classroomId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard/group" />
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground text-sm">
              Kelas {group.classroomName} &middot; Dibimbing {group.teacherName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PromoteGroupDialog groupId={groupId} />
          <AddStudentToGroupForm groupId={groupId} students={availableStudents} />
        </div>
      </div>

      <GroupStudentTable groupId={groupId} data={students} showReportLink />
    </div>
  );
}
