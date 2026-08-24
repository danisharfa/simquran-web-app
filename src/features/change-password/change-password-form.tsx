'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';

import { authClient } from '@/lib/auth-client';
import { changePasswordSchema } from './change-password.schema';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';

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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';

import { Eye, EyeOff, KeyRound, Lock } from 'lucide-react';

import { toast } from 'sonner';

export function ChangePasswordForm() {
  const router = useRouter();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },

    validators: {
      onSubmit: changePasswordSchema,
    },

    onSubmit: async ({ value, formApi }) => {
      try {
        const result = await authClient.changePassword({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: true,
        });

        if (result.error) {
          toast.error(result.error.message ?? 'Gagal mengubah password');

          return;
        }

        toast.success('Password berhasil diubah');

        formApi.reset();
        router.back();
      } catch (error) {
        console.error(error);

        toast.error('Terjadi kesalahan sistem. Silakan coba lagi.');
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <KeyRound className="size-5" />
          Ganti Password
        </CardTitle>

        <CardDescription>Masukkan password saat ini dan password baru Anda</CardDescription>
      </CardHeader>

      <form
        id="change-password-form"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        noValidate
      >
        <CardContent>
          <FieldGroup>
            <form.Field name="currentPassword">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password Saat Ini</FieldLabel>

                    <InputGroup>
                      <InputGroupAddon>
                        <Lock />
                      </InputGroupAddon>

                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        type={showCurrent ? 'text' : 'password'}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Masukkan password saat ini"
                        autoComplete="current-password"
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setShowCurrent((s) => !s);
                          }}
                          disabled={form.state.isSubmitting}
                          aria-label={showCurrent ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                          {showCurrent ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>

                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="newPassword">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password Baru</FieldLabel>

                    <InputGroup>
                      <InputGroupAddon>
                        <Lock />
                      </InputGroupAddon>

                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        type={showNew ? 'text' : 'password'}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Minimal 8 karakter"
                        autoComplete="new-password"
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setShowNew((s) => !s);
                          }}
                          disabled={form.state.isSubmitting}
                          aria-label={showNew ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                          {showNew ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>

                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Konfirmasi Password Baru</FieldLabel>

                    <InputGroup>
                      <InputGroupAddon>
                        <Lock />
                      </InputGroupAddon>

                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        type={showConfirm ? 'text' : 'password'}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Ulangi password baru"
                        autoComplete="new-password"
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setShowConfirm((s) => !s);
                          }}
                          disabled={form.state.isSubmitting}
                          aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                          {showConfirm ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>

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
            form="change-password-form"
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
                <KeyRound />
                Simpan
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
