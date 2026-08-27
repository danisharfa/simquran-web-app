'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { HOME_ACTIVITY_TYPE_OPTIONS } from '../home-activity.schema';
import { deleteHomeActivity } from '../actions/delete-home-activity';
import { HomeActivityEditDialog } from './home-activity-edit-dialog';
import type { HomeActivityTableData } from '../queries/list-own-home-activities';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

const TYPE_LABEL = Object.fromEntries(HOME_ACTIVITY_TYPE_OPTIONS.map((o) => [o.value, o.label]));
const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

const ALL = '__ALL__';

interface Props {
  data: HomeActivityTableData[];
  editable?: boolean;
  showFilters?: boolean;
  surahOptions?: ReferenceOption[];
  juzOptions?: ReferenceOption[];
  surahJuzMap?: SurahJuzMapping[];
}

export function HomeActivityTable({
  data,
  editable = false,
  showFilters = false,
  surahOptions = [],
  juzOptions = [],
  surahJuzMap = [],
}: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [period, setPeriod] = useState(ALL);
  const [classroomId, setClassroomId] = useState(ALL);
  const [groupId, setGroupId] = useState(ALL);

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
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [data]);
  const groupOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((d) => map.set(d.groupId, d.groupName));
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!showFilters) return data;
    return data.filter(
      (d) =>
        (period === ALL || `${d.academicYear}|${d.semester}` === period) &&
        (classroomId === ALL || d.classroomId === classroomId) &&
        (groupId === ALL || d.groupId === groupId),
    );
  }, [data, showFilters, period, classroomId, groupId]);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteHomeActivity(id);
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
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={deletingId === row.original.id}
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>
          </div>
        ),
      },
    ];
  }, [editable, surahOptions, juzOptions, surahJuzMap, deletingId, handleDelete]);

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
        showFilters ? (
          <div className="flex flex-wrap items-center gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v ?? ALL)}>
              <SelectTrigger className="w-44">
                <SelectValue>
                  {period === ALL ? 'Semua Tahun Ajaran' : (periodOptions.find((p) => p.value === period)?.label ?? period)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Semua Tahun Ajaran</SelectItem>
                {periodOptions.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={classroomId} onValueChange={(v) => setClassroomId(v ?? ALL)}>
              <SelectTrigger className="w-32">
                <SelectValue>
                  {classroomId === ALL
                    ? 'Semua Kelas'
                    : (classroomOptions.find((c) => c.id === classroomId)?.name ?? 'Semua Kelas')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Semua Kelas</SelectItem>
                {classroomOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={groupId} onValueChange={(v) => setGroupId(v ?? ALL)}>
              <SelectTrigger className="w-36">
                <SelectValue>
                  {groupId === ALL
                    ? 'Semua Kelompok'
                    : (groupOptions.find((g) => g.id === groupId)?.name ?? 'Semua Kelompok')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Semua Kelompok</SelectItem>
                {groupOptions.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : undefined
      }
    />
  );
}
