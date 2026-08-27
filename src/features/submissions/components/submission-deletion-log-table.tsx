'use client';

import { useMemo, useState } from 'react';
import {
  ColumnDef,
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
import { SUBMISSION_TYPE_OPTIONS } from '../submission.schema';
import type { SubmissionDeletionLogData } from '../queries/list-submission-deletion-log';

const TYPE_LABEL = Object.fromEntries(SUBMISSION_TYPE_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  data: SubmissionDeletionLogData[];
}

export function SubmissionDeletionLogTable({ data }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<SubmissionDeletionLogData>[]>(
    () => [
      {
        accessorFn: (row) => row.deletedAt,
        id: 'Dihapus Pada',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dihapus Pada" />,
        cell: ({ row }) => row.original.deletedAt.toLocaleString('id-ID'),
      },
      { accessorKey: 'deletedByName', id: 'Dihapus Oleh', header: 'Dihapus Oleh' },
      { accessorKey: 'studentName', id: 'Nama Siswa', header: 'Nama Siswa' },
      { accessorKey: 'groupName', id: 'Kelompok', header: 'Kelompok' },
      { accessorKey: 'classroomName', id: 'Kelas', header: 'Kelas' },
      {
        accessorFn: (row) => row.submissionDate,
        id: 'Tanggal Setoran',
        header: 'Tanggal Setoran',
        cell: ({ row }) => row.original.submissionDate.toLocaleDateString('id-ID'),
      },
      {
        accessorKey: 'submissionType',
        id: 'Jenis',
        header: 'Jenis',
        cell: ({ row }) => TYPE_LABEL[row.original.submissionType] ?? row.original.submissionType,
      },
      { accessorKey: 'detail', id: 'Detail', header: 'Detail' },
      {
        accessorKey: 'note',
        id: 'Catatan',
        header: 'Catatan',
        cell: ({ row }) => row.original.note ?? '-',
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return <DataTable title="Riwayat Penghapusan Setoran" table={table} />;
}
