import { prisma } from '@/lib/prisma';
import type { MunaqasyahJenisUjian } from '@/lib/generated/prisma/enums';

/**
 * Progress per juz+jenis dicatat lintas tahap dan tahun ajaran — begitu siswa lulus (atau masih
 * punya permintaan aktif) untuk suatu juz+jenis, ia tidak boleh didaftarkan ulang di tahap manapun.
 */
export async function findDuplicateMunaqasyahRequest(
  studentId: string,
  input: { juzId: number; jenis: MunaqasyahJenisUjian },
  excludeRequestId?: string,
) {
  return prisma.munaqasyahRequest.findFirst({
    where: {
      id: excludeRequestId ? { not: excludeRequestId } : undefined,
      studentId,
      juzId: input.juzId,
      jenis: input.jenis,
      OR: [{ status: { in: ['MENUNGGU', 'DITERIMA'] } }, { status: 'SELESAI', result: { passed: true } }],
    },
  });
}
