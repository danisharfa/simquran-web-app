'use client';

import { Users } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { TashihScheduleTableData } from '../queries/list-tashih-schedules';

interface Props {
  schedule: TashihScheduleTableData;
}

export function TashihScheduleParticipantsDialog({ schedule }: Props) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon">
            <Users className="h-4 w-4" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Peserta Sesi</DialogTitle>
          <DialogDescription>
            {schedule.sessionName} · {new Date(schedule.date).toLocaleDateString('id-ID')} · {schedule.startTime}-
            {schedule.endTime} · {schedule.location}
          </DialogDescription>
        </DialogHeader>

        {schedule.participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada peserta pada sesi ini.</p>
        ) : (
          <div className="divide-y">
            {schedule.participants.map((p) => (
              <div key={p.requestId} className="flex flex-col gap-1 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{p.studentName}</span>
                  <span className="text-muted-foreground">{p.detail}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.groupName} · {p.classroomName}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
