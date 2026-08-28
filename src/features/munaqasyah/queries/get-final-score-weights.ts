import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-role';

export interface FinalScoreWeightsData {
  tasmiWeight: number;
  munaqasyahWeight: number;
}

export async function getFinalScoreWeights(): Promise<FinalScoreWeightsData> {
  await requireSession();

  const setting = await prisma.munaqasyahFinalScoreWeightSetting.findUniqueOrThrow({
    where: { id: 'singleton' },
  });

  return { tasmiWeight: setting.tasmiWeight, munaqasyahWeight: setting.munaqasyahWeight };
}
