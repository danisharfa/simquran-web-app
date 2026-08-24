'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { School } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

import { classroomSchema } from '../classroom.schema';
import { createClassroom } from '../actions/create-classroom';

const LEVEL_OPTIONS = [1, 2, 3, 4, 5, 6].map((level) => ({
  value: String(level),
  label: `Kelas ${level}`,
}));

const SEMESTER_OPTIONS = [
  { value: 'GANJIL', label: 'Ganjil' },
  { value: 'GENAP', label: 'Genap' },
] as const;

interface Props {
  defaultAcademicYear?: string;
  defaultSemester?: 'GANJIL' | 'GENAP';
}

export function AddClassroomForm({ defaultAcademicYear = '', defaultSemester = 'GANJIL' }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      level: '',
      name: '',
      academicYear: defaultAcademicYear,
      semester: defaultSemester,
    },

    validators: {
      onSubmit: classroomSchema,
    },

    onSubmit: async ({ value, formApi }) => {
      const formData = new FormData();
      formData.append('level', value.level);
      formData.append('name', value.name);
      formData.append('academicYear', value.academicYear);
      formData.append('semester', value.semester);

      const result = await createClassroom(formData);

      if (!result.success) {
        toast.error(result.error ?? 'Gagal membuat kelas');
        return;
      }

      toast.success('Kelas berhasil ditambahkan');
      formApi.reset();
      setOpen(false);
      router.refresh();
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <School />
            Tambah Kelas
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="size-5" />
            Tambah Kelas
          </DialogTitle>
          <DialogDescription>
            Buat data kelas baru untuk tahun ajaran dan semester tertentu.
          </DialogDescription>
        </DialogHeader>

        <form
          id="add-classroom-form"
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          noValidate
        >
          <FieldGroup>
            <form.Field name="level">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const selectedLabel =
                  LEVEL_OPTIONS.find((option) => option.value === field.state.value)?.label ??
                  'Pilih kelas';

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Kelas</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as typeof field.state.value)}
                    >
                      <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                        <SelectValue>{selectedLabel}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {LEVEL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="name">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nama Kelas</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Contoh: Ahmad"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="academicYear">
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

            <form.Field name="semester">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const selectedLabel =
                  SEMESTER_OPTIONS.find((option) => option.value === field.state.value)?.label ??
                  'Pilih semester';

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Semester</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as 'GANJIL' | 'GENAP')}
                    >
                      <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                        <SelectValue>{selectedLabel}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="add-classroom-form"
            className="w-full sm:w-auto"
            disabled={form.state.isSubmitting}
          >
            {form.state.isSubmitting ? (
              <>
                <Spinner />
                Menyimpan...
              </>
            ) : (
              'Tambah Kelas'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
