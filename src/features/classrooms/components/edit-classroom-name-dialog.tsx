'use client';

import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldLabel } from '@/components/ui/field';
import { updateClassroomName } from '../actions/update-classroom';

interface Props {
  classroomId: string;
  currentName: string;
  trigger?: ReactElement;
}

export function EditClassroomNameDialog({ classroomId, currentName, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateClassroomName(classroomId, name);

      if (!result.success) {
        toast.error(result.error ?? 'Gagal memperbarui nama kelas');
        return;
      }

      toast.success('Nama kelas berhasil diperbarui');
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
        if (!next) setName(currentName);
      }}
    >
      <DialogTrigger
        render={
          trigger ?? (
            <Button variant="outline">
              <Pencil />
              Edit Nama Kelas
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-5" />
            Edit Nama Kelas
          </DialogTitle>
          <DialogDescription>Perbarui nama kelas ini.</DialogDescription>
        </DialogHeader>

        <form
          id="edit-classroom-name-form"
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <Field>
            <FieldLabel htmlFor="classroom-name">Nama Kelas</FieldLabel>
            <Input
              id="classroom-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ahmad"
            />
          </Field>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="edit-classroom-name-form"
            className="w-full sm:w-auto"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Menyimpan...
              </>
            ) : (
              'Simpan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
