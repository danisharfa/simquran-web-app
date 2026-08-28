'use client';

import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { scoringWeightsSchema } from '../munaqasyah.schema';
import { updateScoringWeights } from '../actions/update-scoring-weights';
import type { ScoringWeights } from '../munaqasyah-scoring';
import type { MunaqasyahJenisUjian } from '@/lib/generated/prisma/enums';

const FIELD_LABEL: Record<keyof ScoringWeights, string> = {
  khofiAwalAyatWeight: 'Khofi Awal Ayat',
  khofiMakhrojWeight: 'Khofi Makhroj',
  khofiTajwidMadWeight: 'Khofi Tajwid/Mad',
  jaliBarisWeight: 'Jali Baris',
  jaliLebihSatuKalimatWeight: 'Jali >1 Kalimat',
};

interface Props {
  jenis: MunaqasyahJenisUjian;
  title: string;
  description: string;
  weights: ScoringWeights;
  readOnly?: boolean;
}

export function ScoringWeightsForm({ jenis, title, description, weights, readOnly = false }: Props) {
  const router = useRouter();
  const form = useForm({
    defaultValues: weights,
    validators: { onSubmit: scoringWeightsSchema },
    onSubmit: async ({ value }) => {
      const result = await updateScoringWeights(jenis, value);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <form
        id={`scoring-weights-form-${jenis}`}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        noValidate
      >
        <CardContent>
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(FIELD_LABEL) as (keyof ScoringWeights)[]).map((key) => (
              <form.Field key={key} name={key}>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>{FIELD_LABEL[key]}</FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        min={0}
                        value={field.state.value}
                        disabled={readOnly}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            ))}
          </FieldGroup>
        </CardContent>

        {!readOnly && (
          <CardFooter>
            <Button type="submit" form={`scoring-weights-form-${jenis}`} disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? (
                <>
                  <Spinner />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
