'use client';

import { useEffect, useState } from 'react';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ProgressChartCard } from './progress-chart-card';
import { getProgressFilters, type ProgressFilterData } from '../actions/get-progress-filters';
import { getProgressCharts, type ProgressChartsResult } from '../actions/get-progress-charts';
import type { Semester } from '@/lib/generated/prisma/enums';

export function ReadingProgressPanel() {
  const [filters, setFilters] = useState<ProgressFilterData | null>(null);
  const [period, setPeriod] = useState('');
  const [groupId, setGroupId] = useState('all');
  const [charts, setCharts] = useState<ProgressChartsResult | null>(null);

  useEffect(() => {
    getProgressFilters().then((data) => {
      setFilters(data);
      setPeriod(data.defaultPeriod);
    });
  }, []);

  useEffect(() => {
    if (!period) return;

    let cancelled = false;
    const [academicYear, semester] = period.split('|') as [string, Semester];

    getProgressCharts(academicYear, semester, groupId === 'all' ? null : groupId).then((result) => {
      if (!cancelled) setCharts(result);
    });

    return () => {
      cancelled = true;
    };
  }, [period, groupId]);

  if (!filters) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  const groupsForPeriod = filters.groups.filter((g) => g.period === period);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Field className="w-56">
          <FieldLabel>Tahun Akademik</FieldLabel>
          <Select
            value={period}
            onValueChange={(v) => {
              setPeriod(v ?? '');
              setGroupId('all');
            }}
          >
            <SelectTrigger>
              <SelectValue>{filters.periods.find((p) => p.value === period)?.label ?? 'Pilih periode'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filters.periods.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field className="w-56">
          <FieldLabel>Kelompok</FieldLabel>
          <Select value={groupId} onValueChange={(v) => setGroupId(v ?? 'all')}>
            <SelectTrigger>
              <SelectValue>
                {groupId === 'all' ? 'Semua Kelompok' : groupsForPeriod.find((g) => g.id === groupId)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelompok</SelectItem>
              {groupsForPeriod.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {!charts ? (
        <div className="space-y-3">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <ProgressChartCard
            title="Progres Tahfidz"
            description="Jumlah siswa per juz berdasarkan status penyelesaian tashih Al-Qur'an"
            data={charts.tahfidz}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ProgressChartCard
              title="Progres Wafa"
              description="Jumlah siswa per buku Wafa berdasarkan halaman yang sudah ditashih"
              data={charts.wafa}
            />
            <ProgressChartCard
              title="Progres Tahsin Al-Qur'an"
              description="Jumlah siswa per juz berdasarkan setoran tahsin yang lulus"
              data={charts.tahsinAlquran}
            />
          </div>
        </div>
      )}
    </div>
  );
}
