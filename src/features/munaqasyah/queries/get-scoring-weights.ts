import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-role';
import type { ScoringWeights } from '../munaqasyah-scoring';
import type { MunaqasyahJenisUjian } from '@/lib/generated/prisma/enums';

export async function getScoringWeights(jenis: MunaqasyahJenisUjian): Promise<ScoringWeights> {
  await requireSession();

  const setting = await prisma.munaqasyahScoringSetting.findUniqueOrThrow({ where: { jenis } });

  return {
    khofiAwalAyatWeight: setting.khofiAwalAyatWeight,
    khofiMakhrojWeight: setting.khofiMakhrojWeight,
    khofiTajwidMadWeight: setting.khofiTajwidMadWeight,
    jaliBarisWeight: setting.jaliBarisWeight,
    jaliLebihSatuKalimatWeight: setting.jaliLebihSatuKalimatWeight,
  };
}

export async function getAllScoringWeights(): Promise<Record<MunaqasyahJenisUjian, ScoringWeights>> {
  await requireSession();

  const settings = await prisma.munaqasyahScoringSetting.findMany();

  return Object.fromEntries(
    settings.map((s) => [
      s.jenis,
      {
        khofiAwalAyatWeight: s.khofiAwalAyatWeight,
        khofiMakhrojWeight: s.khofiMakhrojWeight,
        khofiTajwidMadWeight: s.khofiTajwidMadWeight,
        jaliBarisWeight: s.jaliBarisWeight,
        jaliLebihSatuKalimatWeight: s.jaliLebihSatuKalimatWeight,
      },
    ]),
  ) as Record<MunaqasyahJenisUjian, ScoringWeights>;
}
