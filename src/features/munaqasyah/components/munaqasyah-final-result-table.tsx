'use client';

import { useMemo, useState } from 'react';
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
import { FILTER_ALL, TableFilters } from '@/components/layouts/filters/table-filters';
import { BATCH_OPTIONS, GRADE_LABEL } from '../munaqasyah.schema';
import { BATCH_BADGE_CLASS } from './munaqasyah-request-table';
import { GRADE_BADGE_CLASS } from './munaqasyah-result-table';
import type { MunaqasyahFinalResultTableData } from '../queries/list-all-munaqasyah-final-results';

const BATCH_LABEL = Object.fromEntries(BATCH_OPTIONS.map((o) => [o.value, o.label]));
const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

const PASSED_BADGE_CLASS = 'border-transparent bg-[var(--chart-1)]/15 text-[var(--chart-1)]';
const FAILED_BADGE_CLASS = 'border-transparent bg-destructive/15 text-destructive';

interface Props {
  data: MunaqasyahFinalResultTableData[];
  own?: boolean;
}

export function MunaqasyahFinalResultTable({ data, own = false }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [period, setPeriod] = useState(FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
  const [batch, setBatch] = useState(FILTER_ALL);
  const [grade, setGrade] = useState(FILTER_ALL);
  const [status, setStatus] = useState(FILTER_ALL);

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
  const gradeOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.finalGrade, GRADE_LABEL[d.finalGrade] ?? d.finalGrade));
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
          (grade === FILTER_ALL || d.finalGrade === grade) &&
          (status === FILTER_ALL || (status === 'LULUS' ? d.passed : !d.passed)),
      ),
    [data, period, classroomId, groupId, batch, grade, status, own],
  );

  const columns = useMemo<ColumnDef<MunaqasyahFinalResultTableData>[]>(
    () => [
      ...(own
        ? []
        : [
            {
              accessorKey: 'studentName',
              id: 'Nama Siswa',
              header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
            } satisfies ColumnDef<MunaqasyahFinalResultTableData>,
            {
              accessorKey: 'groupName',
              id: 'Kelompok',
              header: 'Kelompok',
            } satisfies ColumnDef<MunaqasyahFinalResultTableData>,
            {
              accessorKey: 'classroomName',
              id: 'Kelas',
              header: 'Kelas',
            } satisfies ColumnDef<MunaqasyahFinalResultTableData>,
          ]),
      { accessorKey: 'juzName', id: 'Juz', header: 'Juz' },
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
      { accessorKey: 'finalScore', id: 'Nilai Akhir', header: 'Nilai Akhir' },
      {
        accessorKey: 'finalGrade',
        id: 'Predikat',
        header: 'Predikat',
        cell: ({ row }) => (
          <Badge className={GRADE_BADGE_CLASS[row.original.finalGrade]}>
            {GRADE_LABEL[row.original.finalGrade] ?? row.original.finalGrade}
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
      title="Nilai Akhir Munaqasyah"
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
          />
        ) : undefined
      }
    />
  );
}
