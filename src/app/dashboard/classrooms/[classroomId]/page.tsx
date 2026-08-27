import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { getClassroom } from '@/features/classrooms/queries/get-classroom';
import { listClassroomStudents } from '@/features/classrooms/queries/list-classroom-students';
import { listUnassignedStudents } from '@/features/classrooms/queries/list-unassigned-students';
import { AddStudentToClassroomForm } from '@/features/classrooms/components/add-student-to-classroom-form';
import { ClassroomStudentTable } from '@/features/classrooms/components/classroom-student-table';
import { PromoteClassroomDialog } from '@/features/classrooms/components/promote-classroom-dialog';
import { EditClassroomNameDialog } from '@/features/classrooms/components/edit-classroom-name-dialog';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

const SEMESTER_LABEL: Record<'GANJIL' | 'GENAP', string> = {
  GANJIL: 'Ganjil',
  GENAP: 'Genap',
};

interface Props {
  params: Promise<{ classroomId: string }>;
}

export default async function ClassroomDetailPage({ params }: Props) {
  await requireRole(['admin']);
  const { classroomId } = await params;

  const [classroom, classroomStudents, unassignedStudents, academicSetting] = await Promise.all([
    getClassroom(classroomId),
    listClassroomStudents(classroomId),
    listUnassignedStudents(),
    getAcademicSetting(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Kelas ${classroom.level} ${classroom.name}`}
        description={`${classroom.academicYear} · Semester ${SEMESTER_LABEL[classroom.semester]}`}
        backHref="/dashboard/classrooms"
        action={
          <div className="flex items-center gap-2">
            {classroom.isActive && (
              <EditClassroomNameDialog classroomId={classroomId} currentName={classroom.name} />
            )}
            <PromoteClassroomDialog
              classroomId={classroomId}
              isGraduating={classroom.level >= 6}
              students={classroomStudents}
              defaultAcademicYear={academicSetting?.currentYear}
              defaultSemester={academicSetting?.currentSemester}
            />
            <AddStudentToClassroomForm classroomId={classroomId} students={unassignedStudents} />
          </div>
        }
      />

      <ClassroomStudentTable classroomId={classroomId} data={classroomStudents} />
    </div>
  );
}
