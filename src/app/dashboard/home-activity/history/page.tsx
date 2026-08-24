import { requireRole } from '@/lib/require-role';
import { HomeActivityTable } from '@/features/home-activities/components/home-activity-table';
import { listOwnHomeActivities } from '@/features/home-activities/queries/list-own-home-activities';
import { listSurahOptions, listJuzOptions } from '@/features/quran-reference/queries/list-reference-options';

export default async function HomeActivityHistoryPage() {
  await requireRole(['student']);

  const [activities, surahOptions, juzOptions] = await Promise.all([
    listOwnHomeActivities(),
    listSurahOptions(),
    listJuzOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Aktivitas Rumah</h1>
        <p className="text-muted-foreground text-sm">Aktivitas rumah yang pernah Anda catat</p>
      </div>

      <HomeActivityTable data={activities} editable surahOptions={surahOptions} juzOptions={juzOptions} />
    </div>
  );
}
