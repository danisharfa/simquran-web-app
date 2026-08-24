'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { KeyRound, MoreVertical, SquareArrowOutUpRight, Trash2 } from 'lucide-react';
import { UserTableData } from '../actions/list-users';
import { useDataTableState } from '@/hooks/use-data-table';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { UserAlertDialog } from './user-alert-dialog';

interface Props {
  data: UserTableData[];
  title: string;
}

export function UserTable({ data, title }: Props) {
  const router = useRouter();

  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    selectedItem: selectedUser,
    setSelectedItem: setSelectedUser,
    dialogType,
    setDialogType,
  } = useDataTableState<UserTableData, 'reset' | 'delete'>();

  const handleOpenResetDialog = useCallback(
    (user: UserTableData) => {
      setSelectedUser(user);
      setDialogType('reset');
    },
    [setSelectedUser, setDialogType],
  );

  const handleOpenDeleteDialog = useCallback(
    (user: UserTableData) => {
      setSelectedUser(user);
      setDialogType('delete');
    },
    [setSelectedUser, setDialogType],
  );

  const columns = useMemo<ColumnDef<UserTableData>[]>(
    () => [
      {
        accessorKey: 'username',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
      },
      {
        accessorKey: 'name',
        id: 'Nama Lengkap',
        header: 'Nama Lengkap',
      },
      {
        accessorKey: 'createdAt',
        id: 'Created At',
        header: 'Dibuat Pada',
        cell: ({ row }) => (
          <span>{new Date(row.getValue('Created At')).toLocaleDateString('id-ID')}</span>
        ),
      },
      {
        accessorKey: 'updatedAt',
        id: 'Updated At',
        header: 'Diperbarui Pada',
        cell: ({ row }) => (
          <span>{new Date(row.getValue('Updated At')).toLocaleDateString('id-ID')}</span>
        ),
      },
      {
        id: 'actions',
        enableHiding: false,
        header: 'Aksi',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">User Option</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-50 z-50">
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/users/${user.id}`)}
                  className="flex items-center gap-2"
                >
                  <SquareArrowOutUpRight />
                  Detail
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleOpenResetDialog(user)}
                  className="flex items-center gap-2"
                >
                  <KeyRound />
                  Reset Password
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleOpenDeleteDialog(user)}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash2 />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router, handleOpenResetDialog, handleOpenDeleteDialog],
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
    <>
      <DataTable title={title} table={table} filterColumn="Nama Lengkap" showColumnFilter={false} />

      {dialogType === 'reset' && selectedUser && (
        <UserAlertDialog
          user={selectedUser}
          type="reset"
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedUser(null);
              setDialogType(null);
            }
          }}
          onConfirm={() => {
            router.refresh();
            setSelectedUser(null);
            setDialogType(null);
          }}
        />
      )}

      {dialogType === 'delete' && selectedUser && (
        <UserAlertDialog
          user={selectedUser}
          type="delete"
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedUser(null);
              setDialogType(null);
            }
          }}
          onConfirm={() => {
            router.refresh();
            setSelectedUser(null);
            setDialogType(null);
          }}
        />
      )}
    </>
  );
}
