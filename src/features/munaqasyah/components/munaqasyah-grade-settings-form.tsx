'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { updateMunaqasyahGradeSettings } from '../actions/update-munaqasyah-grade-settings';
import type { MunaqasyahGradeSettingData } from '../munaqasyah-scoring';

interface Props {
  settings: MunaqasyahGradeSettingData[];
  readOnly?: boolean;
}

export function MunaqasyahGradeSettingsForm({ settings, readOnly = false }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = rows.some((row, i) => {
    const original = settings[i];
    return row.minScore !== original?.minScore || row.label !== original?.label;
  });

  function updateRow(grade: string, field: 'minScore' | 'label', value: string | number) {
    setRows((prev) => prev.map((r) => (r.grade === grade ? { ...r, [field]: value } : r)));
  }

  async function handleSave() {
    setIsSubmitting(true);
    try {
      const result = await updateMunaqasyahGradeSettings({ settings: rows });
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Batas Lulus &amp; Predikat Munaqasyah</CardTitle>
        <CardDescription>
          Nilai minimal dan label tiap predikat Tasmi/Munaqasyah. Batas lulus (KKM) mengikuti nilai minimal Jayyid —
          di bawah itu otomatis Tidak Lulus.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Predikat</TableHead>
              <TableHead>Nilai Minimal</TableHead>
              <TableHead>Label</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.grade}>
                <TableCell className="font-medium">{row.grade}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-24"
                    value={row.minScore}
                    disabled={readOnly}
                    onChange={(e) => updateRow(row.grade, 'minScore', Number(e.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="w-48"
                    value={row.label}
                    disabled={readOnly}
                    onChange={(e) => updateRow(row.grade, 'label', e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {!readOnly && (
        <CardFooter>
          <Button onClick={handleSave} disabled={!isDirty || isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner />
                Menyimpan...
              </>
            ) : (
              'Simpan'
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
