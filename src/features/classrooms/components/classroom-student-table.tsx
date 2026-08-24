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
import { removeStudentFromClassroom } from '../actions/remove-student-from-classroom';
import type { StudentOption } from '../queries/list-classroom-students';

interface Props {
  classroomId: string;
  data: StudentOption[];
}

export function ClassroomStudentTable({ classroomId, data }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = useCallback(
    async (studentId: string) => {
      setRemovingId(studentId);

      try {
        const result = await removeStudentFromClassroom(classroomId, studentId);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.refresh();
      } finally {
        setRemovingId(null);
      }
    },
    [classroomId, router],
  );

  const columns = useMemo<ColumnDef<StudentOption>[]>(
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
        id: 'Aksi',
        enableHiding: false,
        header: 'Aksi',
        cell: ({ row }) => {
          const student = row.original;
          return (
            <Button
              variant="destructive"
              size="sm"
              disabled={removingId === student.userId}
              onClick={() => handleRemove(student.userId)}
            >
              <Trash2 />
              Hapus
            </Button>
          );
        },
      },
    ],
    [removingId, handleRemove],
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
    <DataTable title="Daftar Siswa" table={table} filterColumn="Nama Siswa" showColumnFilter={false} />
  );
}
