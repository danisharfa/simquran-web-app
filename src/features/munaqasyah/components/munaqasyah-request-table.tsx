'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DateRange } from 'react-day-picker';
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
import { Check, Trash2, Undo2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { FILTER_ALL, TableFilters, isDateInRange } from '@/components/layouts/filters/table-filters';
import { BATCH_OPTIONS, STAGE_OPTIONS, STATUS_LABEL } from '../munaqasyah.schema';
import { respondMunaqasyahRequest } from '../actions/respond-munaqasyah-request';
import { cancelMunaqasyahRequest } from '../actions/cancel-munaqasyah-request';
import { deleteMunaqasyahRequest } from '../actions/delete-munaqasyah-request';
import { MunaqasyahRequestEditDialog } from './munaqasyah-request-edit-dialog';
import type { MunaqasyahRequestTableData } from '../queries/list-my-munaqasyah-requests';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption } from '@/features/quran-reference/queries/list-reference-options';

const BATCH_LABEL = Object.fromEntries(BATCH_OPTIONS.map((o) => [o.value, o.label]));
const STAGE_LABEL = Object.fromEntries(STAGE_OPTIONS.map((o) => [o.value, o.label]));
const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

export const STATUS_BADGE_CLASS: Record<string, string> = {
  MENUNGGU: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
  DITERIMA: 'border-transparent bg-[var(--chart-1)]/15 text-[var(--chart-1)]',
  DITOLAK: 'border-transparent bg-destructive/15 text-destructive',
  SELESAI: 'border-transparent bg-[var(--chart-2)]/15 text-[var(--chart-2)]',
};

export const BATCH_BADGE_CLASS: Record<string, string> = {
  TAHAP_1: 'border-transparent bg-[var(--chart-1)]/15 text-[var(--chart-1)]',
  TAHAP_2: 'border-transparent bg-[var(--chart-2)]/15 text-[var(--chart-2)]',
  TAHAP_3: 'border-transparent bg-[var(--chart-3)]/15 text-[var(--chart-3)]',
  TAHAP_4: 'border-transparent bg-[var(--chart-4)]/15 text-[var(--chart-4)]',
};

export const STAGE_BADGE_CLASS: Record<string, string> = {
  TASMI: 'border-transparent bg-slate-500/15 text-slate-600 dark:text-slate-400',
  MUNAQASYAH: 'border-transparent bg-[var(--chart-4)]/15 text-[var(--chart-4)]',
};

interface Props {
  data: MunaqasyahRequestTableData[];
  showActions?: boolean;
  editable?: boolean;
  groups?: GroupWithStudents[];
  juzOptions?: ReferenceOption[];
}

interface EditDeleteActionsProps {
  request: MunaqasyahRequestTableData;
  isDeleting: boolean;
  onDelete: (id: string) => Promise<boolean>;
  groups: GroupWithStudents[];
  juzOptions: ReferenceOption[];
}

