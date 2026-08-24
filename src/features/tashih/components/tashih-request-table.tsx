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
import { TASHIH_TYPE_OPTIONS, TASHIH_STATUS_LABEL } from '../tashih.schema';
import { respondTashihRequest } from '../actions/respond-tashih-request';
import type { TashihRequestTableData } from '../queries/list-my-tashih-requests';

const TYPE_LABEL = Object.fromEntries(TASHIH_TYPE_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  data: TashihRequestTableData[];
  showActions?: boolean;
}

export function TashihRequestTable({ data, showActions = false }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRespond = useCallback(
    async (id: string, accept: boolean) => {
      setProcessingId(id);
      try {
        const result = await respondTashihRequest(id, accept);
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

  const columns = useMemo<ColumnDef<TashihRequestTableData>[]>(() => {
    const base: ColumnDef<TashihRequestTableData>[] = [
      {
        accessorKey: 'studentName',
        id: 'Nama Siswa',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
      },
      {
        accessorKey: 'groupName',
        id: 'Kelompok',
        header: 'Kelompok',
      },
      {
        accessorKey: 'tashihType',
        id: 'Jenis',
        header: 'Jenis',
        cell: ({ row }) => TYPE_LABEL[row.original.tashihType] ?? row.original.tashihType,
      },
      {
        accessorKey: 'detail',
        id: 'Detail',
        header: 'Detail',
      },
      {
        accessorKey: 'status',
        id: 'Status',
        header: 'Status',
        cell: ({ row }) => TASHIH_STATUS_LABEL[row.original.status] ?? row.original.status,
      },
      {
        accessorKey: 'notes',
        id: 'Catatan',
        header: 'Catatan',
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
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => handleRespond(row.original.id, true)}
              >
                <Check className="h-4 w-4" />
                Terima
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => handleRespond(row.original.id, false)}
              >
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
    <DataTable
      title="Permintaan Tashih"
      table={table}
      filterColumn="Nama Siswa"
      showColumnFilter={false}
    />
  );
}
