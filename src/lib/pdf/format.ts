export const ROLE_LABEL: Record<string, string> = {
  SUPERADMIN: 'Admin',
  ADMIN: 'Admin',
  COORDINATOR: 'Koordinator',
  TEACHER: 'Guru',
  STUDENT: 'Siswa',
};

export function formatDateID(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatPrintedAtID(date: Date): string {
  return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function pdfFilename(slug: string): string {
  return `laporan-${slug}-${new Date().toISOString().slice(0, 10)}.pdf`;
}
