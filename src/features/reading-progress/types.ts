export type ProgressStatus = 'SELESAI' | 'SEDANG_DIJALANI' | 'BELUM_DIMULAI';

export interface ProgressItem {
  id: number;
  name: string;
  completed: number;
  total: number;
  percent: number;
  status: ProgressStatus;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  progress: ProgressItem[];
}

export function toStatus(completed: number, total: number): ProgressStatus {
  if (completed <= 0) return 'BELUM_DIMULAI';
  if (completed >= total) return 'SELESAI';
  return 'SEDANG_DIJALANI';
}

export const STATUS_LABEL: Record<ProgressStatus, string> = {
  SELESAI: 'Selesai',
  SEDANG_DIJALANI: 'Sedang Dijalani',
  BELUM_DIMULAI: 'Belum Dimulai',
};
