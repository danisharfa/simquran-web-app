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
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { FILTER_ALL, TableFilters, isDateInRange, buildPeriodOptions } from '@/components/layouts/filters/table-filters';
import { deleteMunaqasyahSchedule } from '../actions/delete-munaqasyah-schedule';
import { MunaqasyahScheduleParticipantsDialog } from './munaqasyah-schedule-participants-dialog';
import { MunaqasyahScheduleEditDialog } from './munaqasyah-schedule-edit-dialog';
import { ExportMunaqasyahSchedulePdfButton } from './export-munaqasyah-schedule-pdf-button';
import { formatDateID } from '@/lib/pdf/format';
import type { MunaqasyahScheduleTableData } from '../queries/list-munaqasyah-schedules';
import type { TeacherOption } from '@/features/groups/queries/list-teachers';

const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

interface Props {
  data: MunaqasyahScheduleTableData[];
  teachers: TeacherOption[];
  currentPeriod?: string;
  schoolInfo?: { schoolName: string; schoolAddress: string | null };
  exportedBy?: { name: string; role: string };
}

export function MunaqasyahScheduleTable({ data, teachers, currentPeriod, schoolInfo, exportedBy }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [period, setPeriod] = useState(currentPeriod ?? FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
  const [studentId, setStudentId] = useState(FILTER_ALL);
  const [sessionName, setSessionName] = useState(FILTER_ALL);
  const [time, setTime] = useState(FILTER_ALL);
  const [location, setLocation] = useState(FILTER_ALL);

  const participants = useMemo(() => data.flatMap((d) => d.participants), [data]);

  const periodOptions = useMemo(
    () => buildPeriodOptions(participants, (p) => p.academicYear, (p) => p.semester, SEMESTER_LABEL, currentPeriod),
    [participants, currentPeriod],
  );
  const classroomOptions = useMemo(() => {
    const map = new Map<string, string>();
    participants
      .filter((p) => period === FILTER_ALL || `${p.academicYear}|${p.semester}` === period)
      .forEach((p) => map.set(p.classroomId, p.classroomName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [participants, period]);
  const groupOptions = useMemo(() => {
    const map = new Map<string, string>();
    participants
      .filter(
        (p) =>
          (period === FILTER_ALL || `${p.academicYear}|${p.semester}` === period) &&
          (classroomId === FILTER_ALL || p.classroomId === classroomId),
      )
      .forEach((p) => map.set(p.groupId, p.groupName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [participants, period, classroomId]);
  const studentOptions = useMemo(() => {
    const map = new Map<string, string>();
    participants
      .filter(
        (p) =>
          (period === FILTER_ALL || `${p.academicYear}|${p.semester}` === period) &&
          (classroomId === FILTER_ALL || p.classroomId === classroomId) &&
          (groupId === FILTER_ALL || p.groupId === groupId),
      )
      .forEach((p) => map.set(p.requestId, p.studentName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [participants, period, classroomId, groupId]);

  const sessionOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.sessionName, d.sessionName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const timeOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(`${d.startTime}|${d.endTime}`, `${d.startTime} - ${d.endTime}`));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const locationOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.location, d.location));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);

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
          (period === FILTER_ALL || d.participants.some((p) => `${p.academicYear}|${p.semester}` === period)) &&
          (classroomId === FILTER_ALL || d.participants.some((p) => p.classroomId === classroomId)) &&
          (groupId === FILTER_ALL || d.participants.some((p) => p.groupId === groupId)) &&
          (studentId === FILTER_ALL || d.participants.some((p) => p.requestId === studentId)) &&
          (sessionName === FILTER_ALL || d.sessionName === sessionName) &&
          (time === FILTER_ALL || `${d.startTime}|${d.endTime}` === time) &&
          (location === FILTER_ALL || d.location === location) &&
          isDateInRange(d.date, dateRange),
      ),
    [data, period, classroomId, groupId, studentId, sessionName, time, location, dateRange],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteMunaqasyahSchedule(id);
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

  const columns = useMemo<ColumnDef<MunaqasyahScheduleTableData>[]>(
    () => [
      {
        accessorFn: (row) => row.date,
        id: 'Tanggal',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString('id-ID'),
      },
      { accessorKey: 'sessionName', id: 'Sesi', header: 'Sesi' },
      {
        id: 'Waktu',
        header: 'Waktu',
        cell: ({ row }) => `${row.original.startTime} - ${row.original.endTime}`,
      },
      { accessorKey: 'location', id: 'Lokasi', header: 'Lokasi' },
      {
        accessorKey: 'examinerName',
        id: 'Penguji',
        header: 'Penguji',
        cell: ({ row }) => row.original.examinerName ?? '-',
      },
      {
        id: 'Jumlah Peserta',
        header: 'Jumlah Peserta',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <MunaqasyahScheduleParticipantsDialog
              sessionName={row.original.sessionName}
              date={row.original.date}
              startTime={row.original.startTime}
              endTime={row.original.endTime}
              location={row.original.location}
              participants={row.original.participants}
            />
            <span>{row.original.participants.length}</span>
          </div>
        ),
      },
      {
        id: 'Aksi',
        enableHiding: false,
        header: 'Aksi',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <MunaqasyahScheduleEditDialog schedule={row.original} teachers={teachers} />
            <DeleteConfirmDialog
              title="Hapus Jadwal Munaqasyah"
              description="Apakah Anda yakin ingin menghapus jadwal munaqasyah ini? Tindakan ini tidak dapat dibatalkan."
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
    ],
    [deletingId, handleDelete, teachers],
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
    const classroomLabel = classroomOptions.find((o) => o.value === classroomId)?.label;
    if (classroomId !== FILTER_ALL && classroomLabel) parts.push(`Kelas: ${classroomLabel}`);
    const groupLabel = groupOptions.find((o) => o.value === groupId)?.label;
    if (groupId !== FILTER_ALL && groupLabel) parts.push(`Kelompok: ${groupLabel}`);
    const studentLabel = studentOptions.find((o) => o.value === studentId)?.label;
    if (studentId !== FILTER_ALL && studentLabel) parts.push(`Siswa: ${studentLabel}`);
    if (sessionName !== FILTER_ALL) parts.push(`Sesi: ${sessionName}`);
    if (time !== FILTER_ALL) {
      const timeLabel = timeOptions.find((o) => o.value === time)?.label;
      if (timeLabel) parts.push(`Waktu: ${timeLabel}`);
    }
    if (location !== FILTER_ALL) parts.push(`Lokasi: ${location}`);
    if (dateRange?.from || dateRange?.to) {
      parts.push(
        `Tanggal Jadwal: ${dateRange.from ? formatDateID(dateRange.from) : '...'} - ${dateRange.to ? formatDateID(dateRange.to) : '...'}`,
      );
    }
    return parts.length > 0 ? parts.join(' • ') : undefined;
  }, [
    classroomId,
    classroomOptions,
    groupId,
    groupOptions,
    studentId,
    studentOptions,
    sessionName,
    time,
    timeOptions,
    location,
    dateRange,
  ]);

  return (
    <DataTable
      title="Jadwal Munaqasyah"
      titleAction={
        data.length > 0 && schoolInfo && exportedBy ? (
          <ExportMunaqasyahSchedulePdfButton
            table={table}
            schoolInfo={schoolInfo}
            exportedBy={exportedBy}
            periodLabel={periodLabel}
            filterSummary={filterSummary}
          />
        ) : undefined
      }
      table={table}
      filterColumn="Sesi"
      toolbar={
        data.length > 0 ? (
          <TableFilters
            period={{ value: period, onChange: handlePeriodChange, options: periodOptions }}
            classroom={{ value: classroomId, onChange: handleClassroomChange, options: classroomOptions }}
            group={{ value: groupId, onChange: handleGroupChange, options: groupOptions }}
            student={{ value: studentId, onChange: setStudentId, options: studentOptions }}
            extraFilters={[
              {
                key: 'sessionName',
                label: 'Sesi',
                allLabel: 'Semua Sesi',
                value: sessionName,
                onChange: setSessionName,
                options: sessionOptions,
              },
              {
                key: 'time',
                label: 'Waktu',
                allLabel: 'Semua Waktu',
                value: time,
                onChange: setTime,
                options: timeOptions,
              },
              {
                key: 'location',
                label: 'Lokasi',
                allLabel: 'Semua Lokasi',
                value: location,
                onChange: setLocation,
                options: locationOptions,
              },
            ]}
            dateRange={{ value: dateRange, onChange: setDateRange, label: 'Tanggal Jadwal' }}
          />
        ) : undefined
      }
    />
  );
}
