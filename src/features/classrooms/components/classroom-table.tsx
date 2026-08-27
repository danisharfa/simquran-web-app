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
import { EditClassroomNameDialog } from './edit-classroom-name-dialog';
import { DeleteClassroomDialog } from './delete-classroom-dialog';
import type { ClassroomTableData } from '../queries/list-classrooms';

const SEMESTER_LABEL: Record<'GANJIL' | 'GENAP', string> = {
  GANJIL: 'Ganjil',
  GENAP: 'Genap',
};

interface Props {
  data: ClassroomTableData[];
  title: string;
  editable?: boolean;
}

export function ClassroomTable({ data, title, editable = false }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<ClassroomTableData>[]>(
    () => [
      {
        accessorKey: 'level',
        id: 'Level',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kelas" />,
      },
      {
        accessorKey: 'name',
        id: 'Nama Kelas',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Kelas" />,
      },
      {
        accessorKey: 'academicYear',
        id: 'Tahun Ajaran',
        header: 'Tahun Ajaran',
      },
      {
        accessorKey: 'semester',
        id: 'Semester',
        header: 'Semester',
        cell: ({ row }) => (
          <span>{SEMESTER_LABEL[row.getValue<'GANJIL' | 'GENAP'>('Semester')]}</span>
        ),
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
          const classroom = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/classrooms/${classroom.id}`)}
              >
                <SquareArrowOutUpRight className="h-4 w-4" />
                Detail
              </Button>

              {editable && (
                <>
                  <EditClassroomNameDialog
                    classroomId={classroom.id}
                    currentName={classroom.name}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    }
                  />
                  <DeleteClassroomDialog
                    classroomId={classroom.id}
                    classroomName={classroom.name}
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
    <DataTable title={title} table={table} filterColumn="Nama Kelas" showColumnFilter={false} />
  );
}
