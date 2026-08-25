import type { StudentProgress } from './types';

export interface ChartDetailItem {
  studentName: string;
  percent: number;
  status: string;
  completed: number;
  total: number;
}

export interface ChartBar {
  name: string;
  selesai: number;
  sedangDijalani: number;
  belumDimulai: number;
  detail: ChartDetailItem[];
}

/** Ubah progres per-siswa menjadi data batang (jumlah siswa per status) untuk tiap juz/buku. */
export function aggregateForChart(studentsProgress: StudentProgress[]): ChartBar[] {
  if (studentsProgress.length === 0) return [];

  const itemCount = studentsProgress[0].progress.length;
  const bars: ChartBar[] = [];

  for (let i = 0; i < itemCount; i++) {
    const item = studentsProgress[0].progress[i];
    const detail: ChartDetailItem[] = [];
    let selesai = 0;
    let sedangDijalani = 0;
    let belumDimulai = 0;

    for (const student of studentsProgress) {
      const p = student.progress[i];
      if (p.status === 'SELESAI') selesai += 1;
      else if (p.status === 'SEDANG_DIJALANI') sedangDijalani += 1;
      else belumDimulai += 1;

      if (p.status !== 'BELUM_DIMULAI') {
        detail.push({
          studentName: student.studentName,
          percent: p.percent,
          status: p.status,
          completed: p.completed,
          total: p.total,
        });
      }
    }

    bars.push({ name: item.name, selesai, sedangDijalani, belumDimulai, detail });
  }

  return bars;
}
