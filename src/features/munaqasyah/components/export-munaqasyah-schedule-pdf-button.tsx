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
import type { MunaqasyahScheduleTableData } from '../queries/list-munaqasyah-schedules';

const TAHAP_LABEL = Object.fromEntries(TAHAP_OPTIONS.map((o) => [o.value, o.label]));
const JENIS_UJIAN_LABEL = Object.fromEntries(JENIS_UJIAN_OPTIONS.map((o) => [o.value, o.label]));

const COLUMNS: PdfColumn[] = [
  { header: 'Tanggal', width: 8 },
  { header: 'Sesi', width: 9 },
  { header: 'Waktu', width: 8 },
  { header: 'Lokasi', width: 9 },
  { header: 'Penguji', width: 10 },
  { header: 'NIS', width: 6 },
  { header: 'Nama Siswa', width: 11 },
  { header: 'Kelas', width: 7 },
  { header: 'Kelompok', width: 8 },
  { header: 'Tahap', width: 7 },
  { header: 'Jenis', width: 8 },
  { header: 'Materi (Juz)', width: 9 },
];

interface Props {
  table: Table<MunaqasyahScheduleTableData>;
  schoolInfo: { schoolName: string; schoolAddress: string | null };
  exportedBy: { name: string; role: string };
  periodLabel?: string;
  filterSummary?: string;
}

export function ExportMunaqasyahSchedulePdfButton({ table, schoolInfo, exportedBy, periodLabel, filterSummary }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    const schedules = table.getFilteredRowModel().rows.map((r) => r.original);
    if (schedules.length === 0) {
      toast('Tidak ada data untuk diekspor.');
      return;
    }

    setLoading(true);
    try {
      const pdfRows = schedules.flatMap((schedule) => {
        const scheduleCells = [
          formatDateID(schedule.date),
          schedule.sessionName,
          `${schedule.startTime} - ${schedule.endTime}`,
          schedule.location,
          schedule.examinerName ?? '-',
        ];
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

      const totalParticipants = schedules.reduce((sum, s) => sum + s.participants.length, 0);

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
            totalLabel: `peserta (${schedules.length} sesi)`,
          }}
          columns={COLUMNS}
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
