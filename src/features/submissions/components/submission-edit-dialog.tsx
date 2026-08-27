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
import { SubmissionFields, type SubmissionFieldValues } from './submission-fields';
import { getSubmission } from '../actions/get-submission';
import { updateSubmission } from '../actions/update-submission';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

interface Props {
  submissionId: string;
  groups: GroupWithStudents[];
  surahOptions: ReferenceOption[];
  juzOptions: ReferenceOption[];
  surahJuzMap: SurahJuzMapping[];
  wafaOptions: ReferenceOption[];
}

export function SubmissionEditDialog({
  submissionId,
  groups,
  surahOptions,
  juzOptions,
  surahJuzMap,
  wafaOptions,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<SubmissionFieldValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    getSubmission(submissionId)
      .then((data) => {
        if (cancelled) return;
        setValues({
          groupId: data.groupId,
          studentId: data.studentId,
          date: data.date,
          submissionType: data.submissionType,
          juzId: data.juzId,
          surahId: data.surahId,
          startVerse: data.startVerse,
          endVerse: data.endVerse,
          wafaId: data.wafaId,
          startPage: data.startPage,
          endPage: data.endPage,
          adab: data.adab,
          submissionStatus: data.submissionStatus,
          note: data.note ?? '',
        });
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat data setoran');
        setOpen(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, submissionId]);

  function handleChange<K extends keyof SubmissionFieldValues>(key: K, value: SubmissionFieldValues[K]) {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit() {
    if (!values || !values.groupId || !values.studentId || !values.date) {
      toast.error('Lengkapi kelompok, siswa, dan tanggal terlebih dahulu');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateSubmission(submissionId, { ...values, date: values.date.toISOString() });

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
          <DialogTitle>Edit Setoran</DialogTitle>
        </DialogHeader>

        {!values ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        ) : (
          <SubmissionFields
            groups={groups}
            surahOptions={surahOptions}
            juzOptions={juzOptions}
            surahJuzMap={surahJuzMap}
            wafaOptions={wafaOptions}
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
