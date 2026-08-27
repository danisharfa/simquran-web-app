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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        description: description || null,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setTopic('');
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
        const result = await deleteTahsinScore(id);
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

  const handleEditRow = useCallback((row: TahsinScoreData) => {
    setTahsinType(row.tahsinType as 'WAFA' | 'ALQURAN');
    setTopic(row.topic);
    setScore(String(row.score));
    setDescription(row.description ?? '');
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
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline">
            <BookOpenIcon />
            Input Nilai Tahsin
          </Button>
        }
      />

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpenIcon className="size-5" />
            Penilaian Tahsin
          </DialogTitle>
          <DialogDescription>Tambah atau perbarui nilai tahsin siswa.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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

          <Field>
            <FieldLabel>Deskripsi</FieldLabel>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={1} />
          </Field>
        </div>

        <DataTable table={table} showColumnFilter={false} />

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