function EditDeleteActions({ request, isDeleting, onDelete, groups, juzOptions }: EditDeleteActionsProps) {
  if (request.status !== 'MENUNGGU' && request.status !== 'DITOLAK') return null;

  return (
    <div className="flex items-center gap-1">
      <MunaqasyahRequestEditDialog requestId={request.id} groups={groups} juzOptions={juzOptions} />
      <DeleteConfirmDialog
        title="Hapus Permintaan Munaqasyah"
        description={`Apakah Anda yakin ingin menghapus permintaan munaqasyah dari ${request.studentName}? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={() => onDelete(request.id)}
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </Button>
        }
      />
    </div>
  );
}

interface RowActionsProps {
  request: MunaqasyahRequestTableData;
  isProcessing: boolean;
  onRespond: (id: string, accept: boolean) => Promise<boolean>;
  onCancel: (id: string) => Promise<boolean>;
}

function RowActions({ request, isProcessing, onRespond, onCancel }: RowActionsProps) {
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  if (request.status === 'MENUNGGU') {
    return (
      <div className="flex items-center gap-1">
        <AlertDialog open={acceptOpen} onOpenChange={setAcceptOpen}>
          <AlertDialogTrigger
            render={
              <Button size="sm" disabled={isProcessing}>
                <Check className="h-4 w-4" />
                Terima
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Terima Permintaan Munaqasyah</AlertDialogTitle>
              <AlertDialogDescription>
                Yakin ingin menerima permintaan munaqasyah dari {request.studentName}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                disabled={isProcessing}
                onClick={async () => {
                  const success = await onRespond(request.id, true);
                  if (success) setAcceptOpen(false);
                }}
              >
                {isProcessing ? 'Memproses...' : 'Terima'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" size="sm" disabled={isProcessing}>
                <X className="h-4 w-4" />
                Tolak
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tolak Permintaan Munaqasyah</AlertDialogTitle>
              <AlertDialogDescription>
                Yakin ingin menolak permintaan munaqasyah dari {request.studentName}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isProcessing}
                onClick={async () => {
                  const success = await onRespond(request.id, false);
                  if (success) setRejectOpen(false);
                }}
              >
                {isProcessing ? 'Memproses...' : 'Tolak'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  if (request.status === 'DITERIMA' || request.status === 'DITOLAK') {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isProcessing}
        onClick={() => onCancel(request.id)}
      >
        <Undo2 className="h-4 w-4" />
        Batalkan
      </Button>
    );
  }

  return null;
}

export function MunaqasyahRequestTable({
  data,
  showActions = false,
  editable = false,
  groups = [],
  juzOptions = [],
}: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [period, setPeriod] = useState(FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
  const [batch, setBatch] = useState(FILTER_ALL);
  const [stage, setStage] = useState(FILTER_ALL);
  const [status, setStatus] = useState(FILTER_ALL);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const periodOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) =>
      map.set(`${d.academicYear}|${d.semester}`, `${d.academicYear} ${SEMESTER_LABEL[d.semester] ?? d.semester}`),
    );
    return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) => b.value.localeCompare(a.value));
  }, [data]);
  const classroomOptions = useMemo(() => {
    const map = new Map<string, string>();
    data
      .filter((d) => period === FILTER_ALL || `${d.academicYear}|${d.semester}` === period)
      .forEach((d) => map.set(d.classroomId, d.classroomName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data, period]);
  const groupOptions = useMemo(() => {
    const map = new Map<string, string>();
    data
      .filter(
        (d) =>
          (period === FILTER_ALL || `${d.academicYear}|${d.semester}` === period) &&
          (classroomId === FILTER_ALL || d.classroomId === classroomId),
      )
      .forEach((d) => map.set(d.groupId, d.groupName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data, period, classroomId]);

  function handlePeriodChange(value: string) {
    setPeriod(value);
    setClassroomId(FILTER_ALL);
    setGroupId(FILTER_ALL);
  }
  function handleClassroomChange(value: string) {
    setClassroomId(value);
    setGroupId(FILTER_ALL);
  }

  const batchOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.batch, BATCH_LABEL[d.batch] ?? d.batch));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const stageOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.stage, STAGE_LABEL[d.stage] ?? d.stage));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const statusOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.status, STATUS_LABEL[d.status] ?? d.status));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);

  const filteredData = useMemo(
    () =>
      data.filter(
        (d) =>
          (period === FILTER_ALL || `${d.academicYear}|${d.semester}` === period) &&
          (classroomId === FILTER_ALL || d.classroomId === classroomId) &&
          (groupId === FILTER_ALL || d.groupId === groupId) &&
          (batch === FILTER_ALL || d.batch === batch) &&
          (stage === FILTER_ALL || d.stage === stage) &&
          (status === FILTER_ALL || d.status === status) &&
          isDateInRange(d.createdAt, dateRange),
      ),
    [data, period, classroomId, groupId, batch, stage, status, dateRange],
  );

  const handleRespond = useCallback(
    async (id: string, accept: boolean) => {
      setProcessingId(id);
      try {
        const result = await respondMunaqasyahRequest(id, accept);
        if (!result.success) {
          toast.error(result.message);
          return false;
        }
        toast.success(result.message);
        router.refresh();
        return true;
      } finally {
        setProcessingId(null);
      }
    },
    [router],
  );

  const handleCancel = useCallback(
    async (id: string) => {
      setProcessingId(id);
      try {
        const result = await cancelMunaqasyahRequest(id);
        if (!result.success) {
          toast.error(result.message);
          return false;
        }
        toast.success(result.message);
        router.refresh();
        return true;
      } finally {
        setProcessingId(null);
      }
    },
    [router],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteMunaqasyahRequest(id);
        if (!result.success) {
          toast.error(result.message);
          return false;
        }
        toast.success(result.message);
        router.refresh();
        return true;
      } finally {
        setDeletingId(null);
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
      { accessorKey: 'classroomName', id: 'Kelas', header: 'Kelas' },
      {
        accessorKey: 'batch',
        id: 'Batch',
        header: 'Batch',
        cell: ({ row }) => (
          <Badge className={BATCH_BADGE_CLASS[row.original.batch]}>
            {BATCH_LABEL[row.original.batch] ?? row.original.batch}
          </Badge>
        ),
      },
      {
        accessorKey: 'stage',
        id: 'Tahap',
        header: 'Tahap',
        cell: ({ row }) => (
          <Badge className={STAGE_BADGE_CLASS[row.original.stage]}>
            {STAGE_LABEL[row.original.stage] ?? row.original.stage}
          </Badge>
        ),
      },
      { accessorKey: 'juzName', id: 'Juz', header: 'Juz' },
      {
        accessorKey: 'status',
        id: 'Status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge className={STATUS_BADGE_CLASS[row.original.status]}>
            {STATUS_LABEL[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
    ];

    if (!showActions && !editable) return base;

    return [
      ...base,
      {
        id: 'Aksi',
        enableHiding: false,
        header: 'Aksi',
        cell: ({ row }) => {
          if (showActions) {
            if (row.original.status === 'SELESAI') return null;
            const isProcessing = processingId === row.original.id;
            return (
              <RowActions
                request={row.original}
                isProcessing={isProcessing}
                onRespond={handleRespond}
                onCancel={handleCancel}
              />
            );
          }

          const isDeleting = deletingId === row.original.id;
          return (
            <EditDeleteActions
              request={row.original}
              isDeleting={isDeleting}
              onDelete={handleDelete}
              groups={groups}
              juzOptions={juzOptions}
            />
          );
        },
      },
    ];
  }, [showActions, editable, processingId, deletingId, handleRespond, handleCancel, handleDelete, groups, juzOptions]);

  const table = useReactTable({
    data: filteredData,
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
      title="Permintaan Munaqasyah"
      table={table}
      filterColumn="Nama Siswa"
      toolbar={
        data.length > 0 ? (
          <TableFilters
            period={{ value: period, onChange: handlePeriodChange, options: periodOptions }}
            classroom={{ value: classroomId, onChange: handleClassroomChange, options: classroomOptions }}
            group={{ value: groupId, onChange: setGroupId, options: groupOptions }}
            extraFilters={[
              { key: 'batch', label: 'Batch', allLabel: 'Semua Batch', value: batch, onChange: setBatch, options: batchOptions },
              { key: 'stage', label: 'Tahap', allLabel: 'Semua Tahap', value: stage, onChange: setStage, options: stageOptions },
              {
                key: 'status',
                label: 'Status',
                allLabel: 'Semua Status',
                value: status,
                onChange: setStatus,
                options: statusOptions,
              },
            ]}
            dateRange={{ value: dateRange, onChange: setDateRange, label: 'Tanggal Pengajuan' }}
          />
        ) : undefined
      }
    />
  );
}
