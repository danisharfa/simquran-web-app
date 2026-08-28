import { z } from 'zod';

export const TAHAP_OPTIONS = [
  { value: 'TAHAP_1', label: 'Tahap 1' },
  { value: 'TAHAP_2', label: 'Tahap 2' },
  { value: 'TAHAP_3', label: 'Tahap 3' },
  { value: 'TAHAP_4', label: 'Tahap 4' },
] as const;

export const JENIS_UJIAN_OPTIONS = [
  { value: 'TASMI', label: 'Tasmi' },
  { value: 'MUNAQASYAH', label: 'Munaqasyah' },
] as const;

export const STATUS_LABEL: Record<string, string> = {
  MENUNGGU: 'Menunggu',
  DITERIMA: 'Diterima',
  DITOLAK: 'Ditolak',
  SELESAI: 'Selesai',
};

export const GRADE_LABEL: Record<string, string> = {
  MUMTAZ: 'Mumtaz',
  JAYYID_JIDDAN: 'Jayyid Jiddan',
  JAYYID: 'Jayyid',
  TIDAK_LULUS: 'Tidak Lulus',
};

export const munaqasyahRequestSchema = z.object({
  groupId: z.string().min(1, 'Kelompok wajib dipilih'),
  studentId: z.string().min(1, 'Siswa wajib dipilih'),
  tahap: z.enum(['TAHAP_1', 'TAHAP_2', 'TAHAP_3', 'TAHAP_4']),
  jenis: z.enum(['TASMI', 'MUNAQASYAH']),
  juzId: z.number({ message: 'Juz wajib dipilih' }),
});

export type MunaqasyahRequestSchema = z.infer<typeof munaqasyahRequestSchema>;

export const munaqasyahScheduleSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  sessionName: z.string().min(1, 'Nama sesi wajib diisi').max(100, 'Nama sesi maksimal 100 karakter'),
  startTime: z.string().min(1, 'Waktu mulai wajib diisi'),
  endTime: z.string().min(1, 'Waktu akhir wajib diisi'),
  location: z.string().min(1, 'Lokasi wajib diisi').max(150, 'Lokasi maksimal 150 karakter'),
  examinerId: z.string().nullable(),
  requestIds: z.array(z.string()).min(1, 'Pilih minimal satu permintaan'),
});

export type MunaqasyahScheduleSchema = z.infer<typeof munaqasyahScheduleSchema>;
