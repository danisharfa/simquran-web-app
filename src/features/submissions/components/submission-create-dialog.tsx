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
import { SubmissionFields, type SubmissionFieldValues } from './submission-fields';
import { createSubmission } from '../actions/create-submission';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

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
  surahJuzMap: SurahJuzMapping[];
  wafaOptions: ReferenceOption[];
}

export function SubmissionCreateDialog({ groups, surahOptions, juzOptions, surahJuzMap, wafaOptions }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
            Input Setoran
          </Button>
        }
      />

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookPlus className="size-5" />
            Input Setoran
          </DialogTitle>
          <DialogDescription>Catat setoran harian tahfidz/tahsin siswa bimbingan Anda.</DialogDescription>
        </DialogHeader>

        <SubmissionFields
          groups={groups}
          surahOptions={surahOptions}
          juzOptions={juzOptions}
          surahJuzMap={surahJuzMap}
          wafaOptions={wafaOptions}
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
              'Simpan Setoran'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
