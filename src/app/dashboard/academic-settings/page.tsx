import { requireRole } from '@/lib/require-role';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';
import { AcademicYearForm } from '@/features/academic-settings/components/academic-year-form';
import { SchoolInfoForm } from '@/features/academic-settings/components/school-info-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function AcademicSettingPage() {
  await requireRole(['superadmin', 'admin']);
  const setting = await getAcademicSetting();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Akademik</h1>
        <p className="text-muted-foreground text-sm">Kelola tahun akademik dan informasi sekolah</p>
      </div>

      <Tabs defaultValue="academic-year" className="mx-auto w-full max-w-3xl">
        <TabsList className="mx-auto">
          <TabsTrigger value="academic-year">Tahun Akademik</TabsTrigger>
          <TabsTrigger value="school-info">Informasi Sekolah</TabsTrigger>
        </TabsList>
        <TabsContent value="academic-year">
          <AcademicYearForm setting={setting} />
        </TabsContent>
        <TabsContent value="school-info">
          <SchoolInfoForm setting={setting} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
