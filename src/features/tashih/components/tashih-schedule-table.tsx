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
import { FILTER_ALL, TableFilters, isDateInRange } from '@/components/layouts/filters/table-filters';
import { deleteTashihSchedule } from '../actions/delete-tashih-schedule';
import { TashihScheduleParticipantsDialog } from './tashih-schedule-participants-dialog';
import { TashihScheduleEditDialog } from './tashih-schedule-edit-dialog';
import type { TashihScheduleTableData } from '../queries/list-tashih-schedules';

const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

interface Props {
  data: TashihScheduleTableData[];
}

export function TashihScheduleTable({ data }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [period, setPeriod] = useState(FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
  const [studentId, setStudentId] = useState(FILTER_ALL);
  const [sesi, setSesi] = useState(FILTER_ALL);
  const [waktu, setWaktu] = useState(FILTER_ALL);
  const [lokasi, setLokasi] = useState(FILTER_ALL);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const participants = useMemo(() => data.flatMap((d) => d.participants), [data]);

  const periodOptions = useMemo(() => {
    const map = new Map<string, string>();
    participants.forEach((p) =>
      map.set(`${p.academicYear}|${p.semester}`, `${p.academicYear} ${SEMESTER_LABEL[p.semester] ?? p.semester}`),
    );
    return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) => b.value.localeCompare(a.value));
  }, [participants]);
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
  const sesiOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.sessionName, d.sessionName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const waktuOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => {
      const value = `${d.startTime} - ${d.endTime}`;
      map.set(value, value);
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [data]);
  const lokasiOptions = useMemo(() => {
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
          (sesi === FILTER_ALL || d.sessionName === sesi) &&
          (waktu === FILTER_ALL || `${d.startTime} - ${d.endTime}` === waktu) &&
          (lokasi === FILTER_ALL || d.location === lokasi) &&
          isDateInRange(d.date, dateRange),
      ),
    [data, period, classroomId, groupId, studentId, sesi, waktu, lokasi, dateRange],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteTashihSchedule(id);
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

  const columns = useMemo<ColumnDef<TashihScheduleTableData>[]>(
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
        id: 'Jumlah Peserta',
        header: 'Jumlah Peserta',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <TashihScheduleParticipantsDialog schedule={row.original} />
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
            <TashihScheduleEditDialog schedule={row.original} />
            <DeleteConfirmDialog
              title="Hapus Jadwal Tashih"
              description="Apakah Anda yakin ingin menghapus jadwal tashih ini? Tindakan ini tidak dapat dibatalkan."
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
    [deletingId, handleDelete],
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

  return (
    <DataTable
      title="Jadwal Tashih"
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
              { key: 'sesi', label: 'Sesi', allLabel: 'Semua Sesi', value: sesi, onChange: setSesi, options: sesiOptions },
              {
                key: 'waktu',
                label: 'Waktu',
                allLabel: 'Semua Waktu',
                value: waktu,
                onChange: setWaktu,
                options: waktuOptions,
              },
              {
                key: 'lokasi',
                label: 'Lokasi',
                allLabel: 'Semua Lokasi',
                value: lokasi,
                onChange: setLokasi,
                options: lokasiOptions,
              },
            ]}
            dateRange={{ value: dateRange, onChange: setDateRange, label: 'Tanggal Jadwal' }}
          />
        ) : undefined
      }
    />
  );
}
