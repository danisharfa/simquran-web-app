'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import {
  ColumnDef,
  ColumnFiltersState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { GRADE_DESCRIPTION } from '../grade';
import { TAHSIN_TYPE_OPTIONS } from '../score.schema';
import { upsertTahsinScore } from '../actions/upsert-tahsin-score';
import { deleteTahsinScore } from '../actions/delete-tahsin-score';
import type { TahsinScoreData } from '../queries/list-tahsin-scores';

interface Props {
  studentId: string;
  groupId: string;
  scores: TahsinScoreData[];
}

export function TahsinScorePanel({ studentId, groupId, scores }: Props) {
  const router = useRouter();
  const [tahsinType, setTahsinType] = useState<'WAFA' | 'ALQURAN'>('WAFA');
  const [topic, setTopic] = useState('');
  const [score, setScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  async function handleSave() {
    if (!topic || !score) {
      toast.error('Isi topik dan nilai terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await upsertTahsinScore({
        studentId,
        groupId,
        tahsinType,
        topic,
        score: Number(score),
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setTopic('');
      setScore('');
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteTahsinScore(id);
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

  const handleEditRow = useCallback((row: TahsinScoreData) => {
    setTahsinType(row.tahsinType as 'WAFA' | 'ALQURAN');
    setTopic(row.topic);
    setScore(String(row.score));
  }, []);

  const columns = useMemo<ColumnDef<TahsinScoreData>[]>(
    () => [
      {
        accessorKey: 'tahsinType',
        id: 'Jenis',
        header: 'Jenis',
        cell: ({ row }) => TAHSIN_TYPE_OPTIONS.find((o) => o.value === row.original.tahsinType)?.label,
      },
      { accessorKey: 'topic', id: 'Topik', header: 'Topik' },
      { accessorKey: 'score', id: 'Nilai', header: 'Nilai' },
      {
        accessorKey: 'grade',
        id: 'Grade',
        header: 'Grade',
        cell: ({ row }) => `${row.original.grade} (${GRADE_DESCRIPTION[row.original.grade as 'A' | 'B' | 'C' | 'D']})`,
      },
      { accessorKey: 'description', id: 'Deskripsi', header: 'Deskripsi' },
      {
        id: 'Aksi',
        header: 'Aksi',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => handleEditRow(row.original)}>
              Edit
            </Button>
            <DeleteConfirmDialog
              title="Hapus Nilai Tahsin"
              description="Apakah Anda yakin ingin menghapus nilai tahsin ini? Tindakan ini tidak dapat dibatalkan."
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
    [deletingId, handleDelete, handleEditRow],
  );

  const table = useReactTable({
    data: scores,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field>
          <FieldLabel>Jenis</FieldLabel>
          <Select value={tahsinType} onValueChange={(v) => setTahsinType(v as 'WAFA' | 'ALQURAN')}>
            <SelectTrigger>
              <SelectValue>{TAHSIN_TYPE_OPTIONS.find((o) => o.value === tahsinType)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TAHSIN_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Topik</FieldLabel>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Contoh: Halaman 12" />
        </Field>

        <Field>
          <FieldLabel>Nilai (0-100)</FieldLabel>
          <Input type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} />
        </Field>
      </div>
      <p className="text-muted-foreground text-sm">
        Deskripsi dibuat otomatis berdasarkan nilai (mis. &quot;Sangat baik dalam memahami ...&quot;).
      </p>

      <DataTable table={table} showColumnFilter={false} />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Spinner />
              Menyimpan...
            </>
          ) : (
            'Simpan Nilai Tahsin'
          )}
        </Button>
      </div>
    </div>
  );
}
