import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import {
  listSurah,
  listJuz,
  listSurahJuz,
  listWafa,
} from '@/features/quran-reference/queries/list-quran-reference';
import {
  SurahTable,
  JuzTable,
  SurahJuzTable,
  WafaTable,
} from '@/features/quran-reference/components/quran-reference-table';

export default async function QuranReferencePage() {
  await requireRole(['superadmin']);

  const [surah, juz, surahJuz, wafa] = await Promise.all([
    listSurah(),
    listJuz(),
    listSurahJuz(),
    listWafa(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Referensi Qur&apos;an"
        description="Data surah, juz, pemetaan surah-juz, dan Wafa (hanya lihat)"
      />

      <SurahTable data={surah} />
      <JuzTable data={juz} />
      <SurahJuzTable data={surahJuz} />
      <WafaTable data={wafa} />
    </div>
  );
}
