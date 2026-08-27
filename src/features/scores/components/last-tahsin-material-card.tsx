'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { NotebookPenIcon } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { updateLastTahsinMaterial } from '../actions/update-last-tahsin-material';

interface Props {
  studentId: string;
  groupId: string;
  initialValue: string | null;
}

export function LastTahsinMaterialCard({ studentId, groupId, initialValue }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [material, setMaterial] = useState(initialValue ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    setIsSubmitting(true);
    try {
      const result = await updateLastTahsinMaterial(studentId, groupId, material);
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setMaterial(initialValue ?? '');
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline">
            <NotebookPenIcon />
            Materi Tahsin Terakhir
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NotebookPenIcon className="size-5" />
            Materi Tahsin Terakhir
          </DialogTitle>
          <DialogDescription>Catat materi tahsin terakhir yang dipelajari siswa.</DialogDescription>
        </DialogHeader>

        <Textarea
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          rows={2}
          placeholder="Contoh: Wafa 3 halaman 20"
        />

        <DialogFooter>
          <Button onClick={handleSave} disabled={isSubmitting} className="w-full sm:w-auto">
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
