'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarPlus } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Calendar22 } from '@/components/layouts/calendars/calendar-22';
import { BATCH_OPTIONS, STAGE_OPTIONS } from '../munaqasyah.schema';
import { createMunaqasyahSchedule } from '../actions/create-munaqasyah-schedule';
import type { SchedulableMunaqasyahRequest } from '../queries/list-schedulable-requests';
import type { TeacherOption } from '@/features/groups/queries/list-teachers';

const BATCH_LABEL = Object.fromEntries(BATCH_OPTIONS.map((o) => [o.value, o.label]));
const STAGE_LABEL = Object.fromEntries(STAGE_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  schedulableRequests: SchedulableMunaqasyahRequest[];
  teachers: TeacherOption[];
}

export function MunaqasyahScheduleForm({ schedulableRequests, teachers }: Props) {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>();
  const [sessionName, setSessionName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [examinerId, setExaminerId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const result = await createMunaqasyahSchedule({
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
      setDate(undefined);
      setSessionName('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setExaminerId('');
      setSelectedIds([]);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarPlus className="size-5" />
          Buat Jadwal Munaqasyah
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Calendar22 value={date} onChange={setDate} label="Tanggal" />

          <Field>
            <FieldLabel>Nama Sesi</FieldLabel>
            <Input value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder="Contoh: Sesi 1" />
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
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Contoh: Aula" />
          </Field>

          <Field>
            <FieldLabel>Penguji (Opsional)</FieldLabel>
            <Select value={examinerId} onValueChange={(v) => setExaminerId(v ?? '')}>
              <SelectTrigger>
                <SelectValue>{teachers.find((t) => t.userId === examinerId)?.name ?? 'Pilih penguji'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
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
          {schedulableRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada permintaan yang siap dijadwalkan.</p>
          ) : (
            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
              {schedulableRequests.map((req) => (
                <label
                  key={req.id}
                  htmlFor={`munaqasyah-schedule-request-${req.id}`}
                  className="flex items-center gap-3 rounded-md border p-2 text-sm"
                >
                  <Checkbox
                    id={`munaqasyah-schedule-request-${req.id}`}
                    checked={selectedIds.includes(req.id)}
                    onCheckedChange={(checked) => toggleRequest(req.id, !!checked)}
                  />
                  <span className="flex flex-1 items-center justify-between gap-2">
                    <span>{req.studentName}</span>
                    <span className="text-muted-foreground">
                      {BATCH_LABEL[req.batch]} &middot; {STAGE_LABEL[req.stage]} &middot; {req.juzName}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Spinner />
              Menyimpan...
            </>
          ) : (
            'Buat Jadwal'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
