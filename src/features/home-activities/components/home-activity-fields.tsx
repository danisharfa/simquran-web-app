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
import { DatePicker } from '@/components/layouts/calendars/date-picker';
import { HOME_ACTIVITY_TYPE_OPTIONS } from '../home-activity.schema';
import { filterSurahOptionsByJuz } from '@/features/quran-reference/filter-surah-by-juz';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

export interface HomeActivityFieldValues {
  date: Date | undefined;
  activityType: 'MURAJAAH' | 'TILAWAH' | 'TARJAMAH';
  juzId: number | null;
  surahId: number | null;
  startVerse: number | null;
  endVerse: number | null;
  note: string;
}

interface Props {
  surahOptions: ReferenceOption[];
  juzOptions: ReferenceOption[];
  surahJuzMap: SurahJuzMapping[];
  values: HomeActivityFieldValues;
  onChange: <K extends keyof HomeActivityFieldValues>(key: K, value: HomeActivityFieldValues[K]) => void;
}

export function HomeActivityFields({ surahOptions, juzOptions, surahJuzMap, values, onChange }: Props) {
  const filteredSurahOptions = filterSurahOptionsByJuz(surahOptions, surahJuzMap, values.juzId);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <DatePicker value={values.date} onChange={(d) => onChange('date', d)} label="Tanggal" />

      <Field>
        <FieldLabel>Jenis Aktivitas</FieldLabel>
        <Select
          value={values.activityType}
          onValueChange={(v) => onChange('activityType', v as HomeActivityFieldValues['activityType'])}
        >
          <SelectTrigger>
            <SelectValue>
              {HOME_ACTIVITY_TYPE_OPTIONS.find((o) => o.value === values.activityType)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {HOME_ACTIVITY_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

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
          key={values.juzId ?? ''}
          value={values.surahId ? String(values.surahId) : ''}
          onValueChange={(v) => onChange('surahId', v ? Number(v) : null)}
          disabled={!values.juzId}
        >
          <SelectTrigger>
            <SelectValue>
              {values.juzId
                ? (filteredSurahOptions.find((o) => o.id === values.surahId)?.name ?? 'Pilih surah')
                : 'Pilih juz dahulu'}
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

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel>Ayat Mulai</FieldLabel>
          <Input
            type="number"
            min={1}
            max={286}
            value={values.startVerse ?? ''}
            onChange={(e) => onChange('startVerse', e.target.value ? Number(e.target.value) : null)}
          />
        </Field>
        <Field>
          <FieldLabel>Ayat Akhir</FieldLabel>
          <Input
            type="number"
            min={1}
            max={286}
            value={values.endVerse ?? ''}
            onChange={(e) => onChange('endVerse', e.target.value ? Number(e.target.value) : null)}
          />
        </Field>
      </div>

      <Field className="sm:col-span-2">
        <FieldLabel>Catatan (opsional)</FieldLabel>
        <Textarea value={values.note} onChange={(e) => onChange('note', e.target.value)} rows={2} maxLength={191} />
      </Field>
    </div>
  );
}
