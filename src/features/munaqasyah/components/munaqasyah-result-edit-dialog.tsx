'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { TasmiAssessmentForm } from './tasmi-assessment-form';
import { MunaqasyahAssessmentForm } from './munaqasyah-assessment-form';
import { getTasmiResult, type TasmiResultEditRow } from '../actions/get-tasmi-result';
import { getMunaqasyahResult, type MunaqasyahResultEditRow } from '../actions/get-munaqasyah-result';
import type { ScoringWeights, MunaqasyahGradeSettingData } from '../munaqasyah-scoring';
import type { MunaqasyahJenisUjian } from '@/lib/generated/prisma/enums';

interface Props {
  result: { id: string; jenis: MunaqasyahJenisUjian };
  scoringWeights: Record<MunaqasyahJenisUjian, ScoringWeights>;
  gradeSettings: MunaqasyahGradeSettingData[];
}

export function MunaqasyahResultEditDialog({ result, scoringWeights, gradeSettings }: Props) {
  const [open, setOpen] = useState(false);
  const [tasmiRows, setTasmiRows] = useState<TasmiResultEditRow[] | null>(null);
  const [munaqasyahRows, setMunaqasyahRows] = useState<MunaqasyahResultEditRow[] | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    if (result.jenis === 'TASMI') {
      getTasmiResult(result.id)
        .then((data) => {
          if (!cancelled) setTasmiRows(data.rows);
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : 'Gagal memuat hasil Tasmi');
          setOpen(false);
        });
    } else {
      getMunaqasyahResult(result.id)
        .then((data) => {
          if (!cancelled) setMunaqasyahRows(data.rows);
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : 'Gagal memuat hasil Munaqasyah');
          setOpen(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [open, result.id, result.jenis]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        }
      />

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Hasil {result.jenis === 'TASMI' ? 'Tasmi' : 'Munaqasyah'}</DialogTitle>
        </DialogHeader>

        {result.jenis === 'TASMI' ? (
          !tasmiRows ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-6" />
            </div>
          ) : (
            <TasmiAssessmentForm
              surahs={tasmiRows.map((r) => ({ surahId: r.surahId, surahName: r.surahName, initialScore: r.initialScore }))}
              weights={scoringWeights.TASMI}
              gradeSettings={gradeSettings}
              resultId={result.id}
              initialRows={tasmiRows}
              onSaved={() => setOpen(false)}
            />
          )
        ) : !munaqasyahRows ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        ) : (
          <MunaqasyahAssessmentForm
            weights={scoringWeights.MUNAQASYAH}
            gradeSettings={gradeSettings}
            resultId={result.id}
            initialRows={munaqasyahRows}
            onSaved={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
