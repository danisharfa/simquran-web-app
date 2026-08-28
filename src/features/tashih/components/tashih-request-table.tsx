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
import { FILTER_ALL, TableFilters, isDateInRange, buildPeriodOptions } from '@/components/layouts/filters/table-filters';
import { TASHIH_TYPE_OPTIONS, TASHIH_STATUS_LABEL } from '../tashih.schema';
import { respondTashihRequest } from '../actions/respond-tashih-request';
import { cancelTashihRequest } from '../actions/cancel-tashih-request';
import { deleteTashihRequest } from '../actions/delete-tashih-request';
import { TashihRequestEditDialog } from './tashih-request-edit-dialog';
import type { TashihRequestTableData } from '../queries/list-my-tashih-requests';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

const TYPE_LABEL = Object.fromEntries(TASHIH_TYPE_OPTIONS.map((o) => [o.value, o.label]));
const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

const TYPE_BADGE_CLASS: Record<string, string> = {
  ALQURAN: 'border-transparent bg-[var(--chart-2)]/15 text-[var(--chart-2)]',
  WAFA: 'border-transparent bg-[var(--chart-4)]/15 text-[var(--chart-4)]',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  MENUNGGU: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
  DITERIMA: 'border-transparent bg-[var(--chart-1)]/15 text-[var(--chart-1)]',
  DITOLAK: 'border-transparent bg-destructive/15 text-destructive',
  SELESAI: 'border-transparent bg-[var(--chart-2)]/15 text-[var(--chart-2)]',
};

interface Props {
  data: TashihRequestTableData[];
  showActions?: boolean;
  editable?: boolean;
  groups?: GroupWithStudents[];
  surahOptions?: ReferenceOption[];
  juzOptions?: ReferenceOption[];
  surahJuzMap?: SurahJuzMapping[];
  wafaOptions?: ReferenceOption[];
  currentPeriod?: string;
}

interface EditDeleteActionsProps {
  request: TashihRequestTableData;
  isDeleting: boolean;
  onDelete: (id: string) => Promise<boolean>;
  groups: GroupWithStudents[];
  surahOptions: ReferenceOption[];
  juzOptions: ReferenceOption[];
  surahJuzMap: SurahJuzMapping[];
  wafaOptions: ReferenceOption[];
}

