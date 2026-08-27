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
import { HomeActivityFields, type HomeActivityFieldValues } from './home-activity-fields';
import { getHomeActivity } from '../actions/get-home-activity';
import { updateHomeActivity } from '../actions/update-home-activity';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

interface Props {
  activityId: string;
  surahOptions: ReferenceOption[];
  juzOptions: ReferenceOption[];
  surahJuzMap: SurahJuzMapping[];
}

export function HomeActivityEditDialog({ activityId, surahOptions, juzOptions, surahJuzMap }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<HomeActivityFieldValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    getHomeActivity(activityId)
      .then((data) => {
        if (cancelled) return;
        setValues({
          date: data.date,
          activityType: data.activityType,
          juzId: data.juzId,
          surahId: data.surahId,
          startVerse: data.startVerse,
          endVerse: data.endVerse,
          note: data.note ?? '',
        });
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat data aktivitas');
        setOpen(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, activityId]);

  function handleChange<K extends keyof HomeActivityFieldValues>(key: K, value: HomeActivityFieldValues[K]) {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit() {
    if (!values?.date || !values.juzId || !values.surahId || !values.startVerse || !values.endVerse) {
      toast.error('Lengkapi tanggal, juz, surah, dan ayat terlebih dahulu');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateHomeActivity(activityId, {
        ...values,
        date: values.date.toISOString(),
        juzId: values.juzId,
        surahId: values.surahId,
        startVerse: values.startVerse,
        endVerse: values.endVerse,
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
          <DialogTitle>Edit Aktivitas Rumah</DialogTitle>
        </DialogHeader>

        {!values ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        ) : (
          <HomeActivityFields
            surahOptions={surahOptions}
            juzOptions={juzOptions}
            surahJuzMap={surahJuzMap}
            values={values}
            onChange={handleChange}
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
