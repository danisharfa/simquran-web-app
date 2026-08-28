import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { TashihResultTable } from '@/features/tashih/components/tashih-result-table';
import { listMyTashihResults } from '@/features/tashih/queries/list-my-tashih-results';
import { listOwnTashihResults } from '@/features/tashih/queries/list-own-tashih-results';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

export default async function TashihResultPage() {
  const session = await requireRole(['teacher', 'student']);
  const role = session.user.role.toLowerCase();

  const [results, academicSetting] = await Promise.all([
    role === 'student' ? listOwnTashihResults() : listMyTashihResults(),
    getAcademicSetting(),
  ]);
  const currentPeriod = academicSetting ? `${academicSetting.currentYear}|${academicSetting.currentSemester}` : undefined;
  const schoolInfo = academicSetting
    ? { schoolName: academicSetting.schoolName, schoolAddress: academicSetting.schoolAddress }
    : { schoolName: '-', schoolAddress: null };
  const exportedBy = { name: session.user.name, role: session.user.role };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hasil Tashih"
        description={role === 'student' ? 'Hasil tashih Anda' : 'Hasil tashih siswa bimbingan Anda'}
      />

      <TashihResultTable
        data={results}
        own={role === 'student'}
        currentPeriod={currentPeriod}
        schoolInfo={schoolInfo}
        exportedBy={exportedBy}
      />
    </div>
  );
}
