'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TASHIH_TYPE_OPTIONS } from '../tashih.schema';
import { filterSurahOptionsByJuz } from '@/features/quran-reference/filter-surah-by-juz';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

export interface TashihRequestFieldValues {
  groupId: string;
  studentId: string;
  tashihType: 'ALQURAN' | 'WAFA';
  juzId: number | null;
  surahId: number | null;
  wafaId: number | null;
  startPage: number | null;
  endPage: number | null;
  notes: string;
}

interface Props {
  groups: GroupWithStudents[];
  surahOptions: ReferenceOption[];
  juzOptions: ReferenceOption[];
  surahJuzMap: SurahJuzMapping[];
  wafaOptions: ReferenceOption[];
  values: TashihRequestFieldValues;
  onChange: <K extends keyof TashihRequestFieldValues>(key: K, value: TashihRequestFieldValues[K]) => void;
}

export function TashihRequestFields({
  groups,
  surahOptions,
  juzOptions,
  surahJuzMap,
  wafaOptions,
  values,
  onChange,
}: Props) {
  const selectedGroup = groups.find((g) => g.id === values.groupId);
  const isWafa = values.tashihType === 'WAFA';
  const filteredSurahOptions = filterSurahOptionsByJuz(surahOptions, surahJuzMap, values.juzId);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel>Kelompok</FieldLabel>
        <Select
          value={values.groupId}
          onValueChange={(v) => {
            onChange('groupId', v ?? '');
            onChange('studentId', '');
          }}
        >
          <SelectTrigger>
            <SelectValue>{selectedGroup?.name ?? 'Pilih kelompok'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Siswa</FieldLabel>
        <Select value={values.studentId} onValueChange={(v) => onChange('studentId', v ?? '')}>
          <SelectTrigger>
            <SelectValue>
              {selectedGroup?.students.find((s) => s.userId === values.studentId)?.name ?? 'Pilih siswa'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(selectedGroup?.students ?? []).map((student) => (
              <SelectItem key={student.userId} value={student.userId}>
                {student.name} ({student.nis})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Jenis Tashih</FieldLabel>
        <Select
          value={values.tashihType}
          onValueChange={(v) => {
            onChange('tashihType', v as TashihRequestFieldValues['tashihType']);
            onChange('juzId', null);
            onChange('surahId', null);
            onChange('wafaId', null);
            onChange('startPage', null);
            onChange('endPage', null);
          }}
        >
          <SelectTrigger>
            <SelectValue>{TASHIH_TYPE_OPTIONS.find((o) => o.value === values.tashihType)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TASHIH_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {isWafa ? (
        <>
          <Field>
            <FieldLabel>Buku Wafa</FieldLabel>
            <Select
              value={values.wafaId ? String(values.wafaId) : ''}
              onValueChange={(v) => onChange('wafaId', v ? Number(v) : null)}
            >
              <SelectTrigger>
                <SelectValue>{wafaOptions.find((o) => o.id === values.wafaId)?.name ?? 'Pilih buku'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {wafaOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Halaman Mulai</FieldLabel>
              <Input
                type="number"
                value={values.startPage ?? ''}
                onChange={(e) => onChange('startPage', e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
            <Field>
              <FieldLabel>Halaman Akhir</FieldLabel>
              <Input
                type="number"
                value={values.endPage ?? ''}
                onChange={(e) => onChange('endPage', e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
          </div>
        </>
      ) : (
        <>
          <Field>
            <FieldLabel>Juz</FieldLabel>
            <Select
              value={values.juzId ? String(values.juzId) : ''}
              onValueChange={(v) => {
                onChange('juzId', v ? Number(v) : null);
                onChange('surahId', null);
              }}
            >
              <SelectTrigger>
                <SelectValue>{juzOptions.find((o) => o.id === values.juzId)?.name ?? 'Pilih juz'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {juzOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Surah</FieldLabel>
            <Select
              value={values.surahId ? String(values.surahId) : ''}
              onValueChange={(v) => onChange('surahId', v ? Number(v) : null)}
            >
              <SelectTrigger>
                <SelectValue>
                  {filteredSurahOptions.find((o) => o.id === values.surahId)?.name ?? 'Pilih surah'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredSurahOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </>
      )}

      <Field className="sm:col-span-2">
        <FieldLabel>Catatan</FieldLabel>
        <Textarea value={values.notes} onChange={(e) => onChange('notes', e.target.value)} rows={2} />
      </Field>
    </div>
  );
}
