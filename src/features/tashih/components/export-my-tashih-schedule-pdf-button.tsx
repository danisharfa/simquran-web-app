'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { TableReportDocument, type PdfColumn } from '@/components/pdf/table-report-document';
import { ROLE_LABEL, downloadBlob, formatDateID, pdfFilename } from '@/lib/pdf/format';
import type { MyTashihScheduleData } from '../queries/list-my-tashih-schedule';

interface Props {
  table: Table<MyTashihScheduleData>;
  own?: boolean;
  schoolInfo: { schoolName: string; schoolAddress: string | null };
  exportedBy: { name: string; role: string };
  periodLabel?: string;
  filterSummary?: string;
}

export function ExportMyTashihSchedulePdfButton({
  table,
  own = false,
  schoolInfo,
  exportedBy,
  periodLabel,
  filterSummary,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    const schedules = table.getFilteredRowModel().rows.map((r) => r.original);
    if (schedules.length === 0) {
      toast('Tidak ada data untuk diekspor.');
      return;
    }

    setLoading(true);
    try {
      const columns: PdfColumn[] = own
        ? [
            { header: 'Tanggal', width: 15 },
            { header: 'Sesi', width: 18 },
            { header: 'Waktu', width: 15 },
            { header: 'Lokasi', width: 22 },
            { header: 'Materi', width: 30 },
          ]
        : [
            { header: 'Tanggal', width: 9 },
            { header: 'Sesi', width: 10 },
            { header: 'Waktu', width: 9 },
            { header: 'Lokasi', width: 12 },
            { header: 'NIS', width: 8 },
            { header: 'Nama Siswa', width: 14 },
            { header: 'Kelas', width: 9 },
            { header: 'Kelompok', width: 9 },
            { header: 'Materi', width: 20 },
          ];

      const pdfRows = schedules.flatMap((schedule) => {
        const scheduleCells = [
          formatDateID(schedule.date),
          schedule.sessionName,
          `${schedule.startTime} - ${schedule.endTime}`,
          schedule.location,
        ];
        if (own) {
          return [[...scheduleCells, schedule.participants[0]?.detail ?? '-']];
        }
        if (schedule.participants.length === 0) {
          return [[...scheduleCells, '-', '-', '-', '-', 'Belum ada peserta']];
        }
        return schedule.participants.map((p) => [
          ...scheduleCells,
          p.nis,
          p.studentName,
          p.classroomName,
          p.groupName,
          p.detail,
        ]);
      });

      const totalParticipants = own
        ? schedules.length
        : schedules.reduce((sum, s) => sum + s.participants.length, 0);

      const blob = await pdf(
        <TableReportDocument
          meta={{
            schoolName: schoolInfo.schoolName,
            schoolAddress: schoolInfo.schoolAddress,
            title: 'LAPORAN JADWAL TASHIH',
            periodLabel,
            filterSummary,
            exportedByName: exportedBy.name,
            exportedByRole: ROLE_LABEL[exportedBy.role] ?? exportedBy.role,
            totalCount: totalParticipants,
            totalLabel: own ? 'jadwal' : `peserta (${schedules.length} sesi)`,
          }}
          columns={columns}
          rows={pdfRows}
        />,
      ).toBlob();

      downloadBlob(blob, pdfFilename('jadwal-tashih'));
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
