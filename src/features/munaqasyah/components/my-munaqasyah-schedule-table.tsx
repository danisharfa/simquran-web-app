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
import { BATCH_OPTIONS, STAGE_OPTIONS } from '../munaqasyah.schema';
import type { MyMunaqasyahScheduleData } from '../queries/list-my-munaqasyah-schedule';

const BATCH_LABEL = Object.fromEntries(BATCH_OPTIONS.map((o) => [o.value, o.label]));
const STAGE_LABEL = Object.fromEntries(STAGE_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  data: MyMunaqasyahScheduleData[];
}

export function MyMunaqasyahScheduleTable({ data }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<MyMunaqasyahScheduleData>[]>(
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
    <DataTable title="Jadwal Munaqasyah" table={table} filterColumn="Nama Siswa" showColumnFilter={false} />
  );
}
