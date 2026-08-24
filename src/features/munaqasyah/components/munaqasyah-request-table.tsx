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
import { Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { BATCH_OPTIONS, STAGE_OPTIONS, STATUS_LABEL } from '../munaqasyah.schema';
import { respondMunaqasyahRequest } from '../actions/respond-munaqasyah-request';
import type { MunaqasyahRequestTableData } from '../queries/list-my-munaqasyah-requests';

const BATCH_LABEL = Object.fromEntries(BATCH_OPTIONS.map((o) => [o.value, o.label]));
const STAGE_LABEL = Object.fromEntries(STAGE_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  data: MunaqasyahRequestTableData[];
  showActions?: boolean;
}

export function MunaqasyahRequestTable({ data, showActions = false }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRespond = useCallback(
    async (id: string, accept: boolean) => {
      setProcessingId(id);
      try {
        const result = await respondMunaqasyahRequest(id, accept);
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        router.refresh();
      } finally {
        setProcessingId(null);
      }
    },
    [router],
  );

  const columns = useMemo<ColumnDef<MunaqasyahRequestTableData>[]>(() => {
    const base: ColumnDef<MunaqasyahRequestTableData>[] = [
      {
        accessorKey: 'studentName',
        id: 'Nama Siswa',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
      },
      { accessorKey: 'groupName', id: 'Kelompok', header: 'Kelompok' },
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
        accessorKey: 'status',
        id: 'Status',
        header: 'Status',
        cell: ({ row }) => STATUS_LABEL[row.original.status] ?? row.original.status,
      },
    ];

    if (!showActions) return base;

    return [
      ...base,
      {
        id: 'Aksi',
        enableHiding: false,
        header: 'Aksi',
        cell: ({ row }) => {
          if (row.original.status !== 'MENUNGGU') return null;
          const isProcessing = processingId === row.original.id;
          return (
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={isProcessing} onClick={() => handleRespond(row.original.id, true)}>
                <Check className="h-4 w-4" />
                Terima
              </Button>
              <Button variant="outline" size="sm" disabled={isProcessing} onClick={() => handleRespond(row.original.id, false)}>
                <X className="h-4 w-4" />
                Tolak
              </Button>
            </div>
          );
        },
      },
    ];
  }, [showActions, processingId, handleRespond]);

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
    <DataTable title="Permintaan Munaqasyah" table={table} filterColumn="Nama Siswa" showColumnFilter={false} />
  );
}
