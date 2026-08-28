'use client';

import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { FILTER_ALL, TableFilters, isDateInRange, buildPeriodOptions } from '@/components/layouts/filters/table-filters';
import { TAHAP_OPTIONS, JENIS_UJIAN_OPTIONS } from '../munaqasyah.schema';
import { TAHAP_BADGE_CLASS, JENIS_UJIAN_BADGE_CLASS } from './munaqasyah-request-table';
import { MunaqasyahScheduleParticipantsDialog } from './munaqasyah-schedule-participants-dialog';
import { ExportMyMunaqasyahSchedulePdfButton } from './export-my-munaqasyah-schedule-pdf-button';
import { formatDateID } from '@/lib/pdf/format';
import type { MyMunaqasyahScheduleData } from '../queries/list-my-munaqasyah-schedule';

const TAHAP_LABEL = Object.fromEntries(TAHAP_OPTIONS.map((o) => [o.value, o.label]));
const JENIS_UJIAN_LABEL = Object.fromEntries(JENIS_UJIAN_OPTIONS.map((o) => [o.value, o.label]));
const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

interface Props {
  data: MyMunaqasyahScheduleData[];
  own?: boolean;
  currentPeriod?: string;
  schoolInfo?: { schoolName: string; schoolAddress: string | null };
  exportedBy?: { name: string; role: string };
}

