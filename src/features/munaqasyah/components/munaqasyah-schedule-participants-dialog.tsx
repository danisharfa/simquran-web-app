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
import { Badge } from '@/components/ui/badge';
import { BATCH_OPTIONS, STAGE_OPTIONS } from '../munaqasyah.schema';
import { BATCH_BADGE_CLASS, STAGE_BADGE_CLASS } from './munaqasyah-request-table';

const BATCH_LABEL = Object.fromEntries(BATCH_OPTIONS.map((o) => [o.value, o.label]));
const STAGE_LABEL = Object.fromEntries(STAGE_OPTIONS.map((o) => [o.value, o.label]));

interface Participant {
  requestId: string;
  studentName: string;
  batch: string;
  stage: string;
  juzName: string;
  groupName: string;
  classroomName: string;
}

interface Props {
  sessionName: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  participants: Participant[];
}

export function MunaqasyahScheduleParticipantsDialog({
  sessionName,
  date,
  startTime,
  endTime,
  location,
  participants,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon">
            <Users className="h-4 w-4" />
          </Button>
        }
      />

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Peserta Sesi</DialogTitle>
          <DialogDescription>
            {sessionName} &middot; {new Date(date).toLocaleDateString('id-ID')} &middot; {startTime}-{endTime}{' '}
            &middot; {location}
          </DialogDescription>
        </DialogHeader>

        {participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada peserta pada sesi ini.</p>
        ) : (
          <div className="divide-y">
            {participants.map((p) => (
              <div key={p.requestId} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{p.studentName}</span>
                  <div className="flex items-center gap-1">
                    <Badge className={BATCH_BADGE_CLASS[p.batch]}>{BATCH_LABEL[p.batch] ?? p.batch}</Badge>
                    <Badge className={STAGE_BADGE_CLASS[p.stage]}>{STAGE_LABEL[p.stage] ?? p.stage}</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>Juz: {p.juzName}</span>
                  <span>Kelompok: {p.groupName}</span>
                  <span>Kelas: {p.classroomName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
