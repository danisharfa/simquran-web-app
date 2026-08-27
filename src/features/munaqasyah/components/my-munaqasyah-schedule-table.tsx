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
import { FILTER_ALL, TableFilters, isDateInRange } from '@/components/layouts/filters/table-filters';
import { BATCH_OPTIONS, STAGE_OPTIONS } from '../munaqasyah.schema';
import { BATCH_BADGE_CLASS, STAGE_BADGE_CLASS } from './munaqasyah-request-table';
import { MunaqasyahScheduleParticipantsDialog } from './munaqasyah-schedule-participants-dialog';
import type { MyMunaqasyahScheduleData } from '../queries/list-my-munaqasyah-schedule';

const BATCH_LABEL = Object.fromEntries(BATCH_OPTIONS.map((o) => [o.value, o.label]));
const STAGE_LABEL = Object.fromEntries(STAGE_OPTIONS.map((o) => [o.value, o.label]));
const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

interface Props {
  data: MyMunaqasyahScheduleData[];
  own?: boolean;
}

export function MyMunaqasyahScheduleTable({ data, own = false }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [period, setPeriod] = useState(FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
  const [batch, setBatch] = useState(FILTER_ALL);
  const [stage, setStage] = useState(FILTER_ALL);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const participants = useMemo(() => data.flatMap((d) => d.participants), [data]);

  const periodOptions = useMemo(() => {
    const map = new Map<string, string>();
    participants.forEach((p) =>
      map.set(`${p.academicYear}|${p.semester}`, `${p.academicYear} ${SEMESTER_LABEL[p.semester] ?? p.semester}`),
    );
    return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) => b.value.localeCompare(a.value));
  }, [participants]);
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

  const batchOptions = useMemo(() => {
    const map = new Map<string, string>();
    participants.forEach((p) => map.set(p.batch, BATCH_LABEL[p.batch] ?? p.batch));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [participants]);
  const stageOptions = useMemo(() => {
    const map = new Map<string, string>();
    participants.forEach((p) => map.set(p.stage, STAGE_LABEL[p.stage] ?? p.stage));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [participants]);

  const filteredData = useMemo(
    () =>
      data.filter(
        (d) =>
          (period === FILTER_ALL || d.participants.some((p) => `${p.academicYear}|${p.semester}` === period)) &&
          (own || classroomId === FILTER_ALL || d.participants.some((p) => p.classroomId === classroomId)) &&
          (own || groupId === FILTER_ALL || d.participants.some((p) => p.groupId === groupId)) &&
          (batch === FILTER_ALL || d.participants.some((p) => p.batch === batch)) &&
          (stage === FILTER_ALL || d.participants.some((p) => p.stage === stage)) &&
          isDateInRange(d.date, dateRange),
      ),
    [data, period, classroomId, groupId, batch, stage, dateRange, own],
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
              id: 'Batch',
              header: 'Batch',
              cell: ({ row }) => (
                <Badge className={BATCH_BADGE_CLASS[row.original.participants[0].batch]}>
                  {BATCH_LABEL[row.original.participants[0].batch] ?? row.original.participants[0].batch}
                </Badge>
              ),
            } satisfies ColumnDef<MyMunaqasyahScheduleData>,
            {
              id: 'Tahap',
              header: 'Tahap',
              cell: ({ row }) => (
                <Badge className={STAGE_BADGE_CLASS[row.original.participants[0].stage]}>
                  {STAGE_LABEL[row.original.participants[0].stage] ?? row.original.participants[0].stage}
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

  return (
    <DataTable
      title="Jadwal Munaqasyah"
      table={table}
      toolbar={
        data.length > 0 ? (
          <TableFilters
            period={{ value: period, onChange: handlePeriodChange, options: periodOptions }}
            classroom={own ? undefined : { value: classroomId, onChange: handleClassroomChange, options: classroomOptions }}
            group={own ? undefined : { value: groupId, onChange: setGroupId, options: groupOptions }}
            extraFilters={[
              { key: 'batch', label: 'Batch', allLabel: 'Semua Batch', value: batch, onChange: setBatch, options: batchOptions },
              { key: 'stage', label: 'Tahap', allLabel: 'Semua Tahap', value: stage, onChange: setStage, options: stageOptions },
            ]}
            dateRange={{ value: dateRange, onChange: setDateRange, label: 'Tanggal Jadwal' }}
          />
        ) : undefined
      }
    />
  );
}
