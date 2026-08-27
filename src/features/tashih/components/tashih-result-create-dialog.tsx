'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ClipboardCheck } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTashihResult } from '../actions/create-tashih-result';
import type { ScheduleWithPendingRequests } from '../queries/list-schedules-with-pending-requests';

interface Props {
  schedules: ScheduleWithPendingRequests[];
}

export function TashihResultCreateDialog({ schedules }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scheduleId, setScheduleId] = useState('');
  const [requestId, setRequestId] = useState('');
  const [passed, setPassed] = useState<'true' | 'false'>('true');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSchedule = schedules.find((s) => s.id === scheduleId);

  function reset() {
    setScheduleId('');
    setRequestId('');
    setPassed('true');
    setNotes('');
  }

  async function handleSubmit() {
    if (!requestId) {
      toast.error('Pilih jadwal dan peserta terlebih dahulu');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createTashihResult(requestId, passed === 'true', notes || null);

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
            <ClipboardCheck />
            Input Hasil
          </Button>
        }
      />

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="size-5" />
            Input Hasil Tashih
          </DialogTitle>
          <DialogDescription>Input hasil tashih untuk peserta yang sudah dijadwalkan.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Jadwal</FieldLabel>
              <Select
                value={scheduleId}
                onValueChange={(v) => {
                  setScheduleId(v ?? '');
                  setRequestId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue>{selectedSchedule?.label ?? 'Pilih jadwal'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Peserta</FieldLabel>
              <Select key={scheduleId} value={requestId} onValueChange={(v) => setRequestId(v ?? '')}>
                <SelectTrigger>
                  <SelectValue>
                    {selectedSchedule?.requests.find((r) => r.requestId === requestId)?.studentName ??
                      'Pilih peserta'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(selectedSchedule?.requests ?? []).map((req) => (
                    <SelectItem key={req.requestId} value={req.requestId}>
                      {req.studentName} — {req.detail}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Hasil</FieldLabel>
              <Select value={passed} onValueChange={(v) => setPassed(v as 'true' | 'false')}>
                <SelectTrigger>
                  <SelectValue>{passed === 'true' ? 'Lulus' : 'Tidak Lulus'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Lulus</SelectItem>
                  <SelectItem value="false">Tidak Lulus</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field>
            <FieldLabel>Catatan (opsional)</FieldLabel>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </Field>
        </div>

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
              'Simpan Hasil'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
