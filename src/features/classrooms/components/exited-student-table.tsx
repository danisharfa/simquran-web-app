'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { reactivateStudent } from '../actions/reactivate-student';
import type { ExitedStudentOption } from '../queries/list-exited-students';

const STATUS_LABEL: Record<'PINDAH' | 'KELUAR', string> = {
  PINDAH: 'Pindah Sekolah',
  KELUAR: 'Keluar Sekolah',
};

interface Props {
  data: ExitedStudentOption[];
}

export function ExitedStudentTable({ data }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const handleReactivate = useCallback(
    async (studentId: string) => {
      const result = await reactivateStudent(studentId);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    },
    [router],
  );

  const columns = useMemo<ColumnDef<ExitedStudentOption>[]>(
    () => [
      {
        accessorKey: 'nis',
        id: 'NIS',
        header: ({ column }) => <DataTableColumnHeader column={column} title="NIS" />,
      },
      {
        accessorKey: 'name',
        id: 'Nama Siswa',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
      },
      {
        id: 'Status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant="outline">{STATUS_LABEL[row.original.status as 'PINDAH' | 'KELUAR']}</Badge>
        ),
      },
      {
        id: 'Tanggal Keluar',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal Keluar" />,
        cell: ({ row }) =>
          row.original.exitedAt ? (
            <span>{new Date(row.original.exitedAt).toLocaleDateString('id-ID')}</span>
          ) : (
            '-'
          ),
      },
      {
        id: 'Aksi',
        enableHiding: false,
        header: 'Aksi',
        cell: ({ row }) => {
          const student = row.original;
          return (
            <ConfirmDialog
              title="Aktifkan Kembali Siswa"
              description={`${student.name} akan diaktifkan kembali dan dapat login lagi. Anda perlu menambahkannya ke kelas secara manual.`}
              confirmLabel="Aktifkan"
              onConfirm={() => handleReactivate(student.userId)}
              trigger={
                <Button variant="outline" size="sm">
                  <RotateCcw />
                  Aktifkan Kembali
                </Button>
              }
            />
          );
        },
      },
    ],
    [handleReactivate],
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

  return <DataTable title="Siswa Nonaktif" table={table} filterColumn="Nama Siswa" />;
}
