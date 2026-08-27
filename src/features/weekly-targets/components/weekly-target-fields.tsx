'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/layouts/calendars/date-range-picker';
import { TARGET_TYPE_OPTIONS } from '../weekly-target.schema';
import { filterSurahOptionsByJuz } from '@/features/quran-reference/filter-surah-by-juz';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

export interface WeeklyTargetFieldValues {
  type: 'TAHFIDZ' | 'TAHSIN_WAFA' | 'TAHSIN_ALQURAN';
  startDate: Date | undefined;
  endDate: Date | undefined;
  description: string;
  status: 'TIDAK_TERCAPAI' | 'TERCAPAI';
  progressPercent: number | null;
  surahStartId: number | null;
  surahEndId: number | null;
  startAyat: number | null;
  endAyat: number | null;
  juzStartId: number | null;
  juzEndId: number | null;
  wafaId: number | null;
  startPage: number | null;
  endPage: number | null;
}

interface Props {
  surahOptions: ReferenceOption[];
  juzOptions: ReferenceOption[];
  surahJuzMap: SurahJuzMapping[];
  wafaOptions: ReferenceOption[];
  values: WeeklyTargetFieldValues;
  onChange: <K extends keyof WeeklyTargetFieldValues>(key: K, value: WeeklyTargetFieldValues[K]) => void;
}

export function WeeklyTargetFields({
  surahOptions,
  juzOptions,
  surahJuzMap,
  wafaOptions,
  values,
  onChange,
}: Props) {
  const isWafa = values.type === 'TAHSIN_WAFA';
  const [sameSurah, setSameSurah] = useState(false);
  const [sameJuz, setSameJuz] = useState(false);
  const surahStartOptions = filterSurahOptionsByJuz(surahOptions, surahJuzMap, values.juzStartId);
  const surahEndOptions = filterSurahOptionsByJuz(surahOptions, surahJuzMap, values.juzEndId);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel>Jenis Target</FieldLabel>
        <Select
          value={values.type}
          onValueChange={(v) => {
            onChange('type', v as WeeklyTargetFieldValues['type']);
            onChange('surahStartId', null);
            onChange('surahEndId', null);
            onChange('startAyat', null);
            onChange('endAyat', null);
            onChange('juzStartId', null);
            onChange('juzEndId', null);
            onChange('wafaId', null);
            onChange('startPage', null);
            onChange('endPage', null);
          }}
        >
          <SelectTrigger>
            <SelectValue>{TARGET_TYPE_OPTIONS.find((o) => o.value === values.type)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TARGET_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Periode Target</FieldLabel>
        <DateRangePicker
          value={
            values.startDate || values.endDate ? { from: values.startDate, to: values.endDate } : undefined
          }
          onChange={(range) => {
            onChange('startDate', range?.from);
            onChange('endDate', range?.to);
          }}
        />
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
              <FieldLabel>Halaman Awal</FieldLabel>
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
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Juz Awal</FieldLabel>
              <Select
                value={values.juzStartId ? String(values.juzStartId) : ''}
                onValueChange={(v) => {
                  const id = v ? Number(v) : null;
                  onChange('juzStartId', id);
                  onChange('surahStartId', null);
                  if (sameSurah) onChange('surahEndId', null);
                  if (sameJuz) {
                    onChange('juzEndId', id);
                    onChange('surahEndId', null);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue>{juzOptions.find((o) => o.id === values.juzStartId)?.name ?? 'Pilih juz'}</SelectValue>
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
              <FieldLabel>Juz Akhir</FieldLabel>
              <Select
                value={values.juzEndId ? String(values.juzEndId) : ''}
                onValueChange={(v) => {
                  onChange('juzEndId', v ? Number(v) : null);
                  if (!sameSurah) onChange('surahEndId', null);
                }}
                disabled={sameJuz}
              >
                <SelectTrigger>
                  <SelectValue>{juzOptions.find((o) => o.id === values.juzEndId)?.name ?? 'Pilih juz'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {juzOptions.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={sameJuz}
                  onCheckedChange={(checked) => {
                    setSameJuz(!!checked);
                    if (checked) onChange('juzEndId', values.juzStartId);
                  }}
                />
                Sama dengan juz awal
              </label>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Surah Awal</FieldLabel>
              <Select
                key={values.juzStartId ?? ''}
                value={values.surahStartId ? String(values.surahStartId) : ''}
                onValueChange={(v) => {
                  const id = v ? Number(v) : null;
                  onChange('surahStartId', id);
                  if (sameSurah) onChange('surahEndId', id);
                }}
                disabled={!values.juzStartId}
              >
                <SelectTrigger>
                  <SelectValue>
                    {values.juzStartId
                      ? (surahStartOptions.find((o) => o.id === values.surahStartId)?.name ?? 'Pilih surah')
                      : 'Pilih juz dahulu'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {surahStartOptions.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Surah Akhir</FieldLabel>
              <Select
                key={values.juzEndId ?? ''}
                value={values.surahEndId ? String(values.surahEndId) : ''}
                onValueChange={(v) => onChange('surahEndId', v ? Number(v) : null)}
                disabled={sameSurah || !values.juzEndId}
              >
                <SelectTrigger>
                  <SelectValue>
                    {values.juzEndId
                      ? (surahEndOptions.find((o) => o.id === values.surahEndId)?.name ?? 'Pilih surah')
                      : 'Pilih juz dahulu'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {surahEndOptions.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={sameSurah}
                  onCheckedChange={(checked) => {
                    setSameSurah(!!checked);
                    if (checked) onChange('surahEndId', values.surahStartId);
                  }}
                />
                Sama dengan surah awal
              </label>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Ayat Awal</FieldLabel>
              <Input
                type="number"
                min={1}
                max={286}
                value={values.startAyat ?? ''}
                onChange={(e) => onChange('startAyat', e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
            <Field>
              <FieldLabel>Ayat Akhir</FieldLabel>
              <Input
                type="number"
                min={1}
                max={286}
                value={values.endAyat ?? ''}
                onChange={(e) => onChange('endAyat', e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
          </div>
        </>
      )}

      <Field className="sm:col-span-2">
        <FieldLabel>Deskripsi (opsional)</FieldLabel>
        <Textarea
          value={values.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={2}
          maxLength={191}
        />
      </Field>
    </div>
  );
}
