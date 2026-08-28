'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  calculateMunaqasyahPercentage,
  calculateMunaqasyahTotalScore,
  scoreToGrade,
  buildGradeLabelMap,
  type ScoringWeights,
  type MunaqasyahGradeSettingData,
} from '../munaqasyah-scoring';
import { submitMunaqasyahResult } from '../actions/submit-munaqasyah-result';
import { updateMunaqasyahResult } from '../actions/update-munaqasyah-result';

interface Row {
  questionNo: number;
  khofiAwalAyat: number;
  khofiMakhroj: number;
  khofiTajwidMad: number;
  jaliBaris: number;
  jaliLebihSatuKalimat: number;
  note: string;
}

function buildInitialRows(): Row[] {
  return Array.from({ length: 5 }, (_, i) => ({
    questionNo: i + 1,
    khofiAwalAyat: 0,
    khofiMakhroj: 0,
    khofiTajwidMad: 0,
    jaliBaris: 0,
    jaliLebihSatuKalimat: 0,
    note: '',
  }));
}

interface Props {
  requestId?: string;
  weights: ScoringWeights;
  gradeSettings: MunaqasyahGradeSettingData[];
  resultId?: string;
  initialRows?: Row[];
  onSaved?: () => void;
}

export function MunaqasyahAssessmentForm({ requestId, weights, gradeSettings, resultId, initialRows, onSaved }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() => initialRows ?? buildInitialRows());
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateRow(index: number, field: keyof Row, value: number | string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  const { totalScore } = useMemo(() => calculateMunaqasyahTotalScore(rows, weights), [rows, weights]);
  const gradeLabelMap = useMemo(() => buildGradeLabelMap(gradeSettings), [gradeSettings]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const payload = rows.map((r) => ({ ...r, note: r.note || null }));
      const result = resultId
        ? await updateMunaqasyahResult(resultId, payload)
        : await submitMunaqasyahResult(requestId!, payload);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
      onSaved?.();
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
              <TableHead>Soal</TableHead>
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
              <TableRow key={row.questionNo}>
                <TableCell>Soal {row.questionNo}</TableCell>
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
                <TableCell className="font-medium">{calculateMunaqasyahPercentage(row, weights).toFixed(1)}</TableCell>
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
          <p className="text-muted-foreground text-sm">Total Skor Munaqasyah</p>
          <p className="text-lg font-bold">
            {totalScore.toFixed(1)} — {gradeLabelMap[scoreToGrade(totalScore, gradeSettings)]}
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner />
              Menyimpan...
            </>
          ) : resultId ? (
            'Simpan Perubahan'
          ) : (
            'Simpan Hasil Munaqasyah'
          )}
        </Button>
      </div>
    </div>
  );
}
