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
import { SquareArrowOutUpRight, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { EditGroupNameDialog } from './edit-group-name-dialog';
import { DeleteGroupDialog } from './delete-group-dialog';
import type { GroupTableData } from '../queries/list-groups';

interface Props {
  data: GroupTableData[];
  title: string;
  editable?: boolean;
}

export function GroupTable({ data, title, editable = false }: Props) {
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
        cell: ({ row }) => {
          const group = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/group/${group.id}`)}
              >
                <SquareArrowOutUpRight className="h-4 w-4" />
                Detail
              </Button>

              {editable && (
                <>
                  <EditGroupNameDialog
                    groupId={group.id}
                    currentName={group.name}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    }
                  />
                  <DeleteGroupDialog
                    groupId={group.id}
                    groupName={group.name}
                    trigger={
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </Button>
                    }
                  />
                </>
              )}
            </div>
          );
        },
      },
    ],
    [router, editable],
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
    />
  );
}
