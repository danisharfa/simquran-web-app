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

import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { BATCH_OPTIONS, STAGE_OPTIONS, GRADE_LABEL } from '../munaqasyah.schema';
import type { MunaqasyahResultTableData } from '../queries/list-all-munaqasyah-results';

const BATCH_LABEL = Object.fromEntries(BATCH_OPTIONS.map((o) => [o.value, o.label]));
const STAGE_LABEL = Object.fromEntries(STAGE_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  data: MunaqasyahResultTableData[];
}

export function MunaqasyahResultTable({ data }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<MunaqasyahResultTableData>[]>(
    () => [
      {
        accessorKey: 'studentName',
        id: 'Nama Siswa',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
      },
      {
        accessorKey: 'batch',
        id: 'Batch',
        header: 'Batch',
        cell: ({ row }) => BATCH_LABEL[row.original.batch] ?? row.original.batch,
      },
      {
        accessorKey: 'stage',
        id: 'Tahap',
        header: 'Tahap',
        cell: ({ row }) => STAGE_LABEL[row.original.stage] ?? row.original.stage,
      },
      { accessorKey: 'juzName', id: 'Juz', header: 'Juz' },
      { accessorKey: 'totalScore', id: 'Skor', header: 'Skor' },
      {
        accessorKey: 'grade',
        id: 'Predikat',
        header: 'Predikat',
        cell: ({ row }) => GRADE_LABEL[row.original.grade] ?? row.original.grade,
      },
      {
        accessorKey: 'passed',
        id: 'Status',
        header: 'Status',
        cell: ({ row }) => (row.original.passed ? 'Lulus' : 'Tidak Lulus'),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
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
    <DataTable title="Hasil Penilaian" table={table} filterColumn="Nama Siswa" />
  );
}
