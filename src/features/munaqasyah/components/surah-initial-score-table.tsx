'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { DataTableColumnHeader } from '@/components/ui/table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { updateSurahInitialScores } from '../actions/update-surah-initial-scores';
import type { SurahInitialScoreData } from '../queries/list-surah-initial-scores';

interface Props {
  data: SurahInitialScoreData[];
  readOnly?: boolean;
}

export function SurahInitialScoreTable({ data, readOnly = false }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rows, setRows] = useState(data);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(
    () => rows.some((row, i) => row.initialScore !== data[i]?.initialScore),
    [rows, data],
  );

  function updateScore(surahId: number, value: number) {
    setRows((prev) => prev.map((r) => (r.surahId === surahId ? { ...r, initialScore: value } : r)));
  }

  async function handleSave() {
    setIsSubmitting(true);
    try {
      const result = await updateSurahInitialScores({
        scores: rows.map((r) => ({ surahId: r.surahId, initialScore: r.initialScore })),
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns = useMemo<ColumnDef<SurahInitialScoreData>[]>(
    () => [
      {
        accessorKey: 'surahId',
        id: 'No',
        header: ({ column }) => <DataTableColumnHeader column={column} title="No" />,
      },
      {
        accessorKey: 'surahName',
        id: 'Nama Surah',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Surah" />,
      },
      {
        accessorKey: 'initialScore',
        id: 'Nilai Awal',
        header: 'Nilai Awal',
        cell: ({ row }) => (
          <Input
            type="number"
            min={1}
            className="w-24"
            value={row.original.initialScore}
            disabled={readOnly}
            onChange={(e) => updateScore(row.original.surahId, Number(e.target.value))}
          />
        ),
      },
    ],
    [readOnly],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <DataTable
      title="Nilai Awal Tasmi per Surah"
      table={table}
      filterColumn="Nama Surah"
      toolbar={
        readOnly ? undefined : (
          <Button onClick={handleSave} disabled={!isDirty || isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner />
                Menyimpan...
              </>
            ) : (
              'Simpan Semua'
            )}
          </Button>
        )
      }
    />
  );
}
