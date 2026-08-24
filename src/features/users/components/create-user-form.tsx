'use client';

import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';

import { createUser } from '../actions/create-user';
import { createUserSchema } from '../create-user.schema';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { ROLE_LABEL } from '../user-options';

const CREATABLE_ROLES = ['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT'] as const;

const ALL_ROLE_OPTIONS = CREATABLE_ROLES.map((value) => ({ value, label: ROLE_LABEL[value] }));

type RoleValue = (typeof CREATABLE_ROLES)[number];

interface AddUserFormProps {
  allowedRoles?: RoleValue[];
}

export function AddUserForm({ allowedRoles }: AddUserFormProps) {
  const router = useRouter();

  const roleOptions = allowedRoles
    ? ALL_ROLE_OPTIONS.filter((opt) => allowedRoles.includes(opt.value))
    : ALL_ROLE_OPTIONS;

  const defaultRole = (roleOptions.find((opt) => opt.value === 'STUDENT')?.value ??
    roleOptions[0]?.value ??
    'STUDENT') as string;

  const form = useForm({
    defaultValues: {
      name: '',
      username: '',
      role: defaultRole,
    },

    validators: {
      onSubmit: createUserSchema,
    },

    onSubmit: async ({ value, formApi }) => {
      const formData = new FormData();
      formData.append('name', value.name);
      formData.append('username', value.username);
      formData.append('role', value.role);

      const result = await createUser(formData);

      if (!result.success) {
        toast.error(result.error ?? 'Gagal membuat pengguna');
        return;
      }

      toast.success('Pengguna berhasil ditambahkan');
      formApi.reset();
      router.refresh();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="size-5" />
          Tambah Pengguna
        </CardTitle>
        <CardDescription>
          Email, password, dan NIP/NIS akan dibuat otomatis dari username. Ingatkan pengguna baru
          untuk mengganti password setelah login pertama kali.
        </CardDescription>
      </CardHeader>

      <form
        id="add-user-form"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        noValidate
      >
        <CardContent>
          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nama Lengkap</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Masukkan nama lengkap"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="username">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Masukkan nip/nis sebagai username"
                      autoComplete="off"
                    />
                    <FieldDescription>Username akan digunakan untuk login.</FieldDescription>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="role">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                const selectedRoleLabel =
                  roleOptions.find((option) => option.value === field.state.value)?.label ??
                  'Pilih role';

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Peran</FieldLabel>

                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as typeof field.state.value)
                      }
                    >
                      <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                        <SelectValue>{selectedRoleLabel}</SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        {roleOptions.map((option) => (
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
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            form="add-user-form"
            className="w-full"
            disabled={form.state.isSubmitting}
          >
            {form.state.isSubmitting ? (
              <>
                <Spinner />
                Menyimpan...
              </>
            ) : (
              <>
                <UserPlus />
                Tambah
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
