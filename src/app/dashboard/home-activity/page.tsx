import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { HomeActivityTable } from '@/features/home-activities/components/home-activity-table';
import { HomeActivityCreateDialog } from '@/features/home-activities/components/home-activity-create-dialog';
import { listAllHomeActivities } from '@/features/home-activities/queries/list-all-home-activities';
import { listGroupHomeActivities } from '@/features/home-activities/queries/list-group-home-activities';
import { listOwnHomeActivities } from '@/features/home-activities/queries/list-own-home-activities';
import { getMyGroup } from '@/features/home-activities/queries/get-my-group';
import {
  listSurahOptions,
  listJuzOptions,
  listSurahJuzMap,
} from '@/features/quran-reference/queries/list-reference-options';

export default async function HomeActivityPage() {
  const session = await requireRole(['teacher', 'coordinator', 'student']);
  const role = session.user.role.toLowerCase();

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
          surahOptions={surahOptions}
          juzOptions={juzOptions}
          surahJuzMap={surahJuzMap}
        />
      </div>
    );
  }

  const activities = role === 'teacher' ? await listGroupHomeActivities() : await listAllHomeActivities();

  return (
    <div className="space-y-6">
      <PageHeader title="Aktivitas Rumah Siswa" description="Pantau aktivitas murajaah/tilawah/tarjamah siswa" />

      <HomeActivityTable data={activities} showFilters />
    </div>
  );
}
