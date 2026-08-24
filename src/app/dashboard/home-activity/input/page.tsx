import { requireRole } from '@/lib/require-role';
import { HomeActivityForm } from '@/features/home-activities/components/home-activity-form';
import { getMyGroup } from '@/features/home-activities/queries/get-my-group';
import { listSurahOptions, listJuzOptions } from '@/features/quran-reference/queries/list-reference-options';

export default async function HomeActivityInputPage() {
  await requireRole(['student']);

  const [myGroup, surahOptions, juzOptions] = await Promise.all([
    getMyGroup(),
    listSurahOptions(),
    listJuzOptions(),
  ]);

  if (!myGroup) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Input Aktivitas Rumah</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Anda belum tergabung dalam kelompok. Hubungi koordinator untuk ditempatkan ke kelompok
          terlebih dahulu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Input Aktivitas Rumah</h1>
        <p className="text-muted-foreground text-sm">Catat murajaah/tilawah/tarjamah mandiri</p>
      </div>

      <HomeActivityForm groupName={myGroup.groupName} surahOptions={surahOptions} juzOptions={juzOptions} />
    </div>
  );
}
