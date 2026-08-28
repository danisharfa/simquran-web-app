'use client';

import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { getKkm, type MunaqasyahGradeSettingData } from '../munaqasyah-scoring';
import type { FinalScoreWeightsData } from '../queries/get-final-score-weights';

interface Props {
  gradeSettings: MunaqasyahGradeSettingData[];
  finalScoreWeights: FinalScoreWeightsData;
}

export function MunaqasyahGradeInfoPopover({ gradeSettings, finalScoreWeights }: Props) {
  const kkm = getKkm(gradeSettings);
  const sorted = [...gradeSettings].sort((a, b) => b.minScore - a.minScore);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" aria-label="Info batas lulus dan predikat">
            <Info className="size-4" />
            Batas Lulus &amp; Predikat
          </Button>
        }
      />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Batas Lulus &amp; Predikat</PopoverTitle>
        </PopoverHeader>
        <p className="text-sm">
          Batas lulus (KKM): <span className="font-semibold">{kkm}</span>
        </p>
        <div className="divide-y rounded-md border">
          {sorted.map((s) => (
            <div key={s.grade} className="flex items-center justify-between px-2 py-1.5 text-sm">
              <span>{s.label}</span>
              <span className="text-muted-foreground">
                {s.grade === sorted[0]?.grade ? `${s.minScore}-100` : `≥ ${s.minScore}`}
              </span>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          Bobot nilai akhir: <span className="font-semibold text-foreground">{finalScoreWeights.tasmiWeight}% Tasmi</span>{' '}
          + <span className="font-semibold text-foreground">{finalScoreWeights.munaqasyahWeight}% Munaqasyah</span>
        </p>
      </PopoverContent>
    </Popover>
  );
}
