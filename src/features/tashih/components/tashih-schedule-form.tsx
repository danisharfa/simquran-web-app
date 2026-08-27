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
import { DatePicker } from '@/components/layouts/calendars/date-picker';
import { createTashihSchedule } from '../actions/create-tashih-schedule';
import type { SchedulableRequestOption } from '../queries/list-schedulable-requests';

interface Props {
  schedulableRequests: SchedulableRequestOption[];
}

export function TashihScheduleForm({ schedulableRequests }: Props) {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>();
  const [sessionName, setSessionName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
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
      const result = await createTashihSchedule({
        date: date.toISOString(),
        sessionName,
        startTime,
        endTime,
        location,
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
          Buat Jadwal Tashih
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePicker value={date} onChange={setDate} label="Tanggal" />

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
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Contoh: Ruang Tahfidz" />
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
                  htmlFor={`schedule-request-${req.id}`}
                  className="flex items-center gap-3 rounded-md border p-2 text-sm"
                >
                  <Checkbox
                    id={`schedule-request-${req.id}`}
                    checked={selectedIds.includes(req.id)}
                    onCheckedChange={(checked) => toggleRequest(req.id, !!checked)}
                  />
                  <span className="flex flex-1 items-center justify-between gap-2">
                    <span>{req.studentName}</span>
                    <span className="text-muted-foreground">{req.detail}</span>
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
