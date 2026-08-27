import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { getGroup } from '@/features/groups/queries/get-group';
import { listGroupStudents } from '@/features/groups/queries/list-group-students';
import { listClassroomStudentsWithoutGroup } from '@/features/groups/queries/list-classroom-students-without-group';
import { AddStudentToGroupForm } from '@/features/groups/components/add-student-to-group-form';
import { GroupStudentTable } from '@/features/groups/components/group-student-table';
import { PromoteGroupDialog } from '@/features/groups/components/promote-group-dialog';
import { EditGroupNameDialog } from '@/features/groups/components/edit-group-name-dialog';

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
        <PageHeader
          title={group.name}
          description={`Kelas ${group.classroomName}`}
          backHref="/dashboard/group"
        />

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
      <PageHeader
        title={group.name}
        description={`Kelas ${group.classroomName} · Dibimbing ${group.teacherName}`}
        backHref="/dashboard/group"
        action={
          <div className="flex items-center gap-2">
            {group.isActive && (
              <EditGroupNameDialog groupId={groupId} currentName={group.name} />
            )}
            <PromoteGroupDialog groupId={groupId} />
            <AddStudentToGroupForm groupId={groupId} students={availableStudents} />
          </div>
        }
      />

      <GroupStudentTable groupId={groupId} data={students} showReportLink />
    </div>
  );
}
