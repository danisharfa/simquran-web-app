'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudentReportPdf } from './student-report-pdf';
import type { ReportPdfData } from '../queries/get-report-pdf-data';

export function ExportReportPdfButton({ data }: { data: ReportPdfData }) {
  const fileName = `Rapor-${data.academicYear}-${data.semester}-${data.fullName.replace(/\s+/g, '_')}.pdf`;

  return (
    <PDFDownloadLink document={<StudentReportPdf data={data} />} fileName={fileName}>
      {({ loading }) => (
        <Button disabled={loading} variant="outline">
          <Download />
          {loading ? 'Menyiapkan...' : 'Ekspor PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
