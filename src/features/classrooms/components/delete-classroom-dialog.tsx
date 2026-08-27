'use client';

import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { deleteClassroom } from '../actions/delete-classroom';

interface Props {
  classroomId: string;
  classroomName: string;
  trigger?: ReactElement;
}

export function DeleteClassroomDialog({ classroomId, classroomName, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const result = await deleteClassroom(classroomId);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setOpen(false);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          trigger ?? (
            <Button variant="destructive">
              <Trash2 />
              Hapus Kelas
            </Button>
          )
        }
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Kelas</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus kelas &ldquo;{classroomName}&rdquo;? Tindakan ini
            tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
