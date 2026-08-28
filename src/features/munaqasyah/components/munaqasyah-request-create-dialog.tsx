'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ClipboardList } from 'lucide-react';

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
import { MunaqasyahRequestFields, type MunaqasyahRequestFieldValues } from './munaqasyah-request-fields';
import { createMunaqasyahRequest } from '../actions/create-munaqasyah-request';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption } from '@/features/quran-reference/queries/list-reference-options';

const INITIAL_VALUES: MunaqasyahRequestFieldValues = {
  groupId: '',
  studentId: '',
  tahap: 'TAHAP_1',
  jenis: 'TASMI',
  juzId: null,
};

interface Props {
  groups: GroupWithStudents[];
  juzOptions: ReferenceOption[];
}

export function MunaqasyahRequestCreateDialog({ groups, juzOptions }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<MunaqasyahRequestFieldValues>(INITIAL_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setValues(INITIAL_VALUES);
  }

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
      reset();
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
          <Button>
            <ClipboardList />
            Ajukan Munaqasyah
          </Button>
        }
      />

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="size-5" />
            Pendaftaran Munaqasyah
          </DialogTitle>
          <DialogDescription>Ajukan Tasmi/Munaqasyah untuk siswa bimbingan Anda.</DialogDescription>
        </DialogHeader>

        <MunaqasyahRequestFields groups={groups} juzOptions={juzOptions} values={values} onChange={handleChange} />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
