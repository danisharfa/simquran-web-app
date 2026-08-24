'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { FaUsers } from 'react-icons/fa';

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

import { groupSchema } from '../group.schema';
import { createGroup } from '../actions/create-group';
import type { ClassroomOption } from '../queries/list-active-classrooms';
import type { TeacherOption } from '../queries/list-teachers';

interface Props {
  classrooms: ClassroomOption[];
  teachers: TeacherOption[];
}

export function AddGroupForm({ classrooms, teachers }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      classroomId: '',
      teacherId: '',
    },

    validators: {
      onSubmit: groupSchema,
    },

    onSubmit: async ({ value, formApi }) => {
      const formData = new FormData();
      formData.append('name', value.name);
      formData.append('classroomId', value.classroomId);
      formData.append('teacherId', value.teacherId);

      const result = await createGroup(formData);

      if (!result.success) {
        toast.error(result.error ?? 'Gagal membuat kelompok');
        return;
      }

      toast.success('Kelompok berhasil ditambahkan');
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
            <FaUsers />
            Tambah Kelompok
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaUsers className="size-5" />
            Tambah Kelompok
          </DialogTitle>
          <DialogDescription>
            Buat kelompok tahfidz/tahsin baru untuk kelas tertentu.
          </DialogDescription>
        </DialogHeader>

        <form
          id="add-group-form"
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          noValidate
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nama Kelompok</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Contoh: Kelompok A"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="classroomId">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const selectedLabel = (() => {
                  const classroom = classrooms.find((c) => c.id === field.state.value);
                  return classroom ? `${classroom.level} ${classroom.name}` : 'Pilih kelas';
                })();

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Kelas</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value ?? '')}
                    >
                      <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                        <SelectValue>{selectedLabel}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {classrooms.map((classroom) => (
                          <SelectItem key={classroom.id} value={classroom.id}>
                            {classroom.level} {classroom.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="teacherId">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const selectedLabel =
                  teachers.find((t) => t.userId === field.state.value)?.name ??
                  'Pilih guru pembimbing';

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Guru Pembimbing</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value ?? '')}
                    >
                      <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                        <SelectValue>{selectedLabel}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.userId} value={teacher.userId}>
                            {teacher.name}
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
            form="add-group-form"
            className="w-full sm:w-auto"
            disabled={form.state.isSubmitting}
          >
            {form.state.isSubmitting ? (
              <>
                <Spinner />
                Menyimpan...
              </>
            ) : (
              'Tambah Kelompok'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
