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
import { assignStudentsToGroup } from '../actions/assign-students-to-group';
import type { GroupStudentOption } from '../queries/list-group-students';

interface Props {
  groupId: string;
  students: GroupStudentOption[];
}

export function AddStudentToGroupForm({ groupId, students }: Props) {
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
      const result = await assignStudentsToGroup(groupId, selectedIds);

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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSelectedIds([]);
      }}
    >
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
          <DialogDescription>
            Pilih siswa dari kelas ini yang belum memiliki kelompok.
          </DialogDescription>
        </DialogHeader>

        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tidak ada siswa tanpa kelompok di kelas ini.
          </p>
        ) : (
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {students.map((student) => (
              <label
                key={student.userId}
                htmlFor={`group-student-${student.userId}`}
                className="flex items-center gap-3 rounded-md border p-2 text-sm"
              >
                <Checkbox
                  id={`group-student-${student.userId}`}
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
              'Tambahkan Siswa ke Kelompok'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
