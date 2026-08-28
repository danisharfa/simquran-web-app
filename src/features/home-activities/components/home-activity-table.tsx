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
import { Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { FILTER_ALL, TableFilters, isDateInRange, buildPeriodOptions } from '@/components/layouts/filters/table-filters';
import { HOME_ACTIVITY_TYPE_OPTIONS, HOME_ACTIVITY_STATUS_OPTIONS } from '../home-activity.schema';
import { deleteHomeActivity } from '../actions/delete-home-activity';
import { updateHomeActivityStatus } from '../actions/update-home-activity-status';
import { HomeActivityEditDialog } from './home-activity-edit-dialog';
import { ExportHomeActivityPdfButton } from './export-home-activity-pdf-button';
import { formatDateID } from '@/lib/pdf/format';
import type { HomeActivityTableData } from '../queries/list-own-home-activities';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

const TYPE_LABEL = Object.fromEntries(HOME_ACTIVITY_TYPE_OPTIONS.map((o) => [o.value, o.label]));
const STATUS_LABEL = Object.fromEntries(HOME_ACTIVITY_STATUS_OPTIONS.map((o) => [o.value, o.label]));
const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

const STATUS_BADGE_CLASS: Record<string, string> = {
  BELUM_DIPERIKSA: 'border-transparent bg-destructive/15 text-destructive',
  SUDAH_DIPERIKSA: 'border-transparent bg-[var(--chart-1)]/15 text-[var(--chart-1)]',
};

interface Props {
  data: HomeActivityTableData[];
  editable?: boolean;
  canReview?: boolean;
  own?: boolean;
  showClassroom?: boolean;
  surahOptions?: ReferenceOption[];
  juzOptions?: ReferenceOption[];
  surahJuzMap?: SurahJuzMapping[];
  currentPeriod?: string;
  schoolInfo?: { schoolName: string; schoolAddress: string | null };
  exportedBy?: { name: string; role: string };
}

export function HomeActivityTable({
  data,
  editable = false,
  canReview = false,
  own = false,
  showClassroom = false,
  surahOptions = [],
  juzOptions = [],
  surahJuzMap = [],
  currentPeriod,
  schoolInfo,
  exportedBy,
}: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const [period, setPeriod] = useState(currentPeriod ?? FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
  const [studentId, setStudentId] = useState(FILTER_ALL);
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
  const studentOptions = useMemo(() => {
    const map = new Map<string, string>();
    data
      .filter(
        (d) =>
          (period === FILTER_ALL || `${d.academicYear}|${d.semester}` === period) &&
          (classroomId === FILTER_ALL || d.classroomId === classroomId) &&
          (groupId === FILTER_ALL || d.groupId === groupId),
      )
      .forEach((d) => map.set(d.studentId, d.studentName));
    return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [data, period, classroomId, groupId]);

  function handlePeriodChange(value: string) {
    setPeriod(value);
    setClassroomId(FILTER_ALL);
    setGroupId(FILTER_ALL);
    setStudentId(FILTER_ALL);
  }
  function handleClassroomChange(value: string) {
    setClassroomId(value);
    setGroupId(FILTER_ALL);
    setStudentId(FILTER_ALL);
  }
  function handleGroupChange(value: string) {
    setGroupId(value);
    setStudentId(FILTER_ALL);
  }

  const filteredData = useMemo(
    () =>
      data.filter(
        (d) =>
          (period === FILTER_ALL || `${d.academicYear}|${d.semester}` === period) &&
          (classroomId === FILTER_ALL || d.classroomId === classroomId) &&
          (groupId === FILTER_ALL || d.groupId === groupId) &&
          (studentId === FILTER_ALL || d.studentId === studentId) &&
          (status === FILTER_ALL || d.status === status) &&
          isDateInRange(d.date, dateRange),
      ),
    [data, period, classroomId, groupId, studentId, status, dateRange],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteHomeActivity(id);
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

  const handleStatusChange = useCallback(
    async (id: string, nextStatus: string) => {
      setUpdatingStatusId(id);
      try {
        const result = await updateHomeActivityStatus(id, nextStatus as 'BELUM_DIPERIKSA' | 'SUDAH_DIPERIKSA');
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        router.refresh();
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [router],
  );

  const columns = useMemo<ColumnDef<HomeActivityTableData>[]>(() => {
    const base: ColumnDef<HomeActivityTableData>[] = [
      {
        accessorFn: (row) => row.date,
        id: 'Tanggal',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString('id-ID'),
      },
      ...(own
        ? []
        : [
            {
              accessorKey: 'nis',
              id: 'NIS',
              header: 'NIS',
            } satisfies ColumnDef<HomeActivityTableData>,
            {
              accessorKey: 'studentName',
              id: 'Nama Siswa',
              header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
            } satisfies ColumnDef<HomeActivityTableData>,
          ]),
      ...(showClassroom
        ? [
            {
              accessorKey: 'classroomName',
              id: 'Kelas',
              header: 'Kelas',
            } satisfies ColumnDef<HomeActivityTableData>,
          ]
        : []),
      ...(own
        ? []
        : [
            {
              accessorKey: 'groupName',
              id: 'Kelompok',
              header: 'Kelompok',
            } satisfies ColumnDef<HomeActivityTableData>,
          ]),
      {
        accessorKey: 'activityType',
        id: 'Jenis',
        header: 'Jenis',
        cell: ({ row }) => TYPE_LABEL[row.original.activityType] ?? row.original.activityType,
      },
      {
        accessorKey: 'detail',
        id: 'Detail',
        header: 'Detail',
      },
      {
        accessorKey: 'note',
        id: 'Catatan',
        header: 'Catatan',
      },
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

    if (!editable && !canReview) return base;

    return [
      ...base,
      {
        id: 'Aksi',
        enableHiding: false,
        header: 'Aksi',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {canReview &&
              (row.original.status === 'SUDAH_DIPERIKSA' ? (
                <ConfirmDialog
                  title="Batalkan Pemeriksaan"
                  description="Status aktivitas ini akan dikembalikan ke belum diperiksa, dan siswa dapat mengubah atau menghapusnya kembali."
                  confirmLabel="Batalkan"
                  confirmingLabel="Membatalkan..."
                  onConfirm={() => handleStatusChange(row.original.id, 'BELUM_DIPERIKSA')}
                  trigger={
                    <Button variant="outline" size="sm" disabled={updatingStatusId === row.original.id}>
                      Batalkan
                    </Button>
                  }
                />
              ) : (
                <ConfirmDialog
                  title="Tandai Sudah Diperiksa"
                  description="Aktivitas ini akan ditandai sudah diperiksa, dan siswa tidak dapat lagi mengubah atau menghapusnya."
                  confirmLabel="Tandai Diperiksa"
                  confirmingLabel="Menandai..."
                  onConfirm={() => handleStatusChange(row.original.id, 'SUDAH_DIPERIKSA')}
                  trigger={
                    <Button size="sm" disabled={updatingStatusId === row.original.id}>
                      Tandai Diperiksa
                    </Button>
                  }
                />
              ))}
            {editable && row.original.status !== 'SUDAH_DIPERIKSA' && (
              <>
                <HomeActivityEditDialog
                  activityId={row.original.id}
                  surahOptions={surahOptions}
                  juzOptions={juzOptions}
                  surahJuzMap={surahJuzMap}
                />
                <DeleteConfirmDialog
                  title="Hapus Aktivitas Rumah"
                  description="Apakah Anda yakin ingin menghapus aktivitas rumah ini? Tindakan ini tidak dapat dibatalkan."
                  onConfirm={() => handleDelete(row.original.id)}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={deletingId === row.original.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </Button>
                  }
                />
              </>
            )}
          </div>
        ),
      },
    ];
  }, [
    editable,
    canReview,
    own,
    showClassroom,
    surahOptions,
    juzOptions,
    surahJuzMap,
    deletingId,
    handleDelete,
    updatingStatusId,
    handleStatusChange,
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

  const periodLabel = useMemo(() => {
    if (period === FILTER_ALL) return undefined;
    const label = periodOptions.find((o) => o.value === period)?.label;
    return label ? `Tahun Akademik ${label}` : undefined;
  }, [period, periodOptions]);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (!own) {
      const classroomLabel = classroomOptions.find((o) => o.value === classroomId)?.label;
      if (classroomId !== FILTER_ALL && classroomLabel) parts.push(`Kelas: ${classroomLabel}`);
      const groupLabel = groupOptions.find((o) => o.value === groupId)?.label;
      if (groupId !== FILTER_ALL && groupLabel) parts.push(`Kelompok: ${groupLabel}`);
      const studentLabel = studentOptions.find((o) => o.value === studentId)?.label;
      if (studentId !== FILTER_ALL && studentLabel) parts.push(`Siswa: ${studentLabel}`);
    }
    if (status !== FILTER_ALL) {
      parts.push(`Status: ${STATUS_LABEL[status] ?? status}`);
    }
    if (dateRange?.from || dateRange?.to) {
      parts.push(
        `Tanggal Aktivitas: ${dateRange.from ? formatDateID(dateRange.from) : '...'} - ${dateRange.to ? formatDateID(dateRange.to) : '...'}`,
      );
    }
    return parts.length > 0 ? parts.join(' • ') : undefined;
  }, [own, classroomId, classroomOptions, groupId, groupOptions, studentId, studentOptions, status, dateRange]);

  return (
    <DataTable
      title="Aktivitas Rumah"
      titleAction={
        data.length > 0 && schoolInfo && exportedBy ? (
          <ExportHomeActivityPdfButton
            table={table}
            schoolInfo={schoolInfo}
            exportedBy={exportedBy}
            periodLabel={periodLabel}
            filterSummary={filterSummary}
            own={own}
            showClassroom={showClassroom}
          />
        ) : undefined
      }
      table={table}
      filterColumn={own ? undefined : 'Nama Siswa'}
      toolbar={
        data.length > 0 ? (
          <TableFilters
            period={{ value: period, onChange: handlePeriodChange, options: periodOptions }}
            classroom={own ? undefined : { value: classroomId, onChange: handleClassroomChange, options: classroomOptions }}
            group={own ? undefined : { value: groupId, onChange: handleGroupChange, options: groupOptions }}
            student={own ? undefined : { value: studentId, onChange: setStudentId, options: studentOptions }}
            extraFilters={[
              {
                key: 'status',
                label: 'Status',
                allLabel: 'Semua Status',
                value: status,
                onChange: setStatus,
                options: HOME_ACTIVITY_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
              },
            ]}
            dateRange={{ value: dateRange, onChange: setDateRange, label: 'Tanggal Aktivitas' }}
          />
        ) : undefined
      }
    />
  );
}
