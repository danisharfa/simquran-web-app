'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { assignStudentsToClassroom } from '../actions/assign-students-to-classroom';
import type { StudentOption } from '../queries/list-classroom-students';

interface Props {
  classroomId: string;
  students: StudentOption[];
}

export function AddStudentToClassroomForm({ classroomId, students }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleStudent(studentId: string, checked: boolean) {
    setSelectedIds((prev) =>
      checked ? [...prev, studentId] : prev.filter((id) => id !== studentId),
    );
  }

  async function handleSubmit() {
    setIsSubmitting(true);

    try {
      const result = await assignStudentsToClassroom(classroomId, selectedIds);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setSelectedIds([]);
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
          <Button>
            <UserPlus />
            Tambah Siswa
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Tambah Siswa
          </DialogTitle>
          <DialogDescription>Pilih siswa yang belum memiliki kelas untuk ditambahkan.</DialogDescription>
        </DialogHeader>

        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ada siswa tanpa kelas.</p>
        ) : (
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {students.map((student) => (
              <label
                key={student.userId}
                htmlFor={`student-${student.userId}`}
                className="flex items-center gap-3 rounded-md border p-2 text-sm"
              >
                <Checkbox
                  id={`student-${student.userId}`}
                  checked={selectedIds.includes(student.userId)}
                  onCheckedChange={(checked) => toggleStudent(student.userId, checked)}
                />
                <span className="flex flex-1 items-center justify-between gap-2">
                  <span>{student.name}</span>
                  <span className="text-muted-foreground">{student.nis}</span>
                </span>
              </label>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelectedIds([])}
            disabled={selectedIds.length === 0 || isSubmitting}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={selectedIds.length === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Menyimpan...
              </>
            ) : (
              'Tambahkan Siswa ke Kelas'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
