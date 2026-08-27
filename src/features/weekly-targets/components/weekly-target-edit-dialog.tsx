'use client';

import { useEffect, useState } from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import { WeeklyTargetFields, type WeeklyTargetFieldValues } from './weekly-target-fields';
import { getWeeklyTarget } from '../actions/get-weekly-target';
import { updateWeeklyTarget } from '../actions/update-weekly-target';
import type { ReferenceOption } from '@/features/quran-reference/queries/list-reference-options';

interface Props {
  targetId: string;
  surahOptions: ReferenceOption[];
  wafaOptions: ReferenceOption[];
}

export function WeeklyTargetEditDialog({ targetId, surahOptions, wafaOptions }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [values, setValues] = useState<WeeklyTargetFieldValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    getWeeklyTarget(targetId)
      .then((data) => {
        if (cancelled) return;
        setGroupId(data.groupId);
        setValues({
          type: data.type,
          startDate: data.startDate,
          endDate: data.endDate,
          description: data.description,
          status: data.status,
          progressPercent: data.progressPercent,
          surahStartId: data.surahStartId,
          surahEndId: data.surahEndId,
          startAyat: data.startAyat,
          endAyat: data.endAyat,
          wafaId: data.wafaId,
          startPage: data.startPage,
          endPage: data.endPage,
        });
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat data target');
        setOpen(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, targetId]);

  function handleChange<K extends keyof WeeklyTargetFieldValues>(key: K, value: WeeklyTargetFieldValues[K]) {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit() {
    if (!values?.startDate || !values.endDate || !groupId) {
      toast.error('Lengkapi rentang tanggal terlebih dahulu');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateWeeklyTarget(targetId, {
        ...values,
        groupId,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      });

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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Target Setoran</DialogTitle>
        </DialogHeader>

        {!values ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        ) : (
          <WeeklyTargetFields
            surahOptions={surahOptions}
            wafaOptions={wafaOptions}
            values={values}
            onChange={handleChange}
            showStatus
          />
        )}

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!values || isSubmitting} className="w-full sm:w-auto">
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
