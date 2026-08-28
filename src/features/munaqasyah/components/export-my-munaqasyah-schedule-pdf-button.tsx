'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { TableReportDocument, type PdfColumn } from '@/components/pdf/table-report-document';
import { ROLE_LABEL, downloadBlob, formatDateID, pdfFilename } from '@/lib/pdf/format';
import { TAHAP_OPTIONS, JENIS_UJIAN_OPTIONS } from '../munaqasyah.schema';
import type { MyMunaqasyahScheduleData } from '../queries/list-my-munaqasyah-schedule';

const TAHAP_LABEL = Object.fromEntries(TAHAP_OPTIONS.map((o) => [o.value, o.label]));
const JENIS_UJIAN_LABEL = Object.fromEntries(JENIS_UJIAN_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  table: Table<MyMunaqasyahScheduleData>;
  own?: boolean;
  schoolInfo: { schoolName: string; schoolAddress: string | null };
  exportedBy: { name: string; role: string };
  periodLabel?: string;
  filterSummary?: string;
}

export function ExportMyMunaqasyahSchedulePdfButton({
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
            { header: 'Tanggal', width: 13 },
            { header: 'Sesi', width: 15 },
            { header: 'Waktu', width: 13 },
            { header: 'Lokasi', width: 18 },
            { header: 'Tahap', width: 12 },
            { header: 'Jenis', width: 12 },
            { header: 'Materi (Juz)', width: 17 },
          ]
        : [
            { header: 'Tanggal', width: 9 },
            { header: 'Sesi', width: 10 },
            { header: 'Waktu', width: 9 },
            { header: 'Lokasi', width: 11 },
            { header: 'NIS', width: 8 },
            { header: 'Nama Siswa', width: 14 },
            { header: 'Kelas', width: 9 },
            { header: 'Kelompok', width: 10 },
            { header: 'Tahap', width: 8 },
            { header: 'Jenis', width: 8 },
            { header: 'Materi (Juz)', width: 4 },
          ];

      const pdfRows = schedules.flatMap((schedule) => {
        const scheduleCells = [
          formatDateID(schedule.date),
          schedule.sessionName,
          `${schedule.startTime} - ${schedule.endTime}`,
          schedule.location,
        ];
        if (own) {
          const p = schedule.participants[0];
          return [
            [
              ...scheduleCells,
              p ? (TAHAP_LABEL[p.tahap] ?? p.tahap) : '-',
              p ? (JENIS_UJIAN_LABEL[p.jenis] ?? p.jenis) : '-',
              p?.juzName ?? '-',
            ],
          ];
        }
        if (schedule.participants.length === 0) {
          return [[...scheduleCells, '-', '-', '-', '-', '-', '-', 'Belum ada peserta']];
        }
        return schedule.participants.map((p) => [
          ...scheduleCells,
          p.nis,
          p.studentName,
          p.classroomName,
          p.groupName,
          TAHAP_LABEL[p.tahap] ?? p.tahap,
          JENIS_UJIAN_LABEL[p.jenis] ?? p.jenis,
          p.juzName,
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
            title: 'LAPORAN JADWAL MUNAQASYAH',
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

      downloadBlob(blob, pdfFilename('jadwal-munaqasyah'));
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
