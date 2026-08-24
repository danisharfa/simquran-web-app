'use client';

import { useMemo, useState } from 'react';
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
import { SquareArrowOutUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import type { GroupTableData } from '../queries/list-groups';

interface Props {
  data: GroupTableData[];
  title: string;
}

export function GroupTable({ data, title }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<GroupTableData>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'Nama Kelompok',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Kelompok" />,
      },
      {
        accessorKey: 'classroomName',
        id: 'Kelas',
        header: 'Kelas',
      },
      {
        accessorKey: 'teacherName',
        id: 'Guru Pembimbing',
        header: 'Guru Pembimbing',
      },
      {
        accessorKey: 'studentCount',
        id: 'Jumlah Siswa',
        header: 'Jumlah Siswa',
      },
      {
        id: 'Aksi',
        enableHiding: false,
        header: 'Aksi',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => router.push(`/dashboard/group/${row.original.id}`)}
          >
            <SquareArrowOutUpRight className="h-4 w-4" />
            <span className="sr-only">Detail</span>
          </Button>
        ),
      },
    ],
    [router],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
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
      title={title}
      table={table}
      filterColumn="Nama Kelompok"
      showColumnFilter={false}
    />
  );
}
