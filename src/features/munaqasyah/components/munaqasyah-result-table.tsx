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
import { BATCH_OPTIONS, STAGE_OPTIONS, GRADE_LABEL } from '../munaqasyah.schema';
import { BATCH_BADGE_CLASS, STAGE_BADGE_CLASS } from './munaqasyah-request-table';
import type { MunaqasyahResultTableData } from '../queries/list-all-munaqasyah-results';

const BATCH_LABEL = Object.fromEntries(BATCH_OPTIONS.map((o) => [o.value, o.label]));
const STAGE_LABEL = Object.fromEntries(STAGE_OPTIONS.map((o) => [o.value, o.label]));
const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

export const GRADE_BADGE_CLASS: Record<string, string> = {
  MUMTAZ: 'border-transparent bg-[var(--chart-1)]/15 text-[var(--chart-1)]',
  JAYYID_JIDDAN: 'border-transparent bg-[var(--chart-2)]/15 text-[var(--chart-2)]',
  JAYYID: 'border-transparent bg-[var(--chart-3)]/15 text-[var(--chart-3)]',
  TIDAK_LULUS: 'border-transparent bg-destructive/15 text-destructive',
};

const PASSED_BADGE_CLASS = 'border-transparent bg-[var(--chart-1)]/15 text-[var(--chart-1)]';
const FAILED_BADGE_CLASS = 'border-transparent bg-destructive/15 text-destructive';

interface Props {
  data: MunaqasyahResultTableData[];
  own?: boolean;
}

export function MunaqasyahResultTable({ data, own = false }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [period, setPeriod] = useState(FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
  const [batch, setBatch] = useState(FILTER_ALL);
  const [stage, setStage] = useState(FILTER_ALL);
  const [grade, setGrade] = useState(FILTER_ALL);
  const [status, setStatus] = useState(FILTER_ALL);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const periodOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) =>
      map.set(`${d.academicYear}|${d.semester}`, `${d.academicYear} ${SEMESTER_LABEL[d.semester] ?? d.semester}`),
    );
    return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) => b.value.localeCompare(a.value));
  }, [data]);
  const classroomOptions = useMemo(() => {
    const map = new Map<string, string>();
    data
      .filter((d) => period === FILTER_ALL || `${d.academicYear}|${d.semester}` === period)
      .forEach((d) => map.set(d.classroomId, d.classroomName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data, period]);
  const groupOptions = useMemo(() => {
    const map = new Map<string, string>();
    data
      .filter(
        (d) =>
          (period === FILTER_ALL || `${d.academicYear}|${d.semester}` === period) &&
          (classroomId === FILTER_ALL || d.classroomId === classroomId),
      )
      .forEach((d) => map.set(d.groupId, d.groupName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data, period, classroomId]);

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
    data.forEach((d) => map.set(d.batch, BATCH_LABEL[d.batch] ?? d.batch));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const stageOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.stage, STAGE_LABEL[d.stage] ?? d.stage));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const gradeOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.grade, GRADE_LABEL[d.grade] ?? d.grade));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const statusOptions = useMemo(
    () => [
      { value: 'LULUS', label: 'Lulus' },
      { value: 'TIDAK_LULUS', label: 'Tidak Lulus' },
    ],
    [],
  );

  const filteredData = useMemo(
    () =>
      data.filter(
        (d) =>
          (period === FILTER_ALL || `${d.academicYear}|${d.semester}` === period) &&
          (own || classroomId === FILTER_ALL || d.classroomId === classroomId) &&
          (own || groupId === FILTER_ALL || d.groupId === groupId) &&
          (batch === FILTER_ALL || d.batch === batch) &&
          (stage === FILTER_ALL || d.stage === stage) &&
          (grade === FILTER_ALL || d.grade === grade) &&
          (status === FILTER_ALL || (status === 'LULUS' ? d.passed : !d.passed)) &&
          isDateInRange(d.scheduleDate, dateRange),
      ),
    [data, period, classroomId, groupId, batch, stage, grade, status, dateRange, own],
  );

  const columns = useMemo<ColumnDef<MunaqasyahResultTableData>[]>(
    () => [
      ...(own
        ? []
        : [
            {
              accessorKey: 'studentName',
              id: 'Nama Siswa',
              header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
            } satisfies ColumnDef<MunaqasyahResultTableData>,
            {
              accessorKey: 'groupName',
              id: 'Kelompok',
              header: 'Kelompok',
            } satisfies ColumnDef<MunaqasyahResultTableData>,
            {
              accessorKey: 'classroomName',
              id: 'Kelas',
              header: 'Kelas',
            } satisfies ColumnDef<MunaqasyahResultTableData>,
          ]),
      {
        accessorKey: 'batch',
        id: 'Batch',
        header: 'Batch',
        cell: ({ row }) => (
          <Badge className={BATCH_BADGE_CLASS[row.original.batch]}>
            {BATCH_LABEL[row.original.batch] ?? row.original.batch}
          </Badge>
        ),
      },
      {
        accessorKey: 'stage',
        id: 'Tahap',
        header: 'Tahap',
        cell: ({ row }) => (
          <Badge className={STAGE_BADGE_CLASS[row.original.stage]}>
            {STAGE_LABEL[row.original.stage] ?? row.original.stage}
          </Badge>
        ),
      },
      { accessorKey: 'juzName', id: 'Juz', header: 'Juz' },
      { accessorKey: 'totalScore', id: 'Skor', header: 'Skor' },
      {
        accessorKey: 'grade',
        id: 'Predikat',
        header: 'Predikat',
        cell: ({ row }) => (
          <Badge className={GRADE_BADGE_CLASS[row.original.grade]}>
            {GRADE_LABEL[row.original.grade] ?? row.original.grade}
          </Badge>
        ),
      },
      {
        accessorKey: 'passed',
        id: 'Status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge className={row.original.passed ? PASSED_BADGE_CLASS : FAILED_BADGE_CLASS}>
            {row.original.passed ? 'Lulus' : 'Tidak Lulus'}
          </Badge>
        ),
      },
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
      title="Hasil Penilaian"
      table={table}
      filterColumn={own ? undefined : 'Nama Siswa'}
      toolbar={
        data.length > 0 ? (
          <TableFilters
            period={{ value: period, onChange: handlePeriodChange, options: periodOptions }}
            classroom={own ? undefined : { value: classroomId, onChange: handleClassroomChange, options: classroomOptions }}
            group={own ? undefined : { value: groupId, onChange: setGroupId, options: groupOptions }}
            extraFilters={[
              { key: 'batch', label: 'Batch', allLabel: 'Semua Batch', value: batch, onChange: setBatch, options: batchOptions },
              { key: 'stage', label: 'Tahap', allLabel: 'Semua Tahap', value: stage, onChange: setStage, options: stageOptions },
              {
                key: 'status',
                label: 'Status',
                allLabel: 'Semua Status',
                value: status,
                onChange: setStatus,
                options: statusOptions,
              },
              {
                key: 'grade',
                label: 'Predikat',
                allLabel: 'Semua Predikat',
                value: grade,
                onChange: setGrade,
                options: gradeOptions,
              },
            ]}
            dateRange={{ value: dateRange, onChange: setDateRange, label: 'Tanggal Penilaian' }}
          />
        ) : undefined
      }
    />
  );
}
