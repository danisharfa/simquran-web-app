'use client';

import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { GraduationCap } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { academicYearSchema } from '../academic-settings.schema';
import { updateAcademicYear } from '../actions/update-academic-year';
import type { AcademicSettingData } from '../queries/get-academic-setting';

const SEMESTER_OPTIONS = [
  { value: 'GANJIL', label: 'Ganjil' },
  { value: 'GENAP', label: 'Genap' },
] as const;

interface Props {
  setting: AcademicSettingData;
}

export function AcademicYearForm({ setting }: Props) {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      currentYear: setting?.currentYear ?? '',
      currentSemester: (setting?.currentSemester ?? 'GANJIL') as 'GANJIL' | 'GENAP',
    },
    validators: { onSubmit: academicYearSchema },
    onSubmit: async ({ value }) => {
      try {
        await updateAcademicYear(value);
        toast.success('Tahun akademik berhasil diperbarui');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memperbarui tahun akademik');
      }
    },
  });

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="size-5" />
          Tahun Akademik
        </CardTitle>
        <CardDescription>Atur tahun ajaran dan semester yang sedang berjalan.</CardDescription>
      </CardHeader>

      <form
        id="academic-year-form"
        className="flex flex-1 flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        noValidate
      >
        <CardContent className="flex-1">
          <FieldGroup>
            <form.Field name="currentYear">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Tahun Ajaran</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Contoh: 2025/2026"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="currentSemester">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const selectedLabel =
                  SEMESTER_OPTIONS.find((opt) => opt.value === field.state.value)?.label ??
                  'Pilih semester';
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Semester</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => field.handleChange(val as 'GANJIL' | 'GENAP')}
                    >
                      <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                        <SelectValue>{selectedLabel}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTER_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            form="academic-year-form"
            disabled={form.state.isSubmitting}
            className="w-full"
          >
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
      </form>
    </Card>
  );
}
