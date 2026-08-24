import { Role, Gender, BloodType } from '@/lib/generated/prisma/enums';

export const NONE = '__none__';

export const ROLE_LABEL: Record<Role, string> = {
  [Role.SUPERADMIN]: 'Superadmin',
  [Role.ADMIN]: 'Admin',
  [Role.COORDINATOR]: 'Koordinator',
  [Role.TEACHER]: 'Guru',
  [Role.STUDENT]: 'Siswa',
};

export const GENDER_OPTIONS = [
  { value: NONE, label: '-- Pilih --' },
  { value: Gender.MALE, label: 'Laki-laki' },
  { value: Gender.FEMALE, label: 'Perempuan' },
];

export const BLOOD_TYPE_OPTIONS = [
  { value: NONE, label: '-- Pilih --' },
  { value: BloodType.A, label: 'A' },
  { value: BloodType.B, label: 'B' },
  { value: BloodType.AB, label: 'AB' },
  { value: BloodType.O, label: 'O' },
];
