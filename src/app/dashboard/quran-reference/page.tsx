import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  await requireRole(['superadmin', 'admin']);

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

      <Tabs defaultValue="surah">
        <TabsList>
          <TabsTrigger value="surah">Surah</TabsTrigger>
          <TabsTrigger value="juz">Juz</TabsTrigger>
          <TabsTrigger value="surah-juz">Surah-Juz</TabsTrigger>
          <TabsTrigger value="wafa">Wafa</TabsTrigger>
        </TabsList>
        <TabsContent value="surah">
          <SurahTable data={surah} />
        </TabsContent>
        <TabsContent value="juz">
          <JuzTable data={juz} />
        </TabsContent>
        <TabsContent value="surah-juz">
          <SurahJuzTable data={surahJuz} />
        </TabsContent>
        <TabsContent value="wafa">
          <WafaTable data={wafa} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
