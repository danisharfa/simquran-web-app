'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateTashihResult } from '../actions/update-tashih-result';

interface Props {
  resultId: string;
  initialPassed: boolean;
  initialNotes: string | null;
}

export function TashihResultEditDialog({ resultId, initialPassed, initialNotes }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [passed, setPassed] = useState(initialPassed ? 'true' : 'false');
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);

    try {
      const result = await updateTashihResult(resultId, passed === 'true', notes || null);

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
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Hasil Tashih</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Hasil</FieldLabel>
            <Select value={passed} onValueChange={(v) => setPassed(v as 'true' | 'false')}>
              <SelectTrigger>
                <SelectValue>{passed === 'true' ? 'Lulus' : 'Tidak Lulus'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Lulus</SelectItem>
                <SelectItem value="false">Tidak Lulus</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Catatan (opsional)</FieldLabel>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </Field>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Spinner />
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
