'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { exitStudent } from '../actions/exit-student';

type ExitStatus = 'PINDAH' | 'KELUAR';

const STATUS_OPTIONS: { value: ExitStatus; label: string }[] = [
  { value: 'PINDAH', label: 'Pindah Sekolah' },
  { value: 'KELUAR', label: 'Keluar Sekolah' },
];

interface Props {
  classroomId: string;
  studentId: string;
  studentName: string;
  groupName: string | null;
}

export function ExitStudentDialog({ classroomId, studentId, studentName, groupName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ExitStatus>('PINDAH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);

    try {
      const result = await exitStudent(classroomId, studentId, status);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <LogOut />
            Pindah/Keluar
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="size-5" />
            Tandai Pindah/Keluar Sekolah
          </DialogTitle>
          <DialogDescription>
            {groupName
              ? `${studentName} akan dikeluarkan dari kelas dan kelompok "${groupName}", akun login akan dinonaktifkan. Riwayat setoran, nilai, dan rapor tetap tersimpan.`
              : `${studentName} akan dikeluarkan dari kelas, akun login akan dinonaktifkan. Riwayat setoran, nilai, dan rapor tetap tersimpan.`}
          </DialogDescription>
        </DialogHeader>

        <Select value={status} onValueChange={(value) => setStatus(value as ExitStatus)}>
          <SelectTrigger>
            <SelectValue>{STATUS_OPTIONS.find((opt) => opt.value === status)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Memproses...
              </>
            ) : (
              'Konfirmasi'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
