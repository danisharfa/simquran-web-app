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
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FILTER_ALL, TableFilters, isDateInRange } from '@/components/layouts/filters/table-filters';
import { HOME_ACTIVITY_TYPE_OPTIONS, HOME_ACTIVITY_STATUS_OPTIONS } from '../home-activity.schema';
import { deleteHomeActivity } from '../actions/delete-home-activity';
import { updateHomeActivityStatus } from '../actions/update-home-activity-status';
import { HomeActivityEditDialog } from './home-activity-edit-dialog';
import type { HomeActivityTableData } from '../queries/list-own-home-activities';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

const TYPE_LABEL = Object.fromEntries(HOME_ACTIVITY_TYPE_OPTIONS.map((o) => [o.value, o.label]));
const STATUS_LABEL = Object.fromEntries(HOME_ACTIVITY_STATUS_OPTIONS.map((o) => [o.value, o.label]));
const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

interface Props {
  data: HomeActivityTableData[];
  editable?: boolean;
  canReview?: boolean;
  surahOptions?: ReferenceOption[];
  juzOptions?: ReferenceOption[];
  surahJuzMap?: SurahJuzMapping[];
}

export function HomeActivityTable({
  data,
  editable = false,
  canReview = false,
  surahOptions = [],
  juzOptions = [],
  surahJuzMap = [],
}: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const [period, setPeriod] = useState(FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
  const [studentId, setStudentId] = useState(FILTER_ALL);
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
    data.forEach((d) => map.set(d.classroomId, d.classroomName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const groupOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.groupId, d.groupName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const studentOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.studentId, d.studentName));
    return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

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
        cell: ({ row }) =>
          canReview ? (
            <Select
              value={row.original.status}
              onValueChange={(v) => v && handleStatusChange(row.original.id, v)}
              disabled={updatingStatusId === row.original.id}
            >
              <SelectTrigger className="w-40">
                <SelectValue>{STATUS_LABEL[row.original.status] ?? row.original.status}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {HOME_ACTIVITY_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant={row.original.status === 'SUDAH_DIPERIKSA' ? 'default' : 'secondary'}>
              {STATUS_LABEL[row.original.status] ?? row.original.status}
            </Badge>
          ),
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
          </div>
        ),
      },
    ];
  }, [
    editable,
    canReview,
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

  return (
    <DataTable
      title="Aktivitas Rumah"
      table={table}
      filterColumn="Nama Siswa"
      showColumnFilter={false}
      toolbar={
        data.length > 0 ? (
          <TableFilters
            period={{ value: period, onChange: setPeriod, options: periodOptions }}
            classroom={{ value: classroomId, onChange: setClassroomId, options: classroomOptions }}
            group={{ value: groupId, onChange: setGroupId, options: groupOptions }}
            student={{ value: studentId, onChange: setStudentId, options: studentOptions }}
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
