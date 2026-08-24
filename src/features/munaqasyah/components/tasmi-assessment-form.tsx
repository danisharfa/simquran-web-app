'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calculateTasmiPercentage, calculateTasmiTotalScore, scoreToGrade } from '../munaqasyah-scoring';
import { submitTasmiResult } from '../actions/submit-tasmi-result';
import { GRADE_LABEL } from '../munaqasyah.schema';
import type { SurahInJuz } from '../queries/list-surahs-in-juz';

interface Row {
  surahId: number;
  surahName: string;
  initialScore: number;
  khofiAwalAyat: number;
  khofiMakhroj: number;
  khofiTajwidMad: number;
  jaliBaris: number;
  jaliLebihSatuKalimat: number;
  note: string;
}

interface Props {
  requestId: string;
  surahs: SurahInJuz[];
}

function buildInitialRows(surahs: SurahInJuz[]): Row[] {
  return surahs.map((s) => ({
    surahId: s.surahId,
    surahName: s.surahName,
    initialScore: 100,
    khofiAwalAyat: 0,
    khofiMakhroj: 0,
    khofiTajwidMad: 0,
    jaliBaris: 0,
    jaliLebihSatuKalimat: 0,
    note: '',
  }));
}

export function TasmiAssessmentForm({ requestId, surahs }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() => buildInitialRows(surahs));
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateRow(index: number, field: keyof Row, value: number | string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  const { totalScore } = useMemo(() => calculateTasmiTotalScore(rows), [rows]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const result = await submitTasmiResult(
        requestId,
        rows.map((r) => ({ ...r, note: r.note || null })),
      );

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

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Surah</TableHead>
              <TableHead>Nilai Awal</TableHead>
              <TableHead>Khofi Awal Ayat</TableHead>
              <TableHead>Khofi Makhroj</TableHead>
              <TableHead>Khofi Tajwid/Mad</TableHead>
              <TableHead>Jali Baris</TableHead>
              <TableHead>Jali &gt;1 Kalimat</TableHead>
              <TableHead>%</TableHead>
              <TableHead>Catatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={row.surahId}>
                <TableCell>{row.surahName}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="w-20"
                    value={row.initialScore}
                    onChange={(e) => updateRow(i, 'initialScore', Number(e.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    className="w-16"
                    value={row.khofiAwalAyat}
                    onChange={(e) => updateRow(i, 'khofiAwalAyat', Number(e.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    className="w-16"
                    value={row.khofiMakhroj}
                    onChange={(e) => updateRow(i, 'khofiMakhroj', Number(e.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    className="w-16"
                    value={row.khofiTajwidMad}
                    onChange={(e) => updateRow(i, 'khofiTajwidMad', Number(e.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    className="w-16"
                    value={row.jaliBaris}
                    onChange={(e) => updateRow(i, 'jaliBaris', Number(e.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    className="w-16"
                    value={row.jaliLebihSatuKalimat}
                    onChange={(e) => updateRow(i, 'jaliLebihSatuKalimat', Number(e.target.value))}
                  />
                </TableCell>
                <TableCell className="font-medium">{calculateTasmiPercentage(row).toFixed(1)}</TableCell>
                <TableCell>
                  <Input
                    className="w-32"
                    value={row.note}
                    onChange={(e) => updateRow(i, 'note', e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between rounded-md border p-4">
        <div>
          <p className="text-muted-foreground text-sm">Total Skor Tasmi</p>
          <p className="text-lg font-bold">
            {totalScore.toFixed(1)} — {GRADE_LABEL[scoreToGrade(totalScore)]}
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner />
              Menyimpan...
            </>
          ) : (
            'Simpan Hasil Tasmi'
          )}
        </Button>
      </div>
    </div>
  );
}
