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
import { upsertTahfidzScore } from '../actions/upsert-tahfidz-score';
import { deleteTahfidzScore } from '../actions/delete-tahfidz-score';
import type { TahfidzScoreData } from '../queries/list-tahfidz-scores';
import type { ReferenceOption } from '@/features/quran-reference/queries/list-reference-options';

interface Props {
  studentId: string;
  groupId: string;
  scores: TahfidzScoreData[];
  surahOptions: ReferenceOption[];
}

export function TahfidzScorePanel({ studentId, groupId, scores, surahOptions }: Props) {
  const router = useRouter();
  const [surahId, setSurahId] = useState<number | null>(null);
  const [score, setScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const scoredSurahIds = useMemo(() => new Set(scores.map((s) => s.surahId)), [scores]);
  const eligibleSurahOptions = useMemo(
    () => surahOptions.filter((o) => !scoredSurahIds.has(o.id) || o.id === surahId),
    [surahOptions, scoredSurahIds, surahId],
  );

  async function handleSave() {
    if (!surahId || !score) {
      toast.error('Pilih surah dan isi nilai terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await upsertTahfidzScore({
        studentId,
        groupId,
        surahId,
        score: Number(score),
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setSurahId(null);
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
        const result = await deleteTahfidzScore(id);
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

  const handleEditRow = useCallback((row: TahfidzScoreData) => {
    setSurahId(row.surahId);
    setScore(String(row.score));
  }, []);

  const columns = useMemo<ColumnDef<TahfidzScoreData>[]>(
    () => [
      { accessorKey: 'surahName', id: 'Surah', header: 'Surah' },
      { accessorKey: 'score', id: 'Nilai', header: 'Nilai' },
      {
        accessorKey: 'grade',
        id: 'Grade',
        header: 'Grade',
        cell: ({ row }) =>
          `${row.original.grade} (${GRADE_DESCRIPTION[row.original.grade as 'A' | 'B' | 'C' | 'D']})`,
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
              title="Hapus Nilai Tahfidz"
              description="Apakah Anda yakin ingin menghapus nilai tahfidz ini? Tindakan ini tidak dapat dibatalkan."
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>Surah</FieldLabel>
          <Select
            value={surahId ? String(surahId) : ''}
            onValueChange={(v) => setSurahId(v ? Number(v) : null)}
          >
            <SelectTrigger>
              <SelectValue>
                {surahOptions.find((o) => o.id === surahId)?.name ?? 'Pilih surah'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {eligibleSurahOptions.map((opt) => (
                <SelectItem key={opt.id} value={String(opt.id)}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Nilai (0-100)</FieldLabel>
          <Input
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
        </Field>
      </div>
      <p className="text-muted-foreground text-sm">
        Deskripsi dibuat otomatis berdasarkan nilai (mis. &quot;Sangat baik dalam menghafal
        ...&quot;).
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
            'Simpan Nilai Tahfidz'
          )}
        </Button>
      </div>
    </div>
  );
}