function EditDeleteActions({
  request,
  isDeleting,
  onDelete,
  groups,
  surahOptions,
  juzOptions,
  surahJuzMap,
  wafaOptions,
}: EditDeleteActionsProps) {
  if (request.status !== 'MENUNGGU' && request.status !== 'DITOLAK') return null;

  return (
    <div className="flex items-center gap-1">
      <TashihRequestEditDialog
        requestId={request.id}
        groups={groups}
        surahOptions={surahOptions}
        juzOptions={juzOptions}
        surahJuzMap={surahJuzMap}
        wafaOptions={wafaOptions}
      />
      <DeleteConfirmDialog
        title="Hapus Permintaan Tashih"
        description={`Apakah Anda yakin ingin menghapus permintaan tashih dari ${request.studentName}? Tindakan ini tidak dapat dibatalkan.`}
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
  request: TashihRequestTableData;
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
              <AlertDialogTitle>Terima Permintaan Tashih</AlertDialogTitle>
              <AlertDialogDescription>
                Yakin ingin menerima permintaan tashih dari {request.studentName}?
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
              <AlertDialogTitle>Tolak Permintaan Tashih</AlertDialogTitle>
              <AlertDialogDescription>
                Yakin ingin menolak permintaan tashih dari {request.studentName}?
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

export function TashihRequestTable({
  data,
  showActions = false,
  editable = false,
  groups = [],
  surahOptions = [],
  juzOptions = [],
  surahJuzMap = [],
  wafaOptions = [],
  currentPeriod,
}: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [period, setPeriod] = useState(currentPeriod ?? FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
  const [tashihType, setTashihType] = useState(FILTER_ALL);
  const [juz, setJuz] = useState(FILTER_ALL);
  const [surah, setSurah] = useState(FILTER_ALL);
  const [status, setStatus] = useState(FILTER_ALL);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const periodOptions = useMemo(
    () => buildPeriodOptions(data, (d) => d.academicYear, (d) => d.semester, SEMESTER_LABEL, currentPeriod),
    [data, currentPeriod],
  );
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

  const typeOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.tashihType, TYPE_LABEL[d.tashihType] ?? d.tashihType));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const statusOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.status, TASHIH_STATUS_LABEL[d.status] ?? d.status));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const juzFilterOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => {
      if (d.juzId != null) map.set(String(d.juzId), d.juzName ?? String(d.juzId));
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const surahFilterOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => {
      if (d.surahId != null) map.set(String(d.surahId), d.surahName ?? String(d.surahId));
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);

  const filteredData = useMemo(
    () =>
      data.filter(
        (d) =>
          (period === FILTER_ALL || `${d.academicYear}|${d.semester}` === period) &&
          (classroomId === FILTER_ALL || d.classroomId === classroomId) &&
          (groupId === FILTER_ALL || d.groupId === groupId) &&
          (tashihType === FILTER_ALL || d.tashihType === tashihType) &&
          (juz === FILTER_ALL || String(d.juzId) === juz) &&
          (surah === FILTER_ALL || String(d.surahId) === surah) &&
          (status === FILTER_ALL || d.status === status) &&
          isDateInRange(d.createdAt, dateRange),
      ),
    [data, period, classroomId, groupId, tashihType, juz, surah, status, dateRange],
  );

  const handleRespond = useCallback(
    async (id: string, accept: boolean) => {
      setProcessingId(id);
      try {
        const result = await respondTashihRequest(id, accept);
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
        const result = await cancelTashihRequest(id);
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
        const result = await deleteTashihRequest(id);
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

  const columns = useMemo<ColumnDef<TashihRequestTableData>[]>(() => {
    const base: ColumnDef<TashihRequestTableData>[] = [
      {
        accessorKey: 'nis',
        id: 'NIS',
        header: 'NIS',
      },
      {
        accessorKey: 'studentName',
        id: 'Nama Siswa',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
      },
      {
        accessorKey: 'classroomName',
        id: 'Kelas',
        header: 'Kelas',
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
        cell: ({ row }) => (
          <Badge className={TYPE_BADGE_CLASS[row.original.tashihType]}>
            {TYPE_LABEL[row.original.tashihType] ?? row.original.tashihType}
          </Badge>
        ),
      },
      {
        accessorKey: 'juzName',
        id: 'Juz',
        header: 'Juz',
        cell: ({ row }) => row.original.juzName ?? '-',
      },
      {
        id: 'Surah',
        header: 'Surah',
        cell: ({ row }) => (row.original.tashihType === 'WAFA' ? row.original.detail : (row.original.surahName ?? '-')),
      },
      {
        accessorKey: 'status',
        id: 'Status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge className={STATUS_BADGE_CLASS[row.original.status]}>
            {TASHIH_STATUS_LABEL[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'notes',
        id: 'Catatan',
        header: 'Catatan',
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
              surahOptions={surahOptions}
              juzOptions={juzOptions}
              surahJuzMap={surahJuzMap}
              wafaOptions={wafaOptions}
            />
          );
        },
      },
    ];
  }, [
    showActions,
    editable,
    processingId,
    deletingId,
    handleRespond,
    handleCancel,
    handleDelete,
    groups,
    surahOptions,
    juzOptions,
    surahJuzMap,
    wafaOptions,
  ]);

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
      title="Permintaan Tashih"
      table={table}
      filterColumn="Nama Siswa"
      toolbar={
        data.length > 0 ? (
          <TableFilters
            period={{ value: period, onChange: handlePeriodChange, options: periodOptions }}
            classroom={{ value: classroomId, onChange: handleClassroomChange, options: classroomOptions }}
            group={{ value: groupId, onChange: setGroupId, options: groupOptions }}
            extraFilters={[
              {
                key: 'tashihType',
                label: 'Jenis',
                allLabel: 'Semua Jenis',
                value: tashihType,
                onChange: setTashihType,
                options: typeOptions,
              },
              {
                key: 'juz',
                label: 'Juz',
                allLabel: 'Semua Juz',
                value: juz,
                onChange: setJuz,
                options: juzFilterOptions,
              },
              {
                key: 'surah',
                label: 'Surah',
                allLabel: 'Semua Surah',
                value: surah,
                onChange: setSurah,
                options: surahFilterOptions,
              },
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
