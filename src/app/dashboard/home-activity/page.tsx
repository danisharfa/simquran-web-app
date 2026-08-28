import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { HomeActivityTable } from '@/features/home-activities/components/home-activity-table';
import { HomeActivityCreateDialog } from '@/features/home-activities/components/home-activity-create-dialog';
import { listAllHomeActivities } from '@/features/home-activities/queries/list-all-home-activities';
import { listGroupHomeActivities } from '@/features/home-activities/queries/list-group-home-activities';
import { listOwnHomeActivities } from '@/features/home-activities/queries/list-own-home-activities';
import { getMyGroup } from '@/features/home-activities/queries/get-my-group';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';
import {
  listSurahOptions,
  listJuzOptions,
  listSurahJuzMap,
} from '@/features/quran-reference/queries/list-reference-options';

export default async function HomeActivityPage() {
  const session = await requireRole(['teacher', 'coordinator', 'student']);
  const role = session.user.role.toLowerCase();
  const academicSetting = await getAcademicSetting();
  const currentPeriod = academicSetting ? `${academicSetting.currentYear}|${academicSetting.currentSemester}` : undefined;
  const schoolInfo = academicSetting
    ? { schoolName: academicSetting.schoolName, schoolAddress: academicSetting.schoolAddress }
    : { schoolName: '-', schoolAddress: null };
  const exportedBy = { name: session.user.name, role: session.user.role };

  if (role === 'student') {
    const [myGroup, activities, surahOptions, juzOptions, surahJuzMap] = await Promise.all([
      getMyGroup(),
      listOwnHomeActivities(),
      listSurahOptions(),
      listJuzOptions(),
      listSurahJuzMap(),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Aktivitas Rumah"
          description="Catat murajaah/tilawah/tarjamah mandiri"
          action={
            myGroup ? (
              <HomeActivityCreateDialog
                groupName={myGroup.groupName}
                surahOptions={surahOptions}
                juzOptions={juzOptions}
                surahJuzMap={surahJuzMap}
              />
            ) : undefined
          }
        />

        {!myGroup && (
          <p className="text-muted-foreground text-sm">
            Anda belum tergabung dalam kelompok. Hubungi koordinator untuk ditempatkan ke kelompok terlebih dahulu.
          </p>
        )}

        <HomeActivityTable
          data={activities}
          editable
          own
          surahOptions={surahOptions}
          juzOptions={juzOptions}
          surahJuzMap={surahJuzMap}
          currentPeriod={currentPeriod}
          schoolInfo={schoolInfo}
          exportedBy={exportedBy}
        />
      </div>
    );
  }

  const activities = role === 'teacher' ? await listGroupHomeActivities() : await listAllHomeActivities();

  return (
    <div className="space-y-6">
      <PageHeader title="Aktivitas Rumah Siswa" description="Pantau aktivitas murajaah/tilawah/tarjamah siswa" />

      <HomeActivityTable
        data={activities}
        canReview={role === 'teacher'}
        showClassroom={role === 'coordinator'}
        currentPeriod={currentPeriod}
        schoolInfo={schoolInfo}
        exportedBy={exportedBy}
      />
    </div>
  );
}
