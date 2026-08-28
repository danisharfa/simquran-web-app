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
import { FILTER_ALL, TableFilters, isDateInRange, buildPeriodOptions } from '@/components/layouts/filters/table-filters';
import { TAHAP_OPTIONS } from '../munaqasyah.schema';
import { TAHAP_BADGE_CLASS, GRADE_BADGE_CLASS } from './munaqasyah-request-table';
import { MunaqasyahGradeInfoPopover } from './munaqasyah-grade-info-popover';
import { MunaqasyahResultEditDialog } from './munaqasyah-result-edit-dialog';
import { ExportMunaqasyahResultPdfButton } from './export-munaqasyah-result-pdf-button';
import { deleteTasmiResult } from '../actions/delete-tasmi-result';
import { deleteMunaqasyahResult } from '../actions/delete-munaqasyah-result';
import { formatDateID } from '@/lib/pdf/format';
import type { MunaqasyahCombinedResultData } from '../queries/list-munaqasyah-combined-results';
import type { FinalScoreWeightsData } from '../queries/get-final-score-weights';
import type { ScoringWeights, MunaqasyahGradeSettingData } from '../munaqasyah-scoring';
import type { MunaqasyahGrade, MunaqasyahJenisUjian } from '@/lib/generated/prisma/enums';

const TAHAP_LABEL = Object.fromEntries(TAHAP_OPTIONS.map((o) => [o.value, o.label]));
const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

const PASSED_BADGE_CLASS = 'border-transparent bg-[var(--chart-1)]/15 text-[var(--chart-1)]';
const FAILED_BADGE_CLASS = 'border-transparent bg-destructive/15 text-destructive';
const PENDING_BADGE_CLASS = 'border-dashed text-muted-foreground';

interface Props {
  data: MunaqasyahCombinedResultData[];
  own?: boolean;
  editable?: boolean;
  scoringWeights?: Record<MunaqasyahJenisUjian, ScoringWeights>;
  gradeSettings: MunaqasyahGradeSettingData[];
  gradeLabelMap: Record<MunaqasyahGrade, string>;
  finalScoreWeights: FinalScoreWeightsData;
  currentPeriod?: string;
  schoolInfo?: { schoolName: string; schoolAddress: string | null };
  exportedBy?: { name: string; role: string };
}

