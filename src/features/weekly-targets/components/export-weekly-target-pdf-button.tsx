'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { TableReportDocument, type PdfColumn } from '@/components/pdf/table-report-document';
import { ROLE_LABEL, downloadBlob, formatDateID, pdfFilename } from '@/lib/pdf/format';
import { TARGET_TYPE_OPTIONS, TARGET_STATUS_OPTIONS } from '../weekly-target.schema';
import type { WeeklyTargetTableData } from '../queries/list-my-weekly-targets';

const TYPE_LABEL = Object.fromEntries(TARGET_TYPE_OPTIONS.map((o) => [o.value, o.label]));
const STATUS_LABEL = Object.fromEntries(TARGET_STATUS_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  table: Table<WeeklyTargetTableData>;
  schoolInfo: { schoolName: string; schoolAddress: string | null };
  exportedBy: { name: string; role: string };
  periodLabel?: string;
  filterSummary?: string;
  own?: boolean;
}

export function ExportWeeklyTargetPdfButton({ table, schoolInfo, exportedBy, periodLabel, filterSummary, own = false }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original);
    if (rows.length === 0) {
      toast('Tidak ada data untuk diekspor.');
      return;
    }

    setLoading(true);
    try {
      const columns: PdfColumn[] = own
        ? [
            { header: 'No', width: 5, align: 'center' },
            { header: 'Jenis', width: 12 },
            { header: 'Target', width: 20 },
            { header: 'Periode', width: 16 },
            { header: 'Progress', width: 10, align: 'center' },
            { header: 'Status', width: 12 },
            { header: 'Deskripsi', width: 25 },
          ]
        : [
            { header: 'No', width: 3, align: 'center' },
            { header: 'NIS', width: 8 },
            { header: 'Nama Siswa', width: 13 },
            { header: 'Kelas', width: 8 },
            { header: 'Kelompok', width: 9 },
            { header: 'Jenis', width: 9 },
            { header: 'Target', width: 14 },
            { header: 'Periode', width: 13 },
            { header: 'Progress', width: 7, align: 'center' },
            { header: 'Status', width: 8 },
            { header: 'Deskripsi', width: 8 },
          ];

      const pdfRows = rows.map((row, i) => {
        const commonTail = [
          TYPE_LABEL[row.type] ?? row.type,
          row.detail,
          `${formatDateID(row.startDate)} - ${formatDateID(row.endDate)}`,
          `${row.progressPercent ?? 0}%`,
          STATUS_LABEL[row.status] ?? row.status,
          row.description,
        ];
        return own
          ? [String(i + 1), ...commonTail]
          : [String(i + 1), row.nis, row.studentName, row.classroomName, row.groupName, ...commonTail];
      });

      const blob = await pdf(
        <TableReportDocument
          meta={{
            schoolName: schoolInfo.schoolName,
            schoolAddress: schoolInfo.schoolAddress,
            title: 'LAPORAN TARGET SETORAN SISWA',
            periodLabel,
            filterSummary,
            exportedByName: exportedBy.name,
            exportedByRole: ROLE_LABEL[exportedBy.role] ?? exportedBy.role,
            totalCount: rows.length,
            totalLabel: 'target',
          }}
          columns={columns}
          rows={pdfRows}
        />,
      ).toBlob();

      downloadBlob(blob, pdfFilename('target-setoran'));
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
