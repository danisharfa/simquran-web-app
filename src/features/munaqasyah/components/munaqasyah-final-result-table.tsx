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
import { BATCH_OPTIONS, GRADE_LABEL } from '../munaqasyah.schema';
import type { MunaqasyahFinalResultTableData } from '../queries/list-all-munaqasyah-final-results';

const BATCH_LABEL = Object.fromEntries(BATCH_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  data: MunaqasyahFinalResultTableData[];
}

export function MunaqasyahFinalResultTable({ data }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<MunaqasyahFinalResultTableData>[]>(
    () => [
      {
        accessorKey: 'studentName',
        id: 'Nama Siswa',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
      },
      { accessorKey: 'groupName', id: 'Kelompok', header: 'Kelompok' },
      { accessorKey: 'juzName', id: 'Juz', header: 'Juz' },
      {
        accessorKey: 'batch',
        id: 'Batch',
        header: 'Batch',
        cell: ({ row }) => BATCH_LABEL[row.original.batch] ?? row.original.batch,
      },
      { accessorKey: 'finalScore', id: 'Nilai Akhir', header: 'Nilai Akhir' },
      {
        accessorKey: 'finalGrade',
        id: 'Predikat',
        header: 'Predikat',
        cell: ({ row }) => GRADE_LABEL[row.original.finalGrade] ?? row.original.finalGrade,
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
    <DataTable title="Nilai Akhir Munaqasyah" table={table} filterColumn="Nama Siswa" />
  );
}
