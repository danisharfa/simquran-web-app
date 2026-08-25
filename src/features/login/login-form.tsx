'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';

import { signIn } from '@/lib/auth-client';
import { loginSchema } from './login.schema';

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

import { Eye, EyeOff, Lock, LogIn, User } from 'lucide-react';

import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },

    validators: {
      onSubmit: loginSchema,
    },

    onSubmit: async ({ value }) => {
      try {
        const result = await signIn.username({
          username: value.username.trim(),
          password: value.password,
        });

        if (result.error) {
          const isCredentialsError =
            result.error.status === 401 || result.error.status === 422;

          toast.error(
            isCredentialsError
              ? (result.error.message ?? 'Username atau password salah')
              : 'Terjadi kesalahan sistem. Silakan coba lagi.',
          );

          return;
        }

        toast.success('Berhasil login');

        router.replace('/dashboard');
      } catch (error) {
        console.error(error);

        toast.error('Terjadi kesalahan sistem. Silakan coba lagi.');
      }
    },
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Masuk</CardTitle>

        <CardDescription>Gunakan username dan password yang telah diberikan</CardDescription>
      </CardHeader>

      <form
        id="login-form"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        noValidate
      >
        <CardContent>
          <FieldGroup>
            <form.Field name="username">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>

                    <InputGroup>
                      <InputGroupAddon>
                        <User />
                      </InputGroupAddon>

                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Masukkan username Anda"
                        autoComplete="username"
                      />
                    </InputGroup>

                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>

                    <InputGroup>
                      <InputGroupAddon>
                        <Lock />
                      </InputGroupAddon>

                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        type={showPassword ? 'text' : 'password'}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Masukkan password Anda"
                        autoComplete="current-password"
                      />

                      <InputGroupAddon align="inline-end">
                        <form.Subscribe selector={(state) => state.isSubmitting}>
                          {(isSubmitting) => (
                            <InputGroupButton
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setShowPassword((s) => !s);
                              }}
                              disabled={isSubmitting}
                              aria-label={
                                showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                              }
                            >
                              {showPassword ? <EyeOff /> : <Eye />}
                            </InputGroupButton>
                          )}
                        </form.Subscribe>
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
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" form="login-form" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn />
                    Masuk
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </form>
    </Card>
  );
}
