'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { DatePicker } from '@/components/layouts/calendars/date-picker';
import { toast } from 'sonner';
import type { Gender, BloodType } from '@/lib/generated/prisma/enums';
import type { UserDetail } from '../actions/get-user-detail';
import { updateOwnProfile } from '../actions/update-own-profile';
import { NONE, GENDER_OPTIONS, BLOOD_TYPE_OPTIONS } from '../user-options';

export function ProfileDetail({ user }: { user: UserDetail }) {
  const router = useRouter();
  const role = user.role.toLowerCase();
  const isAdminOrSuperadmin = role === 'admin' || role === 'superadmin';
  const isStudent = role === 'student';
  const isTeacherOrCoordinator = role === 'teacher' || role === 'coordinator';

  // coordinator, teacher, student cannot change name, username, NIP, NIS, NISN
  const identityReadonly = !isAdminOrSuperadmin;

  const [name, setName] = useState(user.name ?? '');
  const [username, setUsername] = useState(user.username ?? '');
  const [email, setEmail] = useState(user.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? '');
  const [birthPlace, setBirthPlace] = useState(user.birthPlace ?? '');
  const [address, setAddress] = useState(user.address ?? '');
  const [gender, setGender] = useState(user.gender ?? NONE);
  const [bloodType, setBloodType] = useState(user.bloodType ?? NONE);
  const [date, setDate] = useState<Date | undefined>(
    user.birthDate ? new Date(user.birthDate as unknown as string) : undefined,
  );
  const [saving, setSaving] = useState(false);

  const toNullable = (val: string) => (val && val !== NONE ? val : null);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await updateOwnProfile({
        ...(isAdminOrSuperadmin
          ? { name: name || undefined, username: username || undefined }
          : {}),
        email: toNullable(email),
        phoneNumber: toNullable(phoneNumber),
        birthDate: date ?? null,
        birthPlace: toNullable(birthPlace),
        address: toNullable(address),
        gender: toNullable(gender) as Gender | null,
        bloodType: toNullable(bloodType) as BloodType | null,
      });
      toast.success('Profil berhasil diperbarui');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Profil Saya</CardTitle>
      </CardHeader>

      <CardContent>
        <FieldSet>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Field>
                <FieldLabel>Nama Lengkap</FieldLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={identityReadonly}
                  maxLength={100}
                  className={identityReadonly ? 'bg-muted cursor-not-allowed' : ''}
                />
              </Field>

              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  readOnly={identityReadonly}
                  maxLength={30}
                  className={identityReadonly ? 'bg-muted cursor-not-allowed' : ''}
                />
              </Field>

              {isTeacherOrCoordinator && (
                <Field>
                  <FieldLabel>NIP</FieldLabel>
                  <Input
                    value={user.nip ?? ''}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </Field>
              )}

              {isStudent && (
                <>
                  <Field>
                    <FieldLabel>NIS</FieldLabel>
                    <Input value={user.nis ?? ''} readOnly className="bg-muted cursor-not-allowed" />
                  </Field>
                  <Field>
                    <FieldLabel>NISN</FieldLabel>
                    <Input value={user.nisn ?? ''} readOnly className="bg-muted cursor-not-allowed" />
                  </Field>
                </>
              )}

              <Field>
                <FieldLabel>Tempat Lahir</FieldLabel>
                <Textarea value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} maxLength={100} />
              </Field>

              <DatePicker value={date} onChange={setDate} label="Tanggal Lahir" />
            </div>

            <div className="space-y-4">
              <Field>
                <FieldLabel>Jenis Kelamin</FieldLabel>
                <Select value={gender} onValueChange={(val) => setGender(val ?? NONE)}>
                  <SelectTrigger>
                    <SelectValue>
                      {GENDER_OPTIONS.find((opt) => opt.value === gender)?.label ?? '-- Pilih --'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Golongan Darah</FieldLabel>
                <Select value={bloodType} onValueChange={(val) => setBloodType(val ?? NONE)}>
                  <SelectTrigger>
                    <SelectValue>
                      {BLOOD_TYPE_OPTIONS.find((opt) => opt.value === bloodType)?.label ??
                        '-- Pilih --'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Alamat</FieldLabel>
                <Textarea value={address} onChange={(e) => setAddress(e.target.value)} maxLength={191} />
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} maxLength={191} />
              </Field>

              <Field>
                <FieldLabel>No. HP</FieldLabel>
                <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} maxLength={20} />
              </Field>
            </div>
          </FieldGroup>
        </FieldSet>
      </CardContent>

      <CardFooter className="flex items-center justify-center">
        <Button onClick={handleSubmit} disabled={saving} className="w-48">
          {saving ? (
            <>
              <Spinner />
              Menyimpan...
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
