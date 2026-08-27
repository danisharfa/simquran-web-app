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
import { Button } from '@/components/ui/button';
import { Eye, KeyRound, Trash2 } from 'lucide-react';
import { UserTableData } from '../queries/list-users';
import { useDataTableState } from '@/hooks/use-data-table';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { UserAlertDialog } from './user-alert-dialog';
import { UserDetailDialog } from './user-detail-dialog';

interface Props {
  data: UserTableData[];
  title?: string;
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
  } = useDataTableState<UserTableData, 'detail' | 'reset' | 'delete'>();

  const handleOpenDetailDialog = useCallback(
    (user: UserTableData) => {
      setSelectedUser(user);
      setDialogType('detail');
    },
    [setSelectedUser, setDialogType],
  );

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
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleOpenDetailDialog(user)}>
                <Eye className="h-4 w-4" />
                Detail
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleOpenResetDialog(user)}>
                <KeyRound className="h-4 w-4" />
                Reset Password
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleOpenDeleteDialog(user)}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
          );
        },
      },
    ],
    [handleOpenDetailDialog, handleOpenResetDialog, handleOpenDeleteDialog],
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

      {dialogType === 'detail' && selectedUser && (
        <UserDetailDialog
          userId={selectedUser.id}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedUser(null);
              setDialogType(null);
            }
          }}
          onSuccess={() => router.refresh()}
        />
      )}

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
