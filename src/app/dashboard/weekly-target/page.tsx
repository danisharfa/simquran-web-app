import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { WeeklyTargetTable } from '@/features/weekly-targets/components/weekly-target-table';
import { WeeklyTargetCreateDialog } from '@/features/weekly-targets/components/weekly-target-create-dialog';
import { listOwnWeeklyTargets } from '@/features/weekly-targets/queries/list-own-weekly-targets';
import { listMyWeeklyTargets } from '@/features/weekly-targets/queries/list-my-weekly-targets';
import { listMyGroupsWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';
import {
  listSurahOptions,
  listJuzOptions,
  listSurahJuzMap,
  listWafaOptions,
} from '@/features/quran-reference/queries/list-reference-options';

export default async function WeeklyTargetPage() {
  const session = await requireRole(['teacher', 'student']);
  const role = session.user.role.toLowerCase();
  const academicSetting = await getAcademicSetting();
  const currentPeriod = academicSetting ? `${academicSetting.currentYear}|${academicSetting.currentSemester}` : undefined;
  const schoolInfo = academicSetting
    ? { schoolName: academicSetting.schoolName, schoolAddress: academicSetting.schoolAddress }
    : { schoolName: '-', schoolAddress: null };
  const exportedBy = { name: session.user.name, role: session.user.role };

  if (role === 'teacher') {
    const [targets, groups, surahOptions, juzOptions, surahJuzMap, wafaOptions] = await Promise.all([
      listMyWeeklyTargets(),
      listMyGroupsWithStudents(),
      listSurahOptions(),
      listJuzOptions(),
      listSurahJuzMap(),
      listWafaOptions(),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Target Setoran"
          description="Kelola target hafalan/bacaan mingguan siswa bimbingan Anda"
          action={
            <WeeklyTargetCreateDialog
              groups={groups}
              surahOptions={surahOptions}
              juzOptions={juzOptions}
              surahJuzMap={surahJuzMap}
              wafaOptions={wafaOptions}
            />
          }
        />

        <WeeklyTargetTable
          data={targets}
          editable
          surahOptions={surahOptions}
          juzOptions={juzOptions}
          surahJuzMap={surahJuzMap}
          wafaOptions={wafaOptions}
          currentPeriod={currentPeriod}
          schoolInfo={schoolInfo}
          exportedBy={exportedBy}
        />
      </div>
    );
  }

  const targets = await listOwnWeeklyTargets();

  return (
    <div className="space-y-6">
      <PageHeader title="Target Setoran" description="Target hafalan/bacaan mingguan Anda" />

      <WeeklyTargetTable
        data={targets}
        own
        currentPeriod={currentPeriod}
        schoolInfo={schoolInfo}
        exportedBy={exportedBy}
      />
    </div>
  );
}
