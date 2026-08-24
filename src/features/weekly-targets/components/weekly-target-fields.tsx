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
import { Calendar22 } from '@/components/layouts/calendars/calendar-22';
import { TARGET_TYPE_OPTIONS, TARGET_STATUS_OPTIONS } from '../weekly-target.schema';
import type { ReferenceOption } from '@/features/quran-reference/queries/list-reference-options';

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
  wafaId: number | null;
  startPage: number | null;
  endPage: number | null;
}

interface Props {
  surahOptions: ReferenceOption[];
  wafaOptions: ReferenceOption[];
  values: WeeklyTargetFieldValues;
  onChange: <K extends keyof WeeklyTargetFieldValues>(key: K, value: WeeklyTargetFieldValues[K]) => void;
  showStatus?: boolean;
}

export function WeeklyTargetFields({ surahOptions, wafaOptions, values, onChange, showStatus = false }: Props) {
  const isWafa = values.type === 'TAHSIN_WAFA';

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
        <FieldLabel>Deskripsi</FieldLabel>
        <Input value={values.description} onChange={(e) => onChange('description', e.target.value)} />
      </Field>

      <Calendar22 value={values.startDate} onChange={(d) => onChange('startDate', d)} label="Tanggal Mulai" />
      <Calendar22 value={values.endDate} onChange={(d) => onChange('endDate', d)} label="Tanggal Akhir" />

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
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Surah Mulai</FieldLabel>
              <Select
                value={values.surahStartId ? String(values.surahStartId) : ''}
                onValueChange={(v) => onChange('surahStartId', v ? Number(v) : null)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {surahOptions.find((o) => o.id === values.surahStartId)?.name ?? 'Pilih surah'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {surahOptions.map((opt) => (
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
                value={values.surahEndId ? String(values.surahEndId) : ''}
                onValueChange={(v) => onChange('surahEndId', v ? Number(v) : null)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {surahOptions.find((o) => o.id === values.surahEndId)?.name ?? 'Pilih surah'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {surahOptions.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Ayat Mulai</FieldLabel>
              <Input
                type="number"
                value={values.startAyat ?? ''}
                onChange={(e) => onChange('startAyat', e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
            <Field>
              <FieldLabel>Ayat Akhir</FieldLabel>
              <Input
                type="number"
                value={values.endAyat ?? ''}
                onChange={(e) => onChange('endAyat', e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
          </div>
        </>
      )}

      {showStatus && (
        <>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select
              value={values.status}
              onValueChange={(v) => onChange('status', v as WeeklyTargetFieldValues['status'])}
            >
              <SelectTrigger>
                <SelectValue>
                  {TARGET_STATUS_OPTIONS.find((o) => o.value === values.status)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TARGET_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Progress (%)</FieldLabel>
            <Input
              type="number"
              min={0}
              max={100}
              value={values.progressPercent ?? ''}
              onChange={(e) => onChange('progressPercent', e.target.value ? Number(e.target.value) : null)}
            />
          </Field>
        </>
      )}
    </div>
  );
}
