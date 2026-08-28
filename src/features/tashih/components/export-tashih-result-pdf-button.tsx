'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { TableReportDocument, type PdfColumn } from '@/components/pdf/table-report-document';
import { ROLE_LABEL, downloadBlob, formatDateID, pdfFilename } from '@/lib/pdf/format';
import type { TashihResultTableData } from '../queries/list-all-tashih-results';

interface Props {
  table: Table<TashihResultTableData>;
  schoolInfo: { schoolName: string; schoolAddress: string | null };
  exportedBy: { name: string; role: string };
  periodLabel?: string;
  filterSummary?: string;
  own?: boolean;
}

export function ExportTashihResultPdfButton({ table, schoolInfo, exportedBy, periodLabel, filterSummary, own = false }: Props) {
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
              { header: 'NIS', width: 8 },
              { header: 'Nama Siswa', width: 14 },
              { header: 'Kelas', width: 8 },
              { header: 'Kelompok', width: 9 },
            ] as PdfColumn[])),
        { header: 'Detail', width: 22 },
        { header: 'Tanggal', width: 11 },
        { header: 'Hasil', width: 10 },
        { header: 'Catatan', width: 18 },
      ];
      const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
      const normalizedColumns = columns.map((c) => ({ ...c, width: (c.width / totalWidth) * 100 }));

      const pdfRows = rows.map((row) => [
        ...(own ? [] : [row.nis, row.studentName, row.classroomName, row.groupName]),
        row.detail,
        formatDateID(row.scheduleDate),
        row.passed ? 'Lulus' : 'Tidak Lulus',
        row.notes ?? '-',
      ]);

      const blob = await pdf(
        <TableReportDocument
          meta={{
            schoolName: schoolInfo.schoolName,
            schoolAddress: schoolInfo.schoolAddress,
            title: 'LAPORAN HASIL TASHIH',
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

      downloadBlob(blob, pdfFilename('hasil-tashih'));
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
