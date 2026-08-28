'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { reportTemplateSchema, type ReportTemplateSchema } from '../score.schema';
import type { ReportTemplateType } from '@/lib/generated/prisma/enums';

export async function updateReportTemplate(type: ReportTemplateType, input: ReportTemplateSchema) {
  const session = await requireRoleOrThrow(['superadmin']);

  const parsed = reportTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  await prisma.reportDescriptionTemplate.update({
    where: { type },
    data: { template: parsed.data.template, updatedBy: session.user.id },
  });

  revalidatePath('/dashboard/scoring-settings');

  return { success: true, message: 'Template nilai rapor berhasil disimpan' };
}
