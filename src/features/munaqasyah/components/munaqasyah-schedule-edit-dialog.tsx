'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/layouts/calendars/date-picker';
import { TAHAP_OPTIONS, JENIS_UJIAN_OPTIONS } from '../munaqasyah.schema';
import { getSchedulableMunaqasyahRequestsForEdit } from '../actions/get-schedulable-requests-for-edit';
import { updateMunaqasyahSchedule } from '../actions/update-munaqasyah-schedule';
import type { MunaqasyahScheduleTableData } from '../queries/list-munaqasyah-schedules';
import type { SchedulableMunaqasyahRequest } from '../queries/list-schedulable-requests';
import type { TeacherOption } from '@/features/groups/queries/list-teachers';

const TAHAP_LABEL = Object.fromEntries(TAHAP_OPTIONS.map((o) => [o.value, o.label]));
const JENIS_UJIAN_LABEL = Object.fromEntries(JENIS_UJIAN_OPTIONS.map((o) => [o.value, o.label]));
const NO_EXAMINER = '__NONE__';

interface Props {
  schedule: MunaqasyahScheduleTableData;
  teachers: TeacherOption[];
}

export function MunaqasyahScheduleEditDialog({ schedule, teachers }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date(schedule.date));
  const [sessionName, setSessionName] = useState(schedule.sessionName);
  const [startTime, setStartTime] = useState(schedule.startTime);
  const [endTime, setEndTime] = useState(schedule.endTime);
  const [location, setLocation] = useState(schedule.location);
  const [examinerId, setExaminerId] = useState(schedule.examinerId ?? '');
  const [selectedIds, setSelectedIds] = useState<string[]>(schedule.participants.map((p) => p.requestId));
  const [candidates, setCandidates] = useState<SchedulableMunaqasyahRequest[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    getSchedulableMunaqasyahRequestsForEdit(schedule.id)
      .then((data) => {
        if (cancelled) return;
        setCandidates(data);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat data permintaan');
        setOpen(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, schedule.id]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setCandidates(null);
      setDate(new Date(schedule.date));
      setSessionName(schedule.sessionName);
      setStartTime(schedule.startTime);
      setEndTime(schedule.endTime);
      setLocation(schedule.location);
      setExaminerId(schedule.examinerId ?? '');
      setSelectedIds(schedule.participants.map((p) => p.requestId));
    }
  }

  function toggleRequest(id: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((r) => r !== id)));
  }

  async function handleSubmit() {
    if (!date || !sessionName || !startTime || !endTime || !location || selectedIds.length === 0) {
      toast.error('Lengkapi semua field dan pilih minimal satu permintaan');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateMunaqasyahSchedule(schedule.id, {
        date: date.toISOString(),
        sessionName,
        startTime,
        endTime,
        location,
        examinerId: examinerId || null,
        requestIds: selectedIds,
      });

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-5" />
            Edit Jadwal Munaqasyah
          </DialogTitle>
          <DialogDescription>Perbarui detail sesi dan peserta Tasmi/Munaqasyah.</DialogDescription>
        </DialogHeader>

        {candidates === null ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DatePicker value={date} onChange={setDate} label="Tanggal" />

              <Field>
                <FieldLabel>Nama Sesi</FieldLabel>
                <Input
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Contoh: Sesi 1"
                  maxLength={100}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Waktu Mulai</FieldLabel>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel>Waktu Akhir</FieldLabel>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </Field>
              </div>

              <Field>
                <FieldLabel>Lokasi</FieldLabel>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Aula"
                  maxLength={150}
                />
              </Field>

              <Field>
                <FieldLabel>Penguji (opsional)</FieldLabel>
                <Select
                  value={examinerId || NO_EXAMINER}
                  onValueChange={(v) => setExaminerId(v === NO_EXAMINER ? '' : (v ?? ''))}
                >
                  <SelectTrigger>
                    <SelectValue>{teachers.find((t) => t.userId === examinerId)?.name ?? 'Tanpa penguji'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_EXAMINER}>Tanpa penguji</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.userId} value={teacher.userId}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel>Pilih Permintaan yang Diterima</FieldLabel>
              {candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada permintaan yang siap dijadwalkan.</p>
              ) : (
                <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                  {candidates.map((req) => (
                    <label
                      key={req.id}
                      htmlFor={`munaqasyah-schedule-edit-request-${req.id}`}
                      className="flex items-center gap-3 rounded-md border p-2 text-sm"
                    >
                      <Checkbox
                        id={`munaqasyah-schedule-edit-request-${req.id}`}
                        checked={selectedIds.includes(req.id)}
                        onCheckedChange={(checked) => toggleRequest(req.id, !!checked)}
                      />
                      <span className="flex flex-1 items-center justify-between gap-2">
                        <span>{req.studentName}</span>
                        <span className="text-muted-foreground">
                          {TAHAP_LABEL[req.tahap]} &middot; {JENIS_UJIAN_LABEL[req.jenis]} &middot; {req.juzName}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={candidates === null || isSubmitting} className="w-full sm:w-auto">
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
