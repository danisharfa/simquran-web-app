'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { TableReportDocument, type PdfColumn } from '@/components/pdf/table-report-document';
import { ROLE_LABEL, downloadBlob, pdfFilename } from '@/lib/pdf/format';
import { TAHAP_OPTIONS } from '../munaqasyah.schema';
import type { MunaqasyahCombinedResultData } from '../queries/list-munaqasyah-combined-results';
import type { MunaqasyahGrade } from '@/lib/generated/prisma/enums';

const TAHAP_LABEL = Object.fromEntries(TAHAP_OPTIONS.map((o) => [o.value, o.label]));

function formatSubResult(
  detail: { totalScore: number; grade: MunaqasyahGrade } | null,
  gradeLabelMap: Record<MunaqasyahGrade, string>,
): string {
  if (!detail) return 'Belum dinilai';
  return `${detail.totalScore.toFixed(1)} (${gradeLabelMap[detail.grade]})`;
}

interface Props {
  table: Table<MunaqasyahCombinedResultData>;
  schoolInfo: { schoolName: string; schoolAddress: string | null };
  exportedBy: { name: string; role: string };
  periodLabel?: string;
  filterSummary?: string;
  own?: boolean;
  gradeLabelMap: Record<MunaqasyahGrade, string>;
}

export function ExportMunaqasyahResultPdfButton({
  table,
  schoolInfo,
  exportedBy,
  periodLabel,
  filterSummary,
  own = false,
  gradeLabelMap,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original);
    if (rows.length === 0) {
      toast('Tidak ada data untuk diekspor.');
      return;
    }

    setLoading(true);
    try {
      const columns: PdfColumn[] = [
        ...(own
          ? []
          : ([
              { header: 'NIS', width: 7 },
              { header: 'Nama Siswa', width: 12 },
              { header: 'Kelas', width: 7 },
              { header: 'Kelompok', width: 8 },
            ] as PdfColumn[])),
        { header: 'Juz', width: 8 },
        { header: 'Tahap', width: 8 },
        { header: 'Tasmi', width: 14 },
        { header: 'Munaqasyah', width: 14 },
        { header: 'Nilai Akhir', width: 22 },
      ];
      const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
      const normalizedColumns = columns.map((c) => ({ ...c, width: (c.width / totalWidth) * 100 }));

      const pdfRows = rows.map((row) => {
        const finalResult =
          row.finalScore == null || row.finalGrade == null
            ? 'Menunggu pasangan hasil'
            : `${row.finalScore.toFixed(1)} (${gradeLabelMap[row.finalGrade]}) - ${row.passed ? 'Lulus' : 'Tidak Lulus'}`;

        return [
          ...(own ? [] : [row.nis, row.studentName, row.classroomName, row.groupName]),
          row.juzName,
          TAHAP_LABEL[row.tahap] ?? row.tahap,
          formatSubResult(row.tasmi, gradeLabelMap),
          formatSubResult(row.munaqasyah, gradeLabelMap),
          finalResult,
        ];
      });

      const blob = await pdf(
        <TableReportDocument
          meta={{
            schoolName: schoolInfo.schoolName,
            schoolAddress: schoolInfo.schoolAddress,
            title: 'LAPORAN HASIL MUNAQASYAH',
            periodLabel,
            filterSummary,
            exportedByName: exportedBy.name,
            exportedByRole: ROLE_LABEL[exportedBy.role] ?? exportedBy.role,
            totalCount: rows.length,
            totalLabel: 'hasil',
          }}
          columns={normalizedColumns}
          rows={pdfRows}
        />,
      ).toBlob();

      downloadBlob(blob, pdfFilename('hasil-munaqasyah'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      <Download />
      {loading ? 'Menyiapkan...' : 'Ekspor PDF'}
    </Button>
  );
}
