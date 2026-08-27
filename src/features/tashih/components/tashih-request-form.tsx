'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ClipboardList } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { TashihRequestFields, type TashihRequestFieldValues } from './tashih-request-fields';
import { createTashihRequest } from '../actions/create-tashih-request';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

const INITIAL_VALUES: TashihRequestFieldValues = {
  groupId: '',
  studentId: '',
  tashihType: 'ALQURAN',
  juzId: null,
  surahId: null,
  wafaId: null,
  startPage: null,
  endPage: null,
  notes: '',
};

interface Props {
  groups: GroupWithStudents[];
  surahOptions: ReferenceOption[];
  juzOptions: ReferenceOption[];
  surahJuzMap: SurahJuzMapping[];
  wafaOptions: ReferenceOption[];
}

export function TashihRequestForm({ groups, surahOptions, juzOptions, surahJuzMap, wafaOptions }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<TashihRequestFieldValues>(INITIAL_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange<K extends keyof TashihRequestFieldValues>(key: K, value: TashihRequestFieldValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!values.groupId || !values.studentId) {
      toast.error('Lengkapi kelompok dan siswa terlebih dahulu');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createTashihRequest(values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setValues({ ...INITIAL_VALUES, groupId: values.groupId });
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="size-5" />
          Pendaftaran Tashih
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TashihRequestFields
          groups={groups}
          surahOptions={surahOptions}
          juzOptions={juzOptions}
          surahJuzMap={surahJuzMap}
          wafaOptions={wafaOptions}
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
            'Ajukan Tashih'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
