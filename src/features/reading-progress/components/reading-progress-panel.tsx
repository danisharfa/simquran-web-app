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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ProgressChartCard } from './progress-chart-card';
import { getProgressFilters, type ProgressFilterData } from '../actions/get-progress-filters';
import { getProgressCharts, type ProgressChartsResult } from '../actions/get-progress-charts';
import type { Semester } from '@/lib/generated/prisma/enums';

export function ReadingProgressPanel() {
  const [filters, setFilters] = useState<ProgressFilterData | null>(null);
  const [period, setPeriod] = useState('');
  const [classroomId, setClassroomId] = useState('all');
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

    getProgressCharts(
      academicYear,
      semester,
      classroomId === 'all' ? null : classroomId,
      groupId === 'all' ? null : groupId,
    ).then((result) => {
      if (!cancelled) setCharts(result);
    });

    return () => {
      cancelled = true;
    };
  }, [period, classroomId, groupId]);

  if (!filters) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  const classroomsForPeriod = filters.classrooms.filter((c) => c.period === period);
  const groupsForPeriod = filters.groups.filter(
    (g) => g.period === period && (classroomId === 'all' || g.classroomId === classroomId),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Field className="w-56">
          <FieldLabel>Tahun Akademik</FieldLabel>
          <Select
            value={period}
            onValueChange={(v) => {
              setPeriod(v ?? '');
              setClassroomId('all');
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
          <FieldLabel>Kelas</FieldLabel>
          <Select
            value={classroomId}
            onValueChange={(v) => {
              setClassroomId(v ?? 'all');
              setGroupId('all');
            }}
          >
            <SelectTrigger>
              <SelectValue>
                {classroomId === 'all' ? 'Semua Kelas' : classroomsForPeriod.find((c) => c.id === classroomId)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {classroomsForPeriod.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
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
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : (
        <Tabs defaultValue="tahfidz">
          <TabsList>
            <TabsTrigger value="tahfidz">Tahfidz</TabsTrigger>
            <TabsTrigger value="wafa">Wafa</TabsTrigger>
            <TabsTrigger value="tahsin-alquran">Tahsin Al-Qur&apos;an</TabsTrigger>
          </TabsList>

          <TabsContent value="tahfidz">
            <ProgressChartCard
              title="Progres Tahfidz"
              description="Jumlah siswa per juz berdasarkan status penyelesaian tashih Al-Qur'an"
              data={charts.tahfidz}
            />
          </TabsContent>
          <TabsContent value="wafa">
            <ProgressChartCard
              title="Progres Wafa"
              description="Jumlah siswa per buku Wafa berdasarkan halaman yang sudah ditashih"
              data={charts.wafa}
            />
          </TabsContent>
          <TabsContent value="tahsin-alquran">
            <ProgressChartCard
              title="Progres Tahsin Al-Qur'an"
              description="Jumlah siswa per juz berdasarkan setoran tahsin yang lulus"
              data={charts.tahsinAlquran}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
