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
import { Info, Trash2 } from 'lucide-react';
import { Progress as ProgressPrimitive } from '@base-ui/react/progress';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { FILTER_ALL, TableFilters, doesRangeOverlap } from '@/components/layouts/filters/table-filters';
import { TARGET_TYPE_OPTIONS, TARGET_STATUS_OPTIONS } from '../weekly-target.schema';
import { deleteWeeklyTarget } from '../actions/delete-weekly-target';
import { WeeklyTargetEditDialog } from './weekly-target-edit-dialog';
import { cn } from '@/lib/utils';
import type { WeeklyTargetTableData } from '../queries/list-my-weekly-targets';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

const TYPE_LABEL = Object.fromEntries(TARGET_TYPE_OPTIONS.map((o) => [o.value, o.label]));
const STATUS_LABEL = Object.fromEntries(TARGET_STATUS_OPTIONS.map((o) => [o.value, o.label]));
const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

// Kept distinct from the progress bar's red/yellow/green scale to avoid confusion.
const TYPE_BADGE_CLASS: Record<string, string> = {
  TAHFIDZ: 'border-transparent bg-[var(--chart-2)]/15 text-[var(--chart-2)]',
  TAHSIN_WAFA: 'border-transparent bg-[var(--chart-4)]/15 text-[var(--chart-4)]',
  TAHSIN_ALQURAN: 'border-transparent bg-slate-500/15 text-slate-600 dark:text-slate-400',
};

function getProgressColorClass(percent: number): { bar: string; text: string } {
  if (percent <= 0) return { bar: 'bg-destructive', text: 'text-destructive' };
  if (percent < 100) return { bar: 'bg-[var(--chart-3)]', text: 'text-[var(--chart-3)]' };
  return { bar: 'bg-[var(--chart-1)]', text: 'text-[var(--chart-1)]' };
}

interface Props {
  data: WeeklyTargetTableData[];
  editable?: boolean;
  surahOptions?: ReferenceOption[];
  juzOptions?: ReferenceOption[];
  surahJuzMap?: SurahJuzMapping[];
  wafaOptions?: ReferenceOption[];
}

export function WeeklyTargetTable({
  data,
  editable = false,
  surahOptions = [],
  juzOptions = [],
  surahJuzMap = [],
  wafaOptions = [],
}: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [period, setPeriod] = useState(FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
  const [studentId, setStudentId] = useState(FILTER_ALL);
  const [type, setType] = useState(FILTER_ALL);
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
  const typeOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.type, TYPE_LABEL[d.type] ?? d.type));
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
          (studentId === FILTER_ALL || d.studentId === studentId) &&
          (type === FILTER_ALL || d.type === type) &&
          (status === FILTER_ALL || d.status === status) &&
          doesRangeOverlap(d.startDate, d.endDate, dateRange),
      ),
    [data, period, classroomId, groupId, studentId, type, status, dateRange],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteWeeklyTarget(id);
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

  const columns = useMemo<ColumnDef<WeeklyTargetTableData>[]>(() => {
    const base: ColumnDef<WeeklyTargetTableData>[] = [
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
        accessorKey: 'classroomName',
        id: 'Kelas',
        header: 'Kelas',
      },
      {
        accessorKey: 'type',
        id: 'Jenis',
        header: 'Jenis',
        cell: ({ row }) => (
          <Badge className={TYPE_BADGE_CLASS[row.original.type]}>
            {TYPE_LABEL[row.original.type] ?? row.original.type}
          </Badge>
        ),
      },
      {
        accessorKey: 'detail',
        id: 'Target',
        header: 'Target',
      },
      {
        accessorFn: (row) => row.startDate,
        id: 'Periode',
        header: 'Periode',
        cell: ({ row }) =>
          `${new Date(row.original.startDate).toLocaleDateString('id-ID')} - ${new Date(row.original.endDate).toLocaleDateString('id-ID')}`,
      },
      {
        accessorKey: 'progressPercent',
        id: 'Progress',
        header: 'Progress',
        cell: ({ row }) => {
          const percent = row.original.progressPercent ?? 0;
          const status = row.original.status;
          const { bar, text } = getProgressColorClass(percent);
          return (
            <div className="flex min-w-36 items-center gap-2">
              <ProgressPrimitive.Root value={percent} className="w-24">
                <ProgressTrack>
                  <ProgressIndicator className={bar} />
                </ProgressTrack>
              </ProgressPrimitive.Root>
              <span className="text-muted-foreground text-xs tabular-nums">{percent}%</span>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="ghost" size="icon" className={cn('size-5', text)}>
                      <Info className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent>{STATUS_LABEL[status] ?? status}</TooltipContent>
              </Tooltip>
            </div>
          );
        },
      },
      {
        accessorKey: 'description',
        id: 'Deskripsi',
        header: 'Deskripsi',
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
            <WeeklyTargetEditDialog
              targetId={row.original.id}
              surahOptions={surahOptions}
              juzOptions={juzOptions}
              surahJuzMap={surahJuzMap}
              wafaOptions={wafaOptions}
            />
            <DeleteConfirmDialog
              title="Hapus Target Setoran"
              description="Apakah Anda yakin ingin menghapus target setoran ini? Tindakan ini tidak dapat dibatalkan."
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
  }, [editable, surahOptions, juzOptions, surahJuzMap, wafaOptions, deletingId, handleDelete]);

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
      title="Target Setoran"
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
              { key: 'type', label: 'Jenis', allLabel: 'Semua Jenis', value: type, onChange: setType, options: typeOptions },
              {
                key: 'status',
                label: 'Status',
                allLabel: 'Semua Status',
                value: status,
                onChange: setStatus,
                options: statusOptions,
              },
            ]}
            dateRange={{ value: dateRange, onChange: setDateRange, label: 'Periode Target' }}
          />
        ) : undefined
      }
    />
  );
}