function SubResultCell({
  detail,
  jenis,
  studentName,
  gradeLabelMap,
  editable,
  scoringWeights,
  gradeSettings,
  deletingId,
  onDelete,
}: {
  detail: { resultId: string; totalScore: number; grade: MunaqasyahGrade } | null;
  jenis: MunaqasyahJenisUjian;
  studentName: string;
  gradeLabelMap: Record<MunaqasyahGrade, string>;
  editable: boolean;
  scoringWeights?: Record<MunaqasyahJenisUjian, ScoringWeights>;
  gradeSettings: MunaqasyahGradeSettingData[];
  deletingId: string | null;
  onDelete: (resultId: string, jenis: MunaqasyahJenisUjian) => void;
}) {
  if (!detail) {
    return <span className="text-muted-foreground text-sm">Belum dinilai</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <div>
        <div className="font-medium">{detail.totalScore.toFixed(1)}</div>
        <Badge className={GRADE_BADGE_CLASS[detail.grade]}>{gradeLabelMap[detail.grade] ?? detail.grade}</Badge>
      </div>
      {editable && scoringWeights && (
        <div className="flex items-center">
          <MunaqasyahResultEditDialog
            result={{ id: detail.resultId, jenis }}
            scoringWeights={scoringWeights}
            gradeSettings={gradeSettings}
          />
          <DeleteConfirmDialog
            title={`Hapus Hasil ${jenis === 'TASMI' ? 'Tasmi' : 'Munaqasyah'}`}
            description={`Apakah Anda yakin ingin menghapus hasil penilaian ${jenis === 'TASMI' ? 'Tasmi' : 'Munaqasyah'} dari ${studentName}? Tindakan ini tidak dapat dibatalkan.`}
            onConfirm={async () => {
              onDelete(detail.resultId, jenis);
              return true;
            }}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                disabled={deletingId === detail.resultId}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}

export function MunaqasyahCombinedResultTable({
  data,
  own = false,
  editable = false,
  scoringWeights,
  gradeSettings,
  gradeLabelMap,
  finalScoreWeights,
  currentPeriod,
  schoolInfo,
  exportedBy,
}: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [period, setPeriod] = useState(currentPeriod ?? FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
  const [tahap, setTahap] = useState(FILTER_ALL);
  const [juz, setJuz] = useState(FILTER_ALL);
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

  const tahapOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.tahap, TAHAP_LABEL[d.tahap] ?? d.tahap));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const statusOptions = useMemo(
    () => [
      { value: 'LULUS', label: 'Lulus' },
      { value: 'TIDAK_LULUS', label: 'Tidak Lulus' },
      { value: 'MENUNGGU', label: 'Menunggu Pasangan' },
    ],
    [],
  );
  const juzOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(String(d.juzId), d.juzName));
    return Array.from(map, ([value, label]) => ({ value, label })).sort(
      (a, b) => Number(a.value) - Number(b.value),
    );
  }, [data]);

  const filteredData = useMemo(
    () =>
      data.filter(
        (d) =>
          (period === FILTER_ALL || `${d.academicYear}|${d.semester}` === period) &&
          (own || classroomId === FILTER_ALL || d.classroomId === classroomId) &&
          (own || groupId === FILTER_ALL || d.groupId === groupId) &&
          (tahap === FILTER_ALL || d.tahap === tahap) &&
          (juz === FILTER_ALL || String(d.juzId) === juz) &&
          (status === FILTER_ALL ||
            (status === 'MENUNGGU' ? d.passed === null : status === 'LULUS' ? d.passed === true : d.passed === false)) &&
          isDateInRange(d.lastActivityDate, dateRange),
      ),
    [data, period, classroomId, groupId, tahap, juz, status, dateRange, own],
  );

  const handleDelete = useCallback(
    async (resultId: string, jenis: MunaqasyahJenisUjian) => {
      setDeletingId(resultId);
      try {
        const result = jenis === 'TASMI' ? await deleteTasmiResult(resultId) : await deleteMunaqasyahResult(resultId);
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

  const columns = useMemo<ColumnDef<MunaqasyahCombinedResultData>[]>(
    () => [
      ...(own
        ? []
        : [
            {
              accessorKey: 'nis',
              id: 'NIS',
              header: 'NIS',
            } satisfies ColumnDef<MunaqasyahCombinedResultData>,
            {
              accessorKey: 'studentName',
              id: 'Nama Siswa',
              header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
            } satisfies ColumnDef<MunaqasyahCombinedResultData>,
            {
              accessorKey: 'classroomName',
              id: 'Kelas',
              header: 'Kelas',
            } satisfies ColumnDef<MunaqasyahCombinedResultData>,
            {
              accessorKey: 'groupName',
              id: 'Kelompok',
              header: 'Kelompok',
            } satisfies ColumnDef<MunaqasyahCombinedResultData>,
          ]),
      { accessorKey: 'juzName', id: 'Juz', header: 'Juz' },
      {
        accessorKey: 'tahap',
        id: 'Tahap',
        header: 'Tahap',
        cell: ({ row }) => (
          <Badge className={TAHAP_BADGE_CLASS[row.original.tahap]}>
            {TAHAP_LABEL[row.original.tahap] ?? row.original.tahap}
          </Badge>
        ),
      },
      {
        id: 'Tasmi',
        header: 'Tasmi',
        cell: ({ row }) => (
          <SubResultCell
            detail={row.original.tasmi}
            jenis="TASMI"
            studentName={row.original.studentName}
            gradeLabelMap={gradeLabelMap}
            editable={editable}
            scoringWeights={scoringWeights}
            gradeSettings={gradeSettings}
            deletingId={deletingId}
            onDelete={handleDelete}
          />
        ),
      },
      {
        id: 'Munaqasyah',
        header: 'Munaqasyah',
        cell: ({ row }) => (
          <SubResultCell
            detail={row.original.munaqasyah}
            jenis="MUNAQASYAH"
            studentName={row.original.studentName}
            gradeLabelMap={gradeLabelMap}
            editable={editable}
            scoringWeights={scoringWeights}
            gradeSettings={gradeSettings}
            deletingId={deletingId}
            onDelete={handleDelete}
          />
        ),
      },
      {
        id: 'Nilai Akhir',
        header: 'Nilai Akhir',
        cell: ({ row }) => {
          const { finalScore, finalGrade, passed } = row.original;
          if (finalScore == null || finalGrade == null || passed == null) {
            return (
              <Badge variant="outline" className={PENDING_BADGE_CLASS}>
                Menunggu pasangan hasil
              </Badge>
            );
          }
          return (
            <div>
              <div className="font-semibold">{finalScore.toFixed(1)}</div>
              <div className="flex flex-wrap items-center gap-1">
                <Badge className={GRADE_BADGE_CLASS[finalGrade]}>{gradeLabelMap[finalGrade] ?? finalGrade}</Badge>
                <Badge className={passed ? PASSED_BADGE_CLASS : FAILED_BADGE_CLASS}>
                  {passed ? 'Lulus' : 'Tidak Lulus'}
                </Badge>
              </div>
            </div>
          );
        },
      },
    ],
    [own, gradeLabelMap, editable, scoringWeights, gradeSettings, deletingId, handleDelete],
  );

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
    const tahapLabel = tahapOptions.find((o) => o.value === tahap)?.label;
    if (tahap !== FILTER_ALL && tahapLabel) parts.push(`Tahap: ${tahapLabel}`);
    const juzLabel = juzOptions.find((o) => o.value === juz)?.label;
    if (juz !== FILTER_ALL && juzLabel) parts.push(`Juz: ${juzLabel}`);
    const statusLabel = statusOptions.find((o) => o.value === status)?.label;
    if (status !== FILTER_ALL && statusLabel) parts.push(`Status Akhir: ${statusLabel}`);
    if (dateRange?.from || dateRange?.to) {
      parts.push(
        `Tanggal Penilaian: ${dateRange.from ? formatDateID(dateRange.from) : '...'} - ${dateRange.to ? formatDateID(dateRange.to) : '...'}`,
      );
    }
    return parts.length > 0 ? parts.join(' • ') : undefined;
  }, [
    own,
    classroomId,
    classroomOptions,
    groupId,
    groupOptions,
    tahap,
    tahapOptions,
    juz,
    juzOptions,
    status,
    statusOptions,
    dateRange,
  ]);

  return (
    <DataTable
      title="Hasil Penilaian"
      titleAction={
        <div className="flex items-center gap-2">
          <MunaqasyahGradeInfoPopover gradeSettings={gradeSettings} finalScoreWeights={finalScoreWeights} />
          {data.length > 0 && schoolInfo && exportedBy && (
            <ExportMunaqasyahResultPdfButton
              table={table}
              schoolInfo={schoolInfo}
              exportedBy={exportedBy}
              periodLabel={periodLabel}
              filterSummary={filterSummary}
              own={own}
              gradeLabelMap={gradeLabelMap}
            />
          )}
        </div>
      }
      table={table}
      filterColumn={own ? undefined : 'Nama Siswa'}
      toolbar={
        data.length > 0 && (
            <TableFilters
              period={{ value: period, onChange: handlePeriodChange, options: periodOptions }}
              classroom={own ? undefined : { value: classroomId, onChange: handleClassroomChange, options: classroomOptions }}
              group={own ? undefined : { value: groupId, onChange: setGroupId, options: groupOptions }}
              extraFilters={[
                { key: 'tahap', label: 'Tahap', allLabel: 'Semua Tahap', value: tahap, onChange: setTahap, options: tahapOptions },
                { key: 'juz', label: 'Juz', allLabel: 'Semua Juz', value: juz, onChange: setJuz, options: juzOptions },
                {
                  key: 'status',
                  label: 'Status Akhir',
                  allLabel: 'Semua Status',
                  value: status,
                  onChange: setStatus,
                  options: statusOptions,
                },
              ]}
              dateRange={{ value: dateRange, onChange: setDateRange, label: 'Tanggal Penilaian' }}
            />
          )
      }
    />
  );
}