export function MyMunaqasyahScheduleTable({ data, own = false, currentPeriod, schoolInfo, exportedBy }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [period, setPeriod] = useState(currentPeriod ?? FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
  const [tahap, setTahap] = useState(FILTER_ALL);
  const [jenis, setJenis] = useState(FILTER_ALL);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const participants = useMemo(() => data.flatMap((d) => d.participants), [data]);

  const periodOptions = useMemo(
    () => buildPeriodOptions(participants, (p) => p.academicYear, (p) => p.semester, SEMESTER_LABEL, currentPeriod),
    [participants, currentPeriod],
  );
  const classroomOptions = useMemo(() => {
    const map = new Map<string, string>();
    participants
      .filter((p) => period === FILTER_ALL || `${p.academicYear}|${p.semester}` === period)
      .forEach((p) => map.set(p.classroomId, p.classroomName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [participants, period]);
  const groupOptions = useMemo(() => {
    const map = new Map<string, string>();
    participants
      .filter(
        (p) =>
          (period === FILTER_ALL || `${p.academicYear}|${p.semester}` === period) &&
          (classroomId === FILTER_ALL || p.classroomId === classroomId),
      )
      .forEach((p) => map.set(p.groupId, p.groupName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [participants, period, classroomId]);

  function handlePeriodChange(value: string) {
    setPeriod(value);
    setClassroomId(FILTER_ALL);
    setGroupId(FILTER_ALL);
  }
  function handleClassroomChange(value: string) {
    setClassroomId(value);
    setGroupId(FILTER_ALL);
  }

  const tahapOptions = useMemo(() => {
    const map = new Map<string, string>();
    participants.forEach((p) => map.set(p.tahap, TAHAP_LABEL[p.tahap] ?? p.tahap));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [participants]);
  const jenisOptions = useMemo(() => {
    const map = new Map<string, string>();
    participants.forEach((p) => map.set(p.jenis, JENIS_UJIAN_LABEL[p.jenis] ?? p.jenis));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [participants]);

  const filteredData = useMemo(
    () =>
      data.filter(
        (d) =>
          (period === FILTER_ALL || d.participants.some((p) => `${p.academicYear}|${p.semester}` === period)) &&
          (own || classroomId === FILTER_ALL || d.participants.some((p) => p.classroomId === classroomId)) &&
          (own || groupId === FILTER_ALL || d.participants.some((p) => p.groupId === groupId)) &&
          (tahap === FILTER_ALL || d.participants.some((p) => p.tahap === tahap)) &&
          (jenis === FILTER_ALL || d.participants.some((p) => p.jenis === jenis)) &&
          isDateInRange(d.date, dateRange),
      ),
    [data, period, classroomId, groupId, tahap, jenis, dateRange, own],
  );

  const columns = useMemo<ColumnDef<MyMunaqasyahScheduleData>[]>(
    () => [
      {
        accessorFn: (row) => row.date,
        id: 'Tanggal',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString('id-ID'),
      },
      { accessorKey: 'sessionName', id: 'Sesi', header: 'Sesi' },
      {
        id: 'Waktu',
        header: 'Waktu',
        cell: ({ row }) => `${row.original.startTime} - ${row.original.endTime}`,
      },
      { accessorKey: 'location', id: 'Lokasi', header: 'Lokasi' },
      ...(own
        ? [
            {
              id: 'Tahap',
              header: 'Tahap',
              cell: ({ row }) => (
                <Badge className={TAHAP_BADGE_CLASS[row.original.participants[0].tahap]}>
                  {TAHAP_LABEL[row.original.participants[0].tahap] ?? row.original.participants[0].tahap}
                </Badge>
              ),
            } satisfies ColumnDef<MyMunaqasyahScheduleData>,
            {
              id: 'Jenis Ujian',
              header: 'Jenis Ujian',
              cell: ({ row }) => (
                <Badge className={JENIS_UJIAN_BADGE_CLASS[row.original.participants[0].jenis]}>
                  {JENIS_UJIAN_LABEL[row.original.participants[0].jenis] ?? row.original.participants[0].jenis}
                </Badge>
              ),
            } satisfies ColumnDef<MyMunaqasyahScheduleData>,
            {
              id: 'Juz',
              header: 'Juz',
              cell: ({ row }) => row.original.participants[0].juzName,
            } satisfies ColumnDef<MyMunaqasyahScheduleData>,
          ]
        : [
            {
              id: 'Jumlah Peserta',
              header: 'Jumlah Peserta',
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  <MunaqasyahScheduleParticipantsDialog
                    sessionName={row.original.sessionName}
                    date={row.original.date}
                    startTime={row.original.startTime}
                    endTime={row.original.endTime}
                    location={row.original.location}
                    participants={row.original.participants}
                  />
                  <span>{row.original.participants.length}</span>
                </div>
              ),
            } satisfies ColumnDef<MyMunaqasyahScheduleData>,
          ]),
    ],
    [own],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const periodLabel = useMemo(() => {
    if (period === FILTER_ALL) return undefined;
    const label = periodOptions.find((o) => o.value === period)?.label;
    return label ? `Tahun Akademik ${label}` : undefined;
  }, [period, periodOptions]);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (!own) {
      const classroomLabel = classroomOptions.find((o) => o.value === classroomId)?.label;
      if (classroomId !== FILTER_ALL && classroomLabel) parts.push(`Kelas: ${classroomLabel}`);
      const groupLabel = groupOptions.find((o) => o.value === groupId)?.label;
      if (groupId !== FILTER_ALL && groupLabel) parts.push(`Kelompok: ${groupLabel}`);
    }
    const tahapLabel = tahapOptions.find((o) => o.value === tahap)?.label;
    if (tahap !== FILTER_ALL && tahapLabel) parts.push(`Tahap: ${tahapLabel}`);
    const jenisLabel = jenisOptions.find((o) => o.value === jenis)?.label;
    if (jenis !== FILTER_ALL && jenisLabel) parts.push(`Jenis Ujian: ${jenisLabel}`);
    if (dateRange?.from || dateRange?.to) {
      parts.push(
        `Tanggal Jadwal: ${dateRange.from ? formatDateID(dateRange.from) : '...'} - ${dateRange.to ? formatDateID(dateRange.to) : '...'}`,
      );
    }
    return parts.length > 0 ? parts.join(' • ') : undefined;
  }, [own, classroomId, classroomOptions, groupId, groupOptions, tahap, tahapOptions, jenis, jenisOptions, dateRange]);

  return (
    <DataTable
      title="Jadwal Munaqasyah"
      titleAction={
        data.length > 0 && schoolInfo && exportedBy ? (
          <ExportMyMunaqasyahSchedulePdfButton
            table={table}
            own={own}
            schoolInfo={schoolInfo}
            exportedBy={exportedBy}
            periodLabel={periodLabel}
            filterSummary={filterSummary}
          />
        ) : undefined
      }
      table={table}
      toolbar={
        data.length > 0 ? (
          <TableFilters
            period={{ value: period, onChange: handlePeriodChange, options: periodOptions }}
            classroom={own ? undefined : { value: classroomId, onChange: handleClassroomChange, options: classroomOptions }}
            group={own ? undefined : { value: groupId, onChange: setGroupId, options: groupOptions }}
            extraFilters={[
              { key: 'tahap', label: 'Tahap', allLabel: 'Semua Tahap', value: tahap, onChange: setTahap, options: tahapOptions },
              { key: 'jenis', label: 'Jenis Ujian', allLabel: 'Semua Jenis Ujian', value: jenis, onChange: setJenis, options: jenisOptions },
            ]}
            dateRange={{ value: dateRange, onChange: setDateRange, label: 'Tanggal Jadwal' }}
          />
        ) : undefined
      }
    />
  );
}
