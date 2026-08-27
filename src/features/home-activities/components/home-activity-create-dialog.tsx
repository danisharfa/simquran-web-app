'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BookPlus } from 'lucide-react';

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
import { HomeActivityFields, type HomeActivityFieldValues } from './home-activity-fields';
import { createHomeActivity } from '../actions/create-home-activity';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

const INITIAL_VALUES: HomeActivityFieldValues = {
  date: undefined,
  activityType: 'MURAJAAH',
  juzId: null,
  surahId: null,
  startVerse: null,
  endVerse: null,
  note: '',
};

interface Props {
  groupName: string;
  surahOptions: ReferenceOption[];
  juzOptions: ReferenceOption[];
  surahJuzMap: SurahJuzMapping[];
}

export function HomeActivityCreateDialog({ groupName, surahOptions, juzOptions, surahJuzMap }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<HomeActivityFieldValues>(INITIAL_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange<K extends keyof HomeActivityFieldValues>(key: K, value: HomeActivityFieldValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!values.date || !values.juzId || !values.surahId || !values.startVerse || !values.endVerse) {
      toast.error('Lengkapi tanggal, juz, surah, dan ayat terlebih dahulu');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createHomeActivity({
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
      setValues(INITIAL_VALUES);
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
        if (!next) setValues(INITIAL_VALUES);
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <BookPlus />
            Input Aktivitas Rumah
          </Button>
        }
      />

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookPlus className="size-5" />
            Input Aktivitas Rumah
          </DialogTitle>
          <DialogDescription>Catat murajaah/tilawah/tarjamah mandiri untuk kelompok {groupName}.</DialogDescription>
        </DialogHeader>

        <HomeActivityFields
          surahOptions={surahOptions}
          juzOptions={juzOptions}
          surahJuzMap={surahJuzMap}
          values={values}
          onChange={handleChange}
        />

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Spinner />
                Menyimpan...
              </>
            ) : (
              'Simpan Aktivitas'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
