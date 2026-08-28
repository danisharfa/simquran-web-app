import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { TashihRequestCreateDialog } from '@/features/tashih/components/tashih-request-create-dialog';
import { TashihRequestTable } from '@/features/tashih/components/tashih-request-table';
import { listMyTashihRequests } from '@/features/tashih/queries/list-my-tashih-requests';
import { listMyGroupsWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import {
  listSurahOptions,
  listJuzOptions,
  listSurahJuzMap,
  listWafaOptions,
} from '@/features/quran-reference/queries/list-reference-options';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

export default async function TashihRequestPage() {
  await requireRole(['teacher']);

  const [requests, groups, surahOptions, juzOptions, surahJuzMap, wafaOptions, academicSetting] = await Promise.all([
    listMyTashihRequests(),
    listMyGroupsWithStudents(),
    listSurahOptions(),
    listJuzOptions(),
    listSurahJuzMap(),
    listWafaOptions(),
    getAcademicSetting(),
  ]);
  const currentPeriod = academicSetting ? `${academicSetting.currentYear}|${academicSetting.currentSemester}` : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pendaftaran Tashih"
        description="Ajukan tashih untuk siswa bimbingan Anda"
        action={
          <TashihRequestCreateDialog
            groups={groups}
            surahOptions={surahOptions}
            juzOptions={juzOptions}
            surahJuzMap={surahJuzMap}
            wafaOptions={wafaOptions}
          />
        }
      />

      <TashihRequestTable
        data={requests}
        editable
        groups={groups}
        surahOptions={surahOptions}
        juzOptions={juzOptions}
        surahJuzMap={surahJuzMap}
        wafaOptions={wafaOptions}
        currentPeriod={currentPeriod}
      />
    </div>
  );
}
