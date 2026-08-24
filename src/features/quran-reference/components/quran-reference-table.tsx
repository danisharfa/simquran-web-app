'use client';

import { useMemo, useState } from 'react';
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import type {
  SurahTableData,
  JuzTableData,
  SurahJuzTableData,
  WafaTableData,
} from '../queries/list-quran-reference';

export function SurahTable({ data }: { data: SurahTableData[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<SurahTableData>[]>(
    () => [
      {
        accessorKey: 'id',
        id: 'No',
        header: ({ column }) => <DataTableColumnHeader column={column} title="No" />,
      },
      {
        accessorKey: 'name',
        id: 'Nama Surah',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Surah" />,
      },
      {
        accessorKey: 'verseCount',
        id: 'Jumlah Ayat',
        header: 'Jumlah Ayat',
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DataTable
      title="Daftar Surah"
      table={table}
      filterColumn="Nama Surah"
      showColumnFilter={false}
    />
  );
}

export function JuzTable({ data }: { data: JuzTableData[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<JuzTableData>[]>(
    () => [
      {
        accessorKey: 'id',
        id: 'No',
        header: ({ column }) => <DataTableColumnHeader column={column} title="No" />,
      },
      {
        accessorKey: 'name',
        id: 'Nama Juz',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Juz" />,
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DataTable title="Daftar Juz" table={table} filterColumn="Nama Juz" showColumnFilter={false} />
  );
}

export function SurahJuzTable({ data }: { data: SurahJuzTableData[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<SurahJuzTableData>[]>(
    () => [
      {
        accessorKey: 'surahName',
        id: 'Nama Surah',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Surah" />,
      },
      {
        accessorKey: 'juzName',
        id: 'Juz',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Juz" />,
      },
      {
        accessorKey: 'startVerse',
        id: 'Ayat Mulai',
        header: 'Ayat Mulai',
      },
      {
        accessorKey: 'endVerse',
        id: 'Ayat Akhir',
        header: 'Ayat Akhir',
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DataTable
      title="Pemetaan Surah – Juz"
      table={table}
      filterColumn="Nama Surah"
      showColumnFilter={false}
    />
  );
}

export function WafaTable({ data }: { data: WafaTableData[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<WafaTableData>[]>(
    () => [
      {
        accessorKey: 'id',
        id: 'No',
        header: ({ column }) => <DataTableColumnHeader column={column} title="No" />,
      },
      {
        accessorKey: 'name',
        id: 'Nama',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
      },
      {
        accessorKey: 'pageCount',
        id: 'Jumlah Halaman',
        header: 'Jumlah Halaman',
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DataTable title="Daftar Wafa" table={table} filterColumn="Nama" showColumnFilter={false} />
  );
}
