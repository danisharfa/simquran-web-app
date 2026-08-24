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
import { SUBMISSION_TYPE_OPTIONS, ADAB_OPTIONS, SUBMISSION_STATUS_OPTIONS } from '../submission.schema';
import { deleteSubmission } from '../actions/delete-submission';
import { SubmissionEditDialog } from './submission-edit-dialog';
import type { SubmissionTableData } from '../queries/list-my-submissions';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption } from '@/features/quran-reference/queries/list-reference-options';

const TYPE_LABEL = Object.fromEntries(SUBMISSION_TYPE_OPTIONS.map((o) => [o.value, o.label]));
const ADAB_LABEL = Object.fromEntries(ADAB_OPTIONS.map((o) => [o.value, o.label]));
const STATUS_LABEL = Object.fromEntries(SUBMISSION_STATUS_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  data: SubmissionTableData[];
  editable?: boolean;
  groups?: GroupWithStudents[];
  surahOptions?: ReferenceOption[];
  juzOptions?: ReferenceOption[];
  wafaOptions?: ReferenceOption[];
}

export function SubmissionTable({
  data,
  editable = false,
  groups = [],
  surahOptions = [],
  juzOptions = [],
  wafaOptions = [],
}: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteSubmission(id);
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

  const columns = useMemo<ColumnDef<SubmissionTableData>[]>(() => {
    const base: ColumnDef<SubmissionTableData>[] = [
      {
        accessorFn: (row) => row.date,
        id: 'Tanggal',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString('id-ID'),
      },
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
        accessorKey: 'submissionType',
        id: 'Jenis',
        header: 'Jenis',
        cell: ({ row }) => TYPE_LABEL[row.original.submissionType] ?? row.original.submissionType,
      },
      {
        accessorKey: 'detail',
        id: 'Detail',
        header: 'Detail',
      },
      {
        accessorKey: 'adab',
        id: 'Adab',
        header: 'Adab',
        cell: ({ row }) => ADAB_LABEL[row.original.adab] ?? row.original.adab,
      },
      {
        accessorKey: 'submissionStatus',
        id: 'Status',
        header: 'Status',
        cell: ({ row }) => STATUS_LABEL[row.original.submissionStatus] ?? row.original.submissionStatus,
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
            <SubmissionEditDialog
              submissionId={row.original.id}
              groups={groups}
              surahOptions={surahOptions}
              juzOptions={juzOptions}
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
  }, [editable, groups, surahOptions, juzOptions, wafaOptions, deletingId, handleDelete]);

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
      title="Riwayat Setoran"
      table={table}
      filterColumn="Nama Siswa"
      showColumnFilter={false}
    />
  );
}
