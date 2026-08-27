'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BookOpenIcon, Trash2 } from 'lucide-react';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        description: description || null,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setSurahId(null);
      setScore('');
      setDescription('');
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

  const handleEditRow = useCallback((row: TahfidzScoreData) => {
    setSurahId(row.surahId);
    setScore(String(row.score));
    setDescription(row.description ?? '');
  }, []);

  const columns = useMemo<ColumnDef<TahfidzScoreData>[]>(
    () => [
      { accessorKey: 'surahName', id: 'Surah', header: 'Surah' },
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
    ],
    [deletingId, handleDelete, handleEditRow],
  );

  const table = useReactTable({
    data: scores,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpenIcon className="size-5" />
          Penilaian Tahfidz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel>Surah</FieldLabel>
            <Select
              value={surahId ? String(surahId) : ''}
              onValueChange={(v) => setSurahId(v ? Number(v) : null)}
            >
              <SelectTrigger>
                <SelectValue>{surahOptions.find((o) => o.id === surahId)?.name ?? 'Pilih surah'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {surahOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Nilai (0-100)</FieldLabel>
            <Input type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} />
          </Field>

          <Field>
            <FieldLabel>Deskripsi</FieldLabel>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={1} />
          </Field>
        </div>

        <DataTable table={table} showColumnFilter={false} />
      </CardContent>
      <CardFooter>
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
      </CardFooter>
    </Card>
  );
}
