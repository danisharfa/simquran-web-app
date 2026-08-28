'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { updateFinalScoreWeights } from '../actions/update-final-score-weights';
import type { FinalScoreWeightsData } from '../queries/get-final-score-weights';

interface Props {
  weights: FinalScoreWeightsData;
  readOnly?: boolean;
}

export function FinalScoreWeightsForm({ weights, readOnly = false }: Props) {
  const router = useRouter();
  const [tasmiWeight, setTasmiWeight] = useState(weights.tasmiWeight);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const munaqasyahWeight = 100 - tasmiWeight;
  const isDirty = tasmiWeight !== weights.tasmiWeight;

  async function handleSave() {
    setIsSubmitting(true);
    try {
      const result = await updateFinalScoreWeights({ tasmiWeight, munaqasyahWeight });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Bobot Nilai Akhir</CardTitle>
        <CardDescription>
          Proporsi nilai Tasmi dan Munaqasyah saat digabung menjadi nilai akhir (MunaqasyahFinalResult). Kedua bobot
          otomatis dijumlahkan 100%.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-end gap-4">
          <Field className="w-40">
            <FieldLabel>Bobot Tasmi (%)</FieldLabel>
            <Input
              type="number"
              min={0}
              max={100}
              value={tasmiWeight}
              disabled={readOnly}
              onChange={(e) => setTasmiWeight(Math.max(0, Math.min(100, Number(e.target.value))))}
            />
          </Field>
          <Field className="w-40">
            <FieldLabel>Bobot Munaqasyah (%)</FieldLabel>
            <Input type="number" value={munaqasyahWeight} disabled readOnly />
          </Field>
        </div>
      </CardContent>
      {!readOnly && (
        <CardFooter>
          <Button onClick={handleSave} disabled={!isDirty || isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
