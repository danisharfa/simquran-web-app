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
import { deleteMunaqasyahSchedule } from '../actions/delete-munaqasyah-schedule';
import type { MunaqasyahScheduleTableData } from '../queries/list-munaqasyah-schedules';

interface Props {
  data: MunaqasyahScheduleTableData[];
}

export function MunaqasyahScheduleTable({ data }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteMunaqasyahSchedule(id);
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

  const columns = useMemo<ColumnDef<MunaqasyahScheduleTableData>[]>(
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
      {
        accessorKey: 'examinerName',
        id: 'Penguji',
        header: 'Penguji',
        cell: ({ row }) => row.original.examinerName ?? '-',
      },
      { accessorKey: 'requestCount', id: 'Jumlah Peserta', header: 'Jumlah Peserta' },
      {
        id: 'Aksi',
        enableHiding: false,
        header: 'Aksi',
        cell: ({ row }) => (
          <DeleteConfirmDialog
            title="Hapus Jadwal Munaqasyah"
            description="Apakah Anda yakin ingin menghapus jadwal munaqasyah ini? Tindakan ini tidak dapat dibatalkan."
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
        ),
      },
    ],
    [deletingId, handleDelete],
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
    <DataTable title="Jadwal Munaqasyah" table={table} filterColumn="Sesi" />
  );
}
