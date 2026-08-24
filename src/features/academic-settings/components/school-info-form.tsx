'use client';

import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { School } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { schoolInfoSchema } from '../academic-settings.schema';
import { updateSchoolInfo } from '../actions/update-school-info';
import type { AcademicSettingData } from '../actions/get-academic-setting';

interface Props {
  setting: AcademicSettingData;
}

export function SchoolInfoForm({ setting }: Props) {
  const form = useForm({
    defaultValues: {
      schoolName: setting?.schoolName ?? '',
      schoolAddress: setting?.schoolAddress ?? '',
      currentPrincipalName: setting?.currentPrincipalName ?? '',
    },
    validators: { onSubmit: schoolInfoSchema },
    onSubmit: async ({ value }) => {
      try {
        await updateSchoolInfo(value);
        toast.success('Informasi sekolah berhasil diperbarui');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memperbarui informasi sekolah');
      }
    },
  });

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <School className="size-5" />
          Informasi Sekolah
        </CardTitle>
        <CardDescription>
          Data umum sekolah yang ditampilkan pada laporan dan dokumen.
        </CardDescription>
      </CardHeader>

      <form
        id="school-info-form"
        className="flex flex-1 flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        noValidate
      >
        <CardContent className="flex-1">
          <FieldGroup>
            <form.Field name="schoolName">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nama Sekolah</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Masukkan nama sekolah"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="schoolAddress">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Alamat Sekolah</FieldLabel>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Masukkan alamat sekolah"
                      aria-invalid={isInvalid}
                      rows={3}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="currentPrincipalName">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nama Kepala Sekolah</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Masukkan nama kepala sekolah"
                      aria-invalid={isInvalid}
                    />
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
            form="school-info-form"
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
