import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-role';
import type { ReportTemplateType } from '@/lib/generated/prisma/enums';

export async function getReportTemplates(): Promise<Record<ReportTemplateType, string>> {
  await requireSession();

  const templates = await prisma.reportDescriptionTemplate.findMany();

  return Object.fromEntries(templates.map((t) => [t.type, t.template])) as Record<ReportTemplateType, string>;
}
