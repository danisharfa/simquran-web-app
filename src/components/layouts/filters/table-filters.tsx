'use client';

import type { DateRange } from 'react-day-picker';
import { ListFilterIcon, XIcon } from 'lucide-react';
import { Field, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
}

interface TableFiltersProps {
  period: SelectFilterConfig;
  classroom?: SelectFilterConfig;
  group?: SelectFilterConfig;
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
  className = 'w-full',
  ...config
}: SelectFilterConfig & { label: string; allLabel: string; className?: string }) {
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
  const hasAdvanced = Boolean(classroom || group || student || (extraFilters && extraFilters.length > 0) || dateRange);

  const activeCount =
    (classroom && classroom.value !== FILTER_ALL ? 1 : 0) +
    (group && group.value !== FILTER_ALL ? 1 : 0) +
    (student && student.value !== FILTER_ALL ? 1 : 0) +
    (extraFilters?.filter((f) => f.value !== FILTER_ALL).length ?? 0) +
    (dateRange?.value?.from || dateRange?.value?.to ? 1 : 0);

  function handleReset() {
    classroom?.onChange(FILTER_ALL);
    group?.onChange(FILTER_ALL);
    student?.onChange(FILTER_ALL);
    extraFilters?.forEach((f) => f.onChange(FILTER_ALL));
    dateRange?.onChange(undefined);
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <SelectFilter label="Tahun Ajaran" allLabel="Semua Tahun Ajaran" className="w-44" {...period} />

      {hasAdvanced && (
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" className="gap-2">
                <ListFilterIcon className="size-4" />
                Filter
                {activeCount > 0 && (
                  <Badge variant="secondary" className="rounded-full px-1.5 tabular-nums">
                    {activeCount}
                  </Badge>
                )}
              </Button>
            }
          />
          <PopoverContent className="w-80" align="start">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Filter</p>
              {activeCount > 0 && (
                <Button variant="ghost" size="sm" className="h-auto gap-1 p-1 text-xs" onClick={handleReset}>
                  <XIcon className="size-3.5" />
                  Reset
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {classroom && <SelectFilter label="Kelas" allLabel="Semua Kelas" {...classroom} />}
              {group && <SelectFilter label="Kelompok" allLabel="Semua Kelompok" {...group} />}
              {student && <SelectFilter label="Siswa" allLabel="Semua Siswa" {...student} />}
              {extraFilters?.map(({ key, ...config }) => (
                <SelectFilter key={key} {...config} />
              ))}
              {dateRange && (
                <Field className="w-full">
                  <FieldLabel>{dateRange.label ?? 'Rentang Tanggal'}</FieldLabel>
                  <DateRangePicker value={dateRange.value} onChange={dateRange.onChange} className="w-full" />
                </Field>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
