import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
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
        <PageHeader
          title="Input Aktivitas Rumah"
          description="Anda belum tergabung dalam kelompok. Hubungi koordinator untuk ditempatkan ke kelompok terlebih dahulu."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Input Aktivitas Rumah" description="Catat murajaah/tilawah/tarjamah mandiri" />

      <HomeActivityForm groupName={myGroup.groupName} surahOptions={surahOptions} juzOptions={juzOptions} />
    </div>
  );
}
