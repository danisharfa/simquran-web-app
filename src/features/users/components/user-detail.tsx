'use client';

import { useState } from 'react';
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
import type { UserDetail as UserDetailData } from '../actions/get-user-detail';
import { updateUserDetail } from '../actions/update-user-detail';
import { NONE, GENDER_OPTIONS, BLOOD_TYPE_OPTIONS } from '../user-options';

interface UserDetailProps {
  user: UserDetailData;
  onSuccess?: () => void;
}

export function UserDetail({ user, onSuccess }: UserDetailProps) {
  const role = user.role.toLowerCase();
  const isStudent = role === 'student';
  const isTeacherOrCoordinator = role === 'teacher' || role === 'coordinator';

  const [name, setName] = useState(user.name ?? '');
  const [username, setUsername] = useState(user.username ?? '');
  const [email, setEmail] = useState(user.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? '');
  const [birthPlace, setBirthPlace] = useState(user.birthPlace ?? '');
  const [address, setAddress] = useState(user.address ?? '');
  const [gender, setGender] = useState(user.gender ?? NONE);
  const [bloodType, setBloodType] = useState(user.bloodType ?? NONE);
  const [nip, setNip] = useState(user.nip ?? '');
  const [nis, setNis] = useState(user.nis ?? '');
  const [nisn, setNisn] = useState(user.nisn ?? '');
  const [date, setDate] = useState<Date | undefined>(
    user.birthDate ? new Date(user.birthDate as unknown as string) : undefined,
  );
  const [saving, setSaving] = useState(false);

  const toNullable = (val: string) => (val && val !== NONE ? val : null);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await updateUserDetail({
        userId: user.id,
        role: user.role,
        name: name || undefined,
        username: username || undefined,
        email: toNullable(email),
        phoneNumber: toNullable(phoneNumber),
        birthDate: date ?? null,
        birthPlace: toNullable(birthPlace),
        address: toNullable(address),
        gender: toNullable(gender) as Gender | null,
        bloodType: toNullable(bloodType) as BloodType | null,
        ...(isStudent ? { nis, nisn: toNullable(nisn) } : {}),
        ...(isTeacherOrCoordinator ? { nip } : {}),
      });
      toast.success('Data berhasil diperbarui');
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <FieldSet>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Field>
                <FieldLabel>Nama Lengkap</FieldLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>

              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </Field>

              {isTeacherOrCoordinator && (
                <Field>
                  <FieldLabel>NIP</FieldLabel>
                  <Input value={nip} onChange={(e) => setNip(e.target.value)} />
                </Field>
              )}

              {isStudent && (
                <>
                  <Field>
                    <FieldLabel>NIS</FieldLabel>
                    <Input value={nis} onChange={(e) => setNis(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel>NISN</FieldLabel>
                    <Input value={nisn} onChange={(e) => setNisn(e.target.value)} />
                  </Field>
                </>
              )}

              <Field>
                <FieldLabel>Tempat Lahir</FieldLabel>
                <Textarea value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} />
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
                <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>

              <Field>
                <FieldLabel>No. HP</FieldLabel>
                <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </Field>
            </div>
          </FieldGroup>
      </FieldSet>

      <div className="flex items-center justify-center">
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
      </div>
    </div>
  );
}
