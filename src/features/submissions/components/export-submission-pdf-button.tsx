'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { TableReportDocument, type PdfColumn } from '@/components/pdf/table-report-document';
import { ROLE_LABEL, downloadBlob, formatDateID, pdfFilename } from '@/lib/pdf/format';
import { SUBMISSION_TYPE_OPTIONS, ADAB_OPTIONS, SUBMISSION_STATUS_OPTIONS } from '../submission.schema';
import type { SubmissionTableData } from '../queries/list-my-submissions';

const TYPE_LABEL = Object.fromEntries(SUBMISSION_TYPE_OPTIONS.map((o) => [o.value, o.label]));
const ADAB_LABEL = Object.fromEntries(ADAB_OPTIONS.map((o) => [o.value, o.label]));
const STATUS_LABEL = Object.fromEntries(SUBMISSION_STATUS_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  table: Table<SubmissionTableData>;
  schoolInfo: { schoolName: string; schoolAddress: string | null };
  exportedBy: { name: string; role: string };
  periodLabel?: string;
  filterSummary?: string;
  own?: boolean;
  showClassroom?: boolean;
}

export function ExportSubmissionPdfButton({
  table,
  schoolInfo,
  exportedBy,
  periodLabel,
  filterSummary,
  own = false,
  showClassroom = false,
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
        { header: 'Tanggal', width: 9 },
        ...(own ? [] : ([{ header: 'NIS', width: 8 }, { header: 'Nama Siswa', width: 13 }] as PdfColumn[])),
        ...(showClassroom ? ([{ header: 'Kelas', width: 8 }] as PdfColumn[]) : []),
        ...(own ? [] : ([{ header: 'Kelompok', width: 9 }] as PdfColumn[])),
        { header: 'Jenis', width: 10 },
        { header: 'Detail', width: 18 },
        { header: 'Adab', width: 8 },
        { header: 'Status', width: 8 },
        { header: 'Catatan', width: 17 },
      ];
      // normalize widths to sum 100 regardless of which optional columns are included
      const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
      const normalizedColumns = columns.map((c) => ({ ...c, width: (c.width / totalWidth) * 100 }));

      const pdfRows = rows.map((row) => [
        formatDateID(row.date),
        ...(own ? [] : [row.nis, row.studentName]),
        ...(showClassroom ? [row.classroomName] : []),
        ...(own ? [] : [row.groupName]),
        TYPE_LABEL[row.submissionType] ?? row.submissionType,
        row.detail,
        ADAB_LABEL[row.adab] ?? row.adab,
        STATUS_LABEL[row.submissionStatus] ?? row.submissionStatus,
        row.note ?? '-',
      ]);

      const blob = await pdf(
        <TableReportDocument
          meta={{
            schoolName: schoolInfo.schoolName,
            schoolAddress: schoolInfo.schoolAddress,
            title: 'LAPORAN RIWAYAT SETORAN SISWA',
            periodLabel,
            filterSummary,
            exportedByName: exportedBy.name,
            exportedByRole: ROLE_LABEL[exportedBy.role] ?? exportedBy.role,
            totalCount: rows.length,
            totalLabel: 'setoran',
          }}
          columns={normalizedColumns}
          rows={pdfRows}
        />,
      ).toBlob();

      downloadBlob(blob, pdfFilename('setoran'));
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
