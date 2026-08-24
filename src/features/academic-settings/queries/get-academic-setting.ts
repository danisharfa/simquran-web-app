import { prisma } from '@/lib/prisma';

export async function getAcademicSetting() {
  return prisma.academicSetting.findFirst();
}

export type AcademicSettingData = Awaited<ReturnType<typeof getAcademicSetting>>;
