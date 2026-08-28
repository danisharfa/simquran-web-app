import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatPrintedAtID } from '@/lib/pdf/format';

// react-pdf renders to a PDF canvas and can't read CSS custom properties/OKLCH,
// so this print palette is intentionally kept separate from the app's design tokens.
const PDF_COLOR = {
  headerBlue: '#2980B9',
  border: '#000',
  muted: '#666',
  stripe: '#f5f5f5',
} as const;

const styles = StyleSheet.create({
  page: { paddingTop: 8, paddingHorizontal: 24, paddingBottom: 40, fontSize: 8, fontFamily: 'Helvetica' },
  headerBlock: { marginBottom: 8 },
  schoolName: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  schoolAddress: { fontSize: 8, textAlign: 'center', color: PDF_COLOR.muted, marginTop: 2 },
  reportTitle: { fontSize: 11, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', marginTop: 6 },
  periodLabel: { fontSize: 9, textAlign: 'center', marginTop: 2 },
  filterSummary: { fontSize: 8, textAlign: 'center', color: PDF_COLOR.muted, marginTop: 2 },
  rule: { borderBottom: `1px solid ${PDF_COLOR.border}`, marginTop: 6, marginBottom: 6 },
  tableHead: { flexDirection: 'row', backgroundColor: PDF_COLOR.headerBlue, paddingVertical: 4 },
  tableHeadCell: { color: '#fff', fontWeight: 'bold', fontSize: 8, paddingHorizontal: 3 },
  tableRow: { flexDirection: 'row', paddingVertical: 3, borderBottom: '0.5px solid #ddd' },
  tableRowAlt: { backgroundColor: PDF_COLOR.stripe },
  tableCell: { fontSize: 8, paddingHorizontal: 3 },
  footer: { position: 'absolute', bottom: 16, left: 24, right: 24 },
  footerRule: { borderTop: '0.5px solid #999', marginBottom: 4 },
  footerText: { fontSize: 7, color: PDF_COLOR.muted },
  footerPage: { fontSize: 7, color: PDF_COLOR.muted, textAlign: 'center', marginTop: 2 },
});

export interface PdfColumn {
  header: string;
  width: number; // percentage, all columns for a table must sum to 100
  align?: 'left' | 'center' | 'right';
}

export interface TableReportMeta {
  schoolName: string;
  schoolAddress?: string | null;
  title: string;
  periodLabel?: string;
  filterSummary?: string;
  exportedByName: string;
  exportedByRole: string;
  totalCount: number;
  totalLabel: string;
}

interface TableReportDocumentProps {
  meta: TableReportMeta;
  columns: PdfColumn[];
  rows: string[][];
  orientation?: 'portrait' | 'landscape';
}

export function TableReportDocument({ meta, columns, rows, orientation = 'landscape' }: TableReportDocumentProps) {
  return (
    <Document>
      <Page size="A4" orientation={orientation} style={styles.page}>
        <View style={styles.headerBlock} fixed>
          <Text style={styles.schoolName}>{meta.schoolName.toUpperCase()}</Text>
          {meta.schoolAddress && <Text style={styles.schoolAddress}>{meta.schoolAddress}</Text>}
          <Text style={styles.reportTitle}>{meta.title}</Text>
          {meta.periodLabel && <Text style={styles.periodLabel}>{meta.periodLabel}</Text>}
          {meta.filterSummary && <Text style={styles.filterSummary}>Filter: {meta.filterSummary}</Text>}
          <View style={styles.rule} />
          <View style={styles.tableHead}>
            {columns.map((col, i) => (
              <Text key={i} style={[styles.tableHeadCell, { width: `${col.width}%`, textAlign: col.align ?? 'left' }]}>
                {col.header}
              </Text>
            ))}
          </View>
        </View>

        {rows.map((row, rowIndex) => (
          <View key={rowIndex} wrap={false} style={[styles.tableRow, ...(rowIndex % 2 === 1 ? [styles.tableRowAlt] : [])]}>
            {row.map((cell, cellIndex) => (
              <Text
                key={cellIndex}
                style={[
                  styles.tableCell,
                  { width: `${columns[cellIndex]?.width ?? 0}%`, textAlign: columns[cellIndex]?.align ?? 'left' },
                ]}
              >
                {cell}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <View style={styles.footerRule} />
          <Text style={styles.footerText}>
            Diekspor oleh {meta.exportedByName} ({meta.exportedByRole}) • Dicetak {formatPrintedAtID(new Date())} • Total{' '}
            {meta.totalCount} {meta.totalLabel}
          </Text>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
