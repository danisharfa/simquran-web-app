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
import { updateGroupName } from '../actions/update-group';

interface Props {
  groupId: string;
  currentName: string;
  trigger?: ReactElement;
}

export function EditGroupNameDialog({ groupId, currentName, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateGroupName(groupId, name);

      if (!result.success) {
        toast.error(result.error ?? 'Gagal memperbarui nama kelompok');
        return;
      }

      toast.success('Nama kelompok berhasil diperbarui');
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
              Edit Nama Kelompok
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-5" />
            Edit Nama Kelompok
          </DialogTitle>
          <DialogDescription>Perbarui nama kelompok ini.</DialogDescription>
        </DialogHeader>

        <form
          id="edit-group-name-form"
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <Field>
            <FieldLabel htmlFor="group-name">Nama Kelompok</FieldLabel>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kelompok A"
            />
          </Field>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="edit-group-name-form"
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
