import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { getGroup } from '@/features/groups/queries/get-group';
import { listGroupStudents } from '@/features/groups/queries/list-group-students';
import { listGroupHistoryStudents } from '@/features/groups/queries/list-group-history-students';
import { listClassroomStudentsWithoutGroup } from '@/features/groups/queries/list-classroom-students-without-group';
import { AddStudentToGroupForm } from '@/features/groups/components/add-student-to-group-form';
import { GroupStudentTable } from '@/features/groups/components/group-student-table';
import { EditGroupNameDialog } from '@/features/groups/components/edit-group-name-dialog';

interface Props {
  params: Promise<{ groupId: string }>;
}

export default async function GroupDetailPage({ params }: Props) {
  const session = await requireRole(['coordinator', 'teacher']);
  const role = session.user.role.toLowerCase();
  const { groupId } = await params;

  const group = await getGroup(groupId);
  // kelompok nonaktif tidak lagi menautkan siswa via groupId, siswanya diambil dari riwayat
  const students = group.isActive
    ? await listGroupStudents(groupId)
    : await listGroupHistoryStudents(groupId);

  if (role === 'teacher') {
    return (
      <div className="space-y-6">
        <PageHeader
          title={group.name}
          description={`Kelas ${group.classroomName}`}
          backHref="/dashboard/group"
        />

        <GroupStudentTable groupId={groupId} data={students} readOnly showReportLink />
      </div>
    );
  }

  const availableStudents = group.isActive
    ? await listClassroomStudentsWithoutGroup(group.classroomId)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={group.name}
        description={`Kelas ${group.classroomName} · ${group.teacherName}`}
        backHref="/dashboard/group"
        action={
          group.isActive ? (
            <div className="flex items-center gap-2">
              <EditGroupNameDialog groupId={groupId} currentName={group.name} />
              <AddStudentToGroupForm groupId={groupId} students={availableStudents} />
            </div>
          ) : undefined
        }
      />

      <GroupStudentTable groupId={groupId} data={students} readOnly={!group.isActive} showReportLink />
    </div>
  );
}
