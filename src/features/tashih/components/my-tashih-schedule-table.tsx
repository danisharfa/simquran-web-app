'use client';

import { useMemo, useState } from 'react';
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
import { Users } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FILTER_ALL, TableFilters, isDateInRange, buildPeriodOptions } from '@/components/layouts/filters/table-filters';
import { ExportMyTashihSchedulePdfButton } from './export-my-tashih-schedule-pdf-button';
import { formatDateID } from '@/lib/pdf/format';
import type { MyTashihScheduleData } from '../queries/list-my-tashih-schedule';

const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

interface Props {
  data: MyTashihScheduleData[];
  own?: boolean;
  currentPeriod?: string;
  schoolInfo?: { schoolName: string; schoolAddress: string | null };
  exportedBy?: { name: string; role: string };
}

function ParticipantsDialog({ schedule }: { schedule: MyTashihScheduleData }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon">
            <Users className="h-4 w-4" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Peserta Sesi</DialogTitle>
          <DialogDescription>
            {schedule.sessionName} · {new Date(schedule.date).toLocaleDateString('id-ID')} · {schedule.startTime}-
            {schedule.endTime} · {schedule.location}
          </DialogDescription>
        </DialogHeader>

        {schedule.participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada peserta pada sesi ini.</p>
        ) : (
          <div className="divide-y">
            {schedule.participants.map((p) => (
              <div key={p.requestId} className="flex flex-col gap-1 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {p.studentName} <span className="text-muted-foreground">({p.nis})</span>
                  </span>
                  <span className="text-muted-foreground">{p.detail}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.groupName} · {p.classroomName}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function MyTashihScheduleTable({ data, own = false, currentPeriod, schoolInfo, exportedBy }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [period, setPeriod] = useState(currentPeriod ?? FILTER_ALL);
  const [classroomId, setClassroomId] = useState(FILTER_ALL);
  const [groupId, setGroupId] = useState(FILTER_ALL);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

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

  function handlePeriodChange(value: string) {
    setPeriod(value);
    setClassroomId(FILTER_ALL);
    setGroupId(FILTER_ALL);
  }
  function handleClassroomChange(value: string) {
    setClassroomId(value);
    setGroupId(FILTER_ALL);
  }

  const filteredData = useMemo(
    () =>
      data.filter(
        (d) =>
          (period === FILTER_ALL || d.participants.some((p) => `${p.academicYear}|${p.semester}` === period)) &&
          (classroomId === FILTER_ALL || d.participants.some((p) => p.classroomId === classroomId)) &&
          (groupId === FILTER_ALL || d.participants.some((p) => p.groupId === groupId)) &&
          isDateInRange(d.date, dateRange),
      ),
    [data, period, classroomId, groupId, dateRange],
  );

  const columns = useMemo<ColumnDef<MyTashihScheduleData>[]>(
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
      ...(own
        ? [
            {
              id: 'Detail',
              header: 'Detail',
              cell: ({ row }) => row.original.participants[0]?.detail ?? '',
            } satisfies ColumnDef<MyTashihScheduleData>,
          ]
        : [
            {
              id: 'Jumlah Peserta',
              header: 'Jumlah Peserta',
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  <ParticipantsDialog schedule={row.original} />
                  <span>{row.original.participants.length}</span>
                </div>
              ),
            } satisfies ColumnDef<MyTashihScheduleData>,
          ]),
    ],
    [own],
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
    if (dateRange?.from || dateRange?.to) {
      parts.push(
        `Tanggal Jadwal: ${dateRange.from ? formatDateID(dateRange.from) : '...'} - ${dateRange.to ? formatDateID(dateRange.to) : '...'}`,
      );
    }
    return parts.length > 0 ? parts.join(' • ') : undefined;
  }, [own, classroomId, classroomOptions, groupId, groupOptions, dateRange]);

  return (
    <DataTable
      title="Jadwal Tashih"
      titleAction={
        data.length > 0 && schoolInfo && exportedBy ? (
          <ExportMyTashihSchedulePdfButton
            table={table}
            own={own}
            schoolInfo={schoolInfo}
            exportedBy={exportedBy}
            periodLabel={periodLabel}
            filterSummary={filterSummary}
          />
        ) : undefined
      }
      table={table}
      toolbar={
        data.length > 0 ? (
          <TableFilters
            period={{ value: period, onChange: handlePeriodChange, options: periodOptions }}
            classroom={own ? undefined : { value: classroomId, onChange: handleClassroomChange, options: classroomOptions }}
            group={own ? undefined : { value: groupId, onChange: setGroupId, options: groupOptions }}
            dateRange={{ value: dateRange, onChange: setDateRange, label: 'Tanggal Jadwal' }}
          />
        ) : undefined
      }
    />
  );
}
