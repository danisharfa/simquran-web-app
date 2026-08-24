'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BookPlus } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { SubmissionFields, type SubmissionFieldValues } from './submission-fields';
import { createSubmission } from '../actions/create-submission';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption } from '@/features/quran-reference/queries/list-reference-options';

const INITIAL_VALUES: SubmissionFieldValues = {
  groupId: '',
  studentId: '',
  date: undefined,
  submissionType: 'TAHFIDZ',
  juzId: null,
  surahId: null,
  startVerse: null,
  endVerse: null,
  wafaId: null,
  startPage: null,
  endPage: null,
  adab: 'BAIK',
  submissionStatus: 'LULUS',
  note: '',
};

interface Props {
  groups: GroupWithStudents[];
  surahOptions: ReferenceOption[];
  juzOptions: ReferenceOption[];
  wafaOptions: ReferenceOption[];
}

export function SubmissionForm({ groups, surahOptions, juzOptions, wafaOptions }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<SubmissionFieldValues>(INITIAL_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange<K extends keyof SubmissionFieldValues>(key: K, value: SubmissionFieldValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!values.groupId || !values.studentId || !values.date) {
      toast.error('Lengkapi kelompok, siswa, dan tanggal terlebih dahulu');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createSubmission({ ...values, date: values.date.toISOString() });

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
          <BookPlus className="size-5" />
          Input Setoran
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SubmissionFields
          groups={groups}
          surahOptions={surahOptions}
          juzOptions={juzOptions}
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
            'Simpan Setoran'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
