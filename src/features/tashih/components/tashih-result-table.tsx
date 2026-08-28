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

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { FILTER_ALL, TableFilters, isDateInRange, buildPeriodOptions } from '@/components/layouts/filters/table-filters';
import { deleteTashihResult } from '../actions/delete-tashih-result';
import { TashihResultEditDialog } from './tashih-result-edit-dialog';
import { ExportTashihResultPdfButton } from './export-tashih-result-pdf-button';
import { formatDateID } from '@/lib/pdf/format';
import type { TashihResultTableData } from '../queries/list-all-tashih-results';

const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

const RESULT_BADGE_CLASS = {
  passed: 'border-transparent bg-[var(--chart-1)]/15 text-[var(--chart-1)]',
  failed: 'border-transparent bg-destructive/15 text-destructive',
};

interface Props {
  data: TashihResultTableData[];
  editable?: boolean;
  own?: boolean;
  currentPeriod?: string;
  schoolInfo?: { schoolName: string; schoolAddress: string | null };
  exportedBy?: { name: string; role: string };
}

export function TashihResultTable({
  data,
  editable = false,
  own = false,
  currentPeriod,
  schoolInfo,
  exportedBy,
}: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [period, setPeriod] = useState(currentPeriod ?? FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
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

  const statusOptions = useMemo(
    () => [
      { value: 'true', label: 'Lulus' },
      { value: 'false', label: 'Tidak Lulus' },
    ],
    [],
  );
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
          (juz === FILTER_ALL || String(d.juzId) === juz) &&
          (surah === FILTER_ALL || String(d.surahId) === surah) &&
          (status === FILTER_ALL || String(d.passed) === status) &&
          isDateInRange(d.scheduleDate, dateRange),
      ),
    [data, period, classroomId, groupId, juz, surah, status, dateRange],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteTashihResult(id);
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

  const columns = useMemo<ColumnDef<TashihResultTableData>[]>(() => {
    const base: ColumnDef<TashihResultTableData>[] = [
      ...(own
        ? []
        : [
            {
              accessorKey: 'nis',
              id: 'NIS',
              header: 'NIS',
            } satisfies ColumnDef<TashihResultTableData>,
            {
              accessorKey: 'studentName',
              id: 'Nama Siswa',
              header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
            } satisfies ColumnDef<TashihResultTableData>,
            {
              accessorKey: 'classroomName',
              id: 'Kelas',
              header: 'Kelas',
            } satisfies ColumnDef<TashihResultTableData>,
            {
              accessorKey: 'groupName',
              id: 'Kelompok',
              header: 'Kelompok',
            } satisfies ColumnDef<TashihResultTableData>,
          ]),
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
        accessorFn: (row) => row.scheduleDate,
        id: 'Tanggal',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
        cell: ({ row }) => new Date(row.original.scheduleDate).toLocaleDateString('id-ID'),
      },
      {
        accessorKey: 'passed',
        id: 'Hasil',
        header: 'Hasil',
        cell: ({ row }) => (
          <Badge className={row.original.passed ? RESULT_BADGE_CLASS.passed : RESULT_BADGE_CLASS.failed}>
            {row.original.passed ? 'Lulus' : 'Tidak Lulus'}
          </Badge>
        ),
      },
      { accessorKey: 'notes', id: 'Catatan', header: 'Catatan' },
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
            <TashihResultEditDialog
              resultId={row.original.id}
              initialPassed={row.original.passed}
              initialNotes={row.original.notes}
            />
            <DeleteConfirmDialog
              title="Hapus Hasil Tashih"
              description="Apakah Anda yakin ingin menghapus hasil tashih ini? Tindakan ini tidak dapat dibatalkan."
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
  }, [editable, own, deletingId, handleDelete]);

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
    }
    const juzLabel = juzFilterOptions.find((o) => o.value === juz)?.label;
    if (juz !== FILTER_ALL && juzLabel) parts.push(`Juz: ${juzLabel}`);
    const surahLabel = surahFilterOptions.find((o) => o.value === surah)?.label;
    if (surah !== FILTER_ALL && surahLabel) parts.push(`Surah: ${surahLabel}`);
    const statusLabel = statusOptions.find((o) => o.value === status)?.label;
    if (status !== FILTER_ALL && statusLabel) parts.push(`Status: ${statusLabel}`);
    if (dateRange?.from || dateRange?.to) {
      parts.push(
        `Tanggal Tashih: ${dateRange.from ? formatDateID(dateRange.from) : '...'} - ${dateRange.to ? formatDateID(dateRange.to) : '...'}`,
      );
    }
    return parts.length > 0 ? parts.join(' • ') : undefined;
  }, [
    own,
    classroomId,
    classroomOptions,
    groupId,
    groupOptions,
    juz,
    juzFilterOptions,
    surah,
    surahFilterOptions,
    status,
    statusOptions,
    dateRange,
  ]);

  return (
    <DataTable
      title="Hasil Tashih"
      titleAction={
        data.length > 0 && schoolInfo && exportedBy ? (
          <ExportTashihResultPdfButton
            table={table}
            schoolInfo={schoolInfo}
            exportedBy={exportedBy}
            periodLabel={periodLabel}
            filterSummary={filterSummary}
            own={own}
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
            group={own ? undefined : { value: groupId, onChange: setGroupId, options: groupOptions }}
            extraFilters={[
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
            dateRange={{ value: dateRange, onChange: setDateRange, label: 'Tanggal Tashih' }}
          />
        ) : undefined
      }
    />
  );
}
