'use client';

import { useState } from 'react';
import { BookOpenIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TahfidzScorePanel } from './tahfidz-score-panel';
import { TahsinScorePanel } from './tahsin-score-panel';
import { LastTahsinMaterialCard } from './last-tahsin-material-card';
import type { TahfidzScoreData } from '../queries/list-tahfidz-scores';
import type { TahsinScoreData } from '../queries/list-tahsin-scores';
import type { ReferenceOption } from '@/features/quran-reference/queries/list-reference-options';

interface Props {
  studentId: string;
  groupId: string;
  tahfidzScores: TahfidzScoreData[];
  tahsinScores: TahsinScoreData[];
  surahOptions: ReferenceOption[];
  lastTahsinMaterial: string | null;
}

export function ScoreInputDialog({
  studentId,
  groupId,
  tahfidzScores,
  tahsinScores,
  surahOptions,
  lastTahsinMaterial,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <BookOpenIcon />
            Input Nilai
          </Button>
        }
      />

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpenIcon className="size-5" />
            Penilaian Rapor
          </DialogTitle>
          <DialogDescription>Kelola nilai tahfidz, tahsin, dan materi tahsin terakhir siswa.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="tahfidz">
          <TabsList>
            <TabsTrigger value="tahfidz">Tahfidz</TabsTrigger>
            <TabsTrigger value="tahsin">Tahsin</TabsTrigger>
            <TabsTrigger value="materi">Materi Terakhir</TabsTrigger>
          </TabsList>

          <TabsContent value="tahfidz">
            <TahfidzScorePanel
              studentId={studentId}
              groupId={groupId}
              scores={tahfidzScores}
              surahOptions={surahOptions}
            />
          </TabsContent>

          <TabsContent value="tahsin">
            <TahsinScorePanel studentId={studentId} groupId={groupId} scores={tahsinScores} />
          </TabsContent>

          <TabsContent value="materi">
            <LastTahsinMaterialCard studentId={studentId} groupId={groupId} initialValue={lastTahsinMaterial} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
