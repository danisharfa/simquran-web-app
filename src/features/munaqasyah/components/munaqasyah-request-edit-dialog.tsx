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
import { MunaqasyahRequestFields, type MunaqasyahRequestFieldValues } from './munaqasyah-request-fields';
import { getMunaqasyahRequest } from '../actions/get-munaqasyah-request';
import { updateMunaqasyahRequest } from '../actions/update-munaqasyah-request';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption } from '@/features/quran-reference/queries/list-reference-options';

interface Props {
  requestId: string;
  groups: GroupWithStudents[];
  juzOptions: ReferenceOption[];
}

export function MunaqasyahRequestEditDialog({ requestId, groups, juzOptions }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<MunaqasyahRequestFieldValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    getMunaqasyahRequest(requestId)
      .then((data) => {
        if (cancelled) return;
        setValues(data);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat data permintaan');
        setOpen(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, requestId]);

  function handleChange<K extends keyof MunaqasyahRequestFieldValues>(key: K, value: MunaqasyahRequestFieldValues[K]) {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit() {
    if (!values?.groupId || !values.studentId || !values.juzId) {
      toast.error('Lengkapi kelompok, siswa, dan juz terlebih dahulu');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateMunaqasyahRequest(requestId, { ...values, juzId: values.juzId });

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
          <DialogTitle>Edit Permintaan Munaqasyah</DialogTitle>
        </DialogHeader>

        {!values ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        ) : (
          <MunaqasyahRequestFields groups={groups} juzOptions={juzOptions} values={values} onChange={handleChange} />
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
