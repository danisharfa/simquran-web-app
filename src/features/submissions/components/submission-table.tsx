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
import { Lock, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FILTER_ALL, TableFilters, isDateInRange, buildPeriodOptions } from '@/components/layouts/filters/table-filters';
import { SUBMISSION_TYPE_OPTIONS, ADAB_OPTIONS, SUBMISSION_STATUS_OPTIONS } from '../submission.schema';
import { deleteSubmission } from '../actions/delete-submission';
import { SubmissionEditDialog } from './submission-edit-dialog';
import { ExportSubmissionPdfButton } from './export-submission-pdf-button';
import { formatDateID } from '@/lib/pdf/format';
import type { SubmissionTableData } from '../queries/list-my-submissions';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

const TYPE_LABEL = Object.fromEntries(SUBMISSION_TYPE_OPTIONS.map((o) => [o.value, o.label]));
const ADAB_LABEL = Object.fromEntries(ADAB_OPTIONS.map((o) => [o.value, o.label]));
const STATUS_LABEL = Object.fromEntries(SUBMISSION_STATUS_OPTIONS.map((o) => [o.value, o.label]));
const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

interface Props {
  data: SubmissionTableData[];
  editable?: boolean;
  own?: boolean;
  showClassroom?: boolean;
  groups?: GroupWithStudents[];
  surahOptions?: ReferenceOption[];
  juzOptions?: ReferenceOption[];
  surahJuzMap?: SurahJuzMapping[];
  wafaOptions?: ReferenceOption[];
  currentPeriod?: string;
  schoolInfo?: { schoolName: string; schoolAddress: string | null };
  exportedBy?: { name: string; role: string };
}

export function SubmissionTable({
  data,
  editable = false,
  own = false,
  showClassroom = false,
  groups = [],
  surahOptions = [],
  juzOptions = [],
  surahJuzMap = [],
  wafaOptions = [],
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
  const [studentId, setStudentId] = useState(FILTER_ALL);
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
          isDateInRange(d.date, dateRange),
      ),
    [data, period, classroomId, groupId, studentId, dateRange],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteSubmission(id);
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

  const columns = useMemo<ColumnDef<SubmissionTableData>[]>(() => {
    const base: ColumnDef<SubmissionTableData>[] = [
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
            } satisfies ColumnDef<SubmissionTableData>,
            {
              accessorKey: 'studentName',
              id: 'Nama Siswa',
              header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
            } satisfies ColumnDef<SubmissionTableData>,
          ]),
      ...(showClassroom
        ? [
            {
              accessorKey: 'classroomName',
              id: 'Kelas',
              header: 'Kelas',
            } satisfies ColumnDef<SubmissionTableData>,
          ]
        : []),
      ...(own
        ? []
        : [
            {
              accessorKey: 'groupName',
              id: 'Kelompok',
              header: 'Kelompok',
            } satisfies ColumnDef<SubmissionTableData>,
          ]),
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
      {
        accessorKey: 'note',
        id: 'Catatan',
        header: 'Catatan',
        cell: ({ row }) => row.original.note ?? '-',
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
              locked={row.original.isLocked}
              groups={groups}
              surahOptions={surahOptions}
              juzOptions={juzOptions}
              surahJuzMap={surahJuzMap}
              wafaOptions={wafaOptions}
            />
            {row.original.isLocked ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </Button>
                  }
                />
                <TooltipContent>
                  Sudah menjadi bagian dari pengajuan tashih yang sedang berjalan, tidak dapat dihapus.
                </TooltipContent>
              </Tooltip>
            ) : (
              <DeleteConfirmDialog
                title="Hapus Setoran"
                description="Apakah Anda yakin ingin menghapus setoran ini? Tindakan ini tidak dapat dibatalkan."
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
            )}
          </div>
        ),
      },
    ];
  }, [editable, own, showClassroom, groups, surahOptions, juzOptions, surahJuzMap, wafaOptions, deletingId, handleDelete]);

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
    if (dateRange?.from || dateRange?.to) {
      parts.push(
        `Tanggal Setoran: ${dateRange.from ? formatDateID(dateRange.from) : '...'} - ${dateRange.to ? formatDateID(dateRange.to) : '...'}`,
      );
    }
    return parts.length > 0 ? parts.join(' • ') : undefined;
  }, [own, classroomId, classroomOptions, groupId, groupOptions, studentId, studentOptions, dateRange]);

  return (
    <DataTable
      title="Riwayat Setoran"
      titleAction={
        data.length > 0 && schoolInfo && exportedBy ? (
          <ExportSubmissionPdfButton
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
            dateRange={{ value: dateRange, onChange: setDateRange, label: 'Tanggal Setoran' }}
          />
        ) : undefined
      }
    />
  );
}
