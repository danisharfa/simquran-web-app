'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BookPlus } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { HomeActivityFields, type HomeActivityFieldValues } from './home-activity-fields';
import { createHomeActivity } from '../actions/create-home-activity';
import type { ReferenceOption } from '@/features/quran-reference/queries/list-reference-options';

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
}

export function HomeActivityForm({ groupName, surahOptions, juzOptions }: Props) {
  const router = useRouter();
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
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookPlus className="size-5" />
          Input Aktivitas Rumah
        </CardTitle>
        <p className="text-muted-foreground text-sm">Kelompok: {groupName}</p>
      </CardHeader>
      <CardContent>
        <HomeActivityFields
          surahOptions={surahOptions}
          juzOptions={juzOptions}
          values={values}
          onChange={handleChange}
        />
      </CardContent>
      <CardFooter>
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
      </CardFooter>
    </Card>
  );
}
