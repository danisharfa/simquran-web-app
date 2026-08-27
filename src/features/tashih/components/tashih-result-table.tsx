'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { deleteTashihResult } from '../actions/delete-tashih-result';
import { TashihResultEditDialog } from './tashih-result-edit-dialog';
import type { TashihResultTableData } from '../queries/list-all-tashih-results';

interface Props {
  data: TashihResultTableData[];
  editable?: boolean;
}

export function TashihResultTable({ data, editable = false }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteTashihResult(id);
        if (!result.success) {
          toast.error(result.message);
          return false;
        }
        toast.success(result.message);
        router.refresh();
        return true;
      } finally {
        setDeletingId(null);
      }
    },
    [router],
  );

  const columns = useMemo<ColumnDef<TashihResultTableData>[]>(() => {
    const base: ColumnDef<TashihResultTableData>[] = [
      {
        accessorKey: 'studentName',
        id: 'Nama Siswa',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
      },
      { accessorKey: 'detail', id: 'Detail', header: 'Detail' },
      {
        accessorFn: (row) => row.scheduleDate,
        id: 'Tanggal',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
        cell: ({ row }) => new Date(row.original.scheduleDate).toLocaleDateString('id-ID'),
      },
      {
        accessorKey: 'passed',
        id: 'Hasil',
        header: 'Hasil',
        cell: ({ row }) => (row.original.passed ? 'Lulus' : 'Tidak Lulus'),
      },
      { accessorKey: 'notes', id: 'Catatan', header: 'Catatan' },
    ];

    if (!editable) return base;

    return [
      ...base,
      {
        id: 'Aksi',
        enableHiding: false,
        header: 'Aksi',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <TashihResultEditDialog
              resultId={row.original.id}
              initialPassed={row.original.passed}
              initialNotes={row.original.notes}
            />
            <DeleteConfirmDialog
              title="Hapus Hasil Tashih"
              description="Apakah Anda yakin ingin menghapus hasil tashih ini? Tindakan ini tidak dapat dibatalkan."
              onConfirm={() => handleDelete(row.original.id)}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={deletingId === row.original.id}
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </Button>
              }
            />
          </div>
        ),
      },
    ];
  }, [editable, deletingId, handleDelete]);

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
    <DataTable title="Hasil Tashih" table={table} filterColumn="Nama Siswa" />
  );
}
