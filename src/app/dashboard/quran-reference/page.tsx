import { requireRole } from '@/lib/require-role';
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
      <div>
        <h1 className="text-2xl font-bold">Data Referensi Qur&apos;an</h1>
        <p className="text-muted-foreground text-sm">
          Data surah, juz, pemetaan surah-juz, dan Wafa (hanya lihat)
        </p>
      </div>

      <SurahTable data={surah} />
      <JuzTable data={juz} />
      <SurahJuzTable data={surahJuz} />
      <WafaTable data={wafa} />
    </div>
  );
}
