'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { TableReportDocument, type PdfColumn } from '@/components/pdf/table-report-document';
import { ROLE_LABEL, downloadBlob, formatDateID, pdfFilename } from '@/lib/pdf/format';
import { HOME_ACTIVITY_TYPE_OPTIONS, HOME_ACTIVITY_STATUS_OPTIONS } from '../home-activity.schema';
import type { HomeActivityTableData } from '../queries/list-own-home-activities';

const TYPE_LABEL = Object.fromEntries(HOME_ACTIVITY_TYPE_OPTIONS.map((o) => [o.value, o.label]));
const STATUS_LABEL = Object.fromEntries(HOME_ACTIVITY_STATUS_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  table: Table<HomeActivityTableData>;
  schoolInfo: { schoolName: string; schoolAddress: string | null };
  exportedBy: { name: string; role: string };
  periodLabel?: string;
  filterSummary?: string;
  own?: boolean;
  showClassroom?: boolean;
}

export function ExportHomeActivityPdfButton({
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
        { header: 'Detail', width: 20 },
        { header: 'Catatan', width: 18 },
        { header: 'Status', width: 10 },
      ];
      const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
      const normalizedColumns = columns.map((c) => ({ ...c, width: (c.width / totalWidth) * 100 }));

      const pdfRows = rows.map((row) => [
        formatDateID(row.date),
        ...(own ? [] : [row.nis, row.studentName]),
        ...(showClassroom ? [row.classroomName] : []),
        ...(own ? [] : [row.groupName]),
        TYPE_LABEL[row.activityType] ?? row.activityType,
        row.detail,
        row.note ?? '-',
        STATUS_LABEL[row.status] ?? row.status,
      ]);

      const blob = await pdf(
        <TableReportDocument
          meta={{
            schoolName: schoolInfo.schoolName,
            schoolAddress: schoolInfo.schoolAddress,
            title: 'LAPORAN AKTIVITAS RUMAH SISWA',
            periodLabel,
            filterSummary,
            exportedByName: exportedBy.name,
            exportedByRole: ROLE_LABEL[exportedBy.role] ?? exportedBy.role,
            totalCount: rows.length,
            totalLabel: 'aktivitas',
          }}
          columns={normalizedColumns}
          rows={pdfRows}
        />,
      ).toBlob();

      downloadBlob(blob, pdfFilename('aktivitas-rumah'));
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
