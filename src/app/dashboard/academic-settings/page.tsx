import { requireRole } from '@/lib/require-role';
import { getAcademicSetting } from '@/features/academic-settings/actions/get-academic-setting';
import { AcademicYearForm } from '@/features/academic-settings/components/academic-year-form';
import { SchoolInfoForm } from '@/features/academic-settings/components/school-info-form';

export default async function AcademicSettingPage() {
  await requireRole(['superadmin', 'admin']);
  const setting = await getAcademicSetting();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Akademik</h1>
        <p className="text-muted-foreground text-sm">Kelola tahun akademik dan informasi sekolah</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AcademicYearForm setting={setting} />
        <SchoolInfoForm setting={setting} />
      </div>
    </div>
  );
}
