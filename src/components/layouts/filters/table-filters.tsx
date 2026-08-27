'use client';

import type { DateRange } from 'react-day-picker';
import { Field, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/layouts/calendars/date-range-picker';

export const FILTER_ALL = '__ALL__';

export interface FilterOption {
  value: string;
  label: string;
}

export function isDateInRange(date: Date, range?: DateRange): boolean {
  if (!range?.from && !range?.to) return true;

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  if (range.from) {
    const from = new Date(range.from);
    from.setHours(0, 0, 0, 0);
    if (day < from) return false;
  }

  if (range.to) {
    const to = new Date(range.to);
    to.setHours(0, 0, 0, 0);
    if (day > to) return false;
  }

  return true;
}

export function doesRangeOverlap(start: Date, end: Date, range?: DateRange): boolean {
  if (!range?.from && !range?.to) return true;

  const startDay = new Date(start);
  startDay.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  if (range.from) {
    const from = new Date(range.from);
    from.setHours(0, 0, 0, 0);
    if (endDay < from) return false;
  }

  if (range.to) {
    const to = new Date(range.to);
    to.setHours(0, 0, 0, 0);
    if (startDay > to) return false;
  }

  return true;
}

interface SelectFilterConfig {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

export interface ExtraFilterConfig extends SelectFilterConfig {
  key: string;
  label: string;
  allLabel: string;
  className?: string;
}

interface TableFiltersProps {
  period: SelectFilterConfig;
  classroom: SelectFilterConfig;
  group: SelectFilterConfig;
  student?: SelectFilterConfig;
  extraFilters?: ExtraFilterConfig[];
  dateRange?: {
    value: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
    label?: string;
  };
}

function SelectFilter({
  label,
  allLabel,
  className,
  ...config
}: SelectFilterConfig & { label: string; allLabel: string; className: string }) {
  if (config.options.length === 0) return null;

  const selectedLabel =
    config.value === FILTER_ALL ? allLabel : (config.options.find((o) => o.value === config.value)?.label ?? allLabel);

  return (
    <Field className={className}>
      <FieldLabel>{label}</FieldLabel>
      <Select value={config.value} onValueChange={(v) => config.onChange(v ?? FILTER_ALL)}>
        <SelectTrigger>
          <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={FILTER_ALL}>{allLabel}</SelectItem>
          {config.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function TableFilters({ period, classroom, group, student, extraFilters, dateRange }: TableFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <SelectFilter label="Tahun Ajaran" allLabel="Semua Tahun Ajaran" className="w-44" {...period} />
      <SelectFilter label="Kelas" allLabel="Semua Kelas" className="w-32" {...classroom} />
      <SelectFilter label="Kelompok" allLabel="Semua Kelompok" className="w-40" {...group} />
      {student && <SelectFilter label="Siswa" allLabel="Semua Siswa" className="w-44" {...student} />}
      {extraFilters?.map(({ key, className = 'w-40', ...config }) => (
        <SelectFilter key={key} className={className} {...config} />
      ))}
      {dateRange && (
        <Field className="w-auto">
          <FieldLabel>{dateRange.label ?? 'Rentang Tanggal'}</FieldLabel>
          <DateRangePicker value={dateRange.value} onChange={dateRange.onChange} />
        </Field>
      )}
    </div>
  );
}
