import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GRADE_DESCRIPTION } from '../grade';
import { TAHSIN_TYPE_OPTIONS } from '../score.schema';
import type { ReportData } from '../queries/get-report';
import type { TahfidzScoreData } from '../queries/list-tahfidz-scores';
import type { TahsinScoreData } from '../queries/list-tahsin-scores';

const SEMESTER_LABEL: Record<string, string> = { GANJIL: 'Ganjil', GENAP: 'Genap' };

interface Props {
  studentName: string;
  nis: string;
  groupName: string;
  report: ReportData;
  tahfidzScores: TahfidzScoreData[];
  tahsinScores: TahsinScoreData[];
}

export function ReportView({ studentName, nis, groupName, report, tahfidzScores, tahsinScores }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-sm">Nama Siswa</p>
            <p className="font-medium">{studentName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">NIS</p>
            <p className="font-medium">{nis}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Kelompok</p>
            <p className="font-medium">{groupName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Periode</p>
            <p className="font-medium">
              {report.academicYear
                ? `${report.academicYear} · ${SEMESTER_LABEL[report.semester ?? ''] ?? ''}`
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Rata-rata Tahfidz</p>
            <p className="font-medium">{report.tahfidzScore != null ? report.tahfidzScore.toFixed(1) : '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Rata-rata Tahsin</p>
            <p className="font-medium">{report.tahsinScore != null ? report.tahsinScore.toFixed(1) : '-'}</p>
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <p className="text-muted-foreground text-sm">Materi Tahsin Terakhir</p>
            <p className="font-medium">{report.lastTahsinMaterial ?? '-'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nilai Tahfidz</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Surah</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Deskripsi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tahfidzScores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Belum ada nilai.
                  </TableCell>
                </TableRow>
              ) : (
                tahfidzScores.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.surahName}</TableCell>
                    <TableCell>{s.score}</TableCell>
                    <TableCell>
                      {s.grade} ({GRADE_DESCRIPTION[s.grade as 'A' | 'B' | 'C' | 'D']})
                    </TableCell>
                    <TableCell>{s.description ?? '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nilai Tahsin</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenis</TableHead>
                <TableHead>Topik</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Deskripsi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tahsinScores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Belum ada nilai.
                  </TableCell>
                </TableRow>
              ) : (
                tahsinScores.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{TAHSIN_TYPE_OPTIONS.find((o) => o.value === s.tahsinType)?.label}</TableCell>
                    <TableCell>{s.topic}</TableCell>
                    <TableCell>{s.score}</TableCell>
                    <TableCell>
                      {s.grade} ({GRADE_DESCRIPTION[s.grade as 'A' | 'B' | 'C' | 'D']})
                    </TableCell>
                    <TableCell>{s.description ?? '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
