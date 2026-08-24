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
import { TARGET_TYPE_OPTIONS, TARGET_STATUS_OPTIONS } from '../weekly-target.schema';
import { deleteWeeklyTarget } from '../actions/delete-weekly-target';
import { WeeklyTargetEditDialog } from './weekly-target-edit-dialog';
import type { WeeklyTargetTableData } from '../queries/list-my-weekly-targets';
import type { ReferenceOption } from '@/features/quran-reference/queries/list-reference-options';

const TYPE_LABEL = Object.fromEntries(TARGET_TYPE_OPTIONS.map((o) => [o.value, o.label]));
const STATUS_LABEL = Object.fromEntries(TARGET_STATUS_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  data: WeeklyTargetTableData[];
  editable?: boolean;
  surahOptions?: ReferenceOption[];
  wafaOptions?: ReferenceOption[];
}

export function WeeklyTargetTable({ data, editable = false, surahOptions = [], wafaOptions = [] }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteWeeklyTarget(id);
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        router.refresh();
      } finally {
        setDeletingId(null);
      }
    },
    [router],
  );

  const columns = useMemo<ColumnDef<WeeklyTargetTableData>[]>(() => {
    const base: ColumnDef<WeeklyTargetTableData>[] = [
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
        accessorKey: 'type',
        id: 'Jenis',
        header: 'Jenis',
        cell: ({ row }) => TYPE_LABEL[row.original.type] ?? row.original.type,
      },
      {
        accessorKey: 'description',
        id: 'Deskripsi',
        header: 'Deskripsi',
      },
      {
        accessorFn: (row) => row.startDate,
        id: 'Periode',
        header: 'Periode',
        cell: ({ row }) =>
          `${new Date(row.original.startDate).toLocaleDateString('id-ID')} - ${new Date(row.original.endDate).toLocaleDateString('id-ID')}`,
      },
      {
        accessorKey: 'progressPercent',
        id: 'Progress',
        header: 'Progress',
        cell: ({ row }) => `${row.original.progressPercent ?? 0}%`,
      },
      {
        accessorKey: 'status',
        id: 'Status',
        header: 'Status',
        cell: ({ row }) => STATUS_LABEL[row.original.status] ?? row.original.status,
      },
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
            <WeeklyTargetEditDialog
              targetId={row.original.id}
              surahOptions={surahOptions}
              wafaOptions={wafaOptions}
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={deletingId === row.original.id}
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Hapus</span>
            </Button>
          </div>
        ),
      },
    ];
  }, [editable, surahOptions, wafaOptions, deletingId, handleDelete]);

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
      title="Target Setoran"
      table={table}
      filterColumn="Nama Siswa"
      showColumnFilter={false}
    />
  );
}
