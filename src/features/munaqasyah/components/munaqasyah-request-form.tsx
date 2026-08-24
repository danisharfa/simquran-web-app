'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ClipboardList } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { MunaqasyahRequestFields, type MunaqasyahRequestFieldValues } from './munaqasyah-request-fields';
import { createMunaqasyahRequest } from '../actions/create-munaqasyah-request';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption } from '@/features/quran-reference/queries/list-reference-options';

const INITIAL_VALUES: MunaqasyahRequestFieldValues = {
  groupId: '',
  studentId: '',
  batch: 'TAHAP_1',
  stage: 'TASMI',
  juzId: null,
};

interface Props {
  groups: GroupWithStudents[];
  juzOptions: ReferenceOption[];
}

export function MunaqasyahRequestForm({ groups, juzOptions }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<MunaqasyahRequestFieldValues>(INITIAL_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange<K extends keyof MunaqasyahRequestFieldValues>(key: K, value: MunaqasyahRequestFieldValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!values.groupId || !values.studentId || !values.juzId) {
      toast.error('Lengkapi kelompok, siswa, dan juz terlebih dahulu');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createMunaqasyahRequest({ ...values, juzId: values.juzId });

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
          Pendaftaran Munaqasyah
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MunaqasyahRequestFields groups={groups} juzOptions={juzOptions} values={values} onChange={handleChange} />
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Spinner />
              Menyimpan...
            </>
          ) : (
            'Ajukan Munaqasyah'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
