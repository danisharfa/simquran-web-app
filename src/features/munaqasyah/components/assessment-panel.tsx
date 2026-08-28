'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardCheck } from 'lucide-react';
import { JENIS_UJIAN_OPTIONS } from '../munaqasyah.schema';
import { TasmiAssessmentForm } from './tasmi-assessment-form';
import { MunaqasyahAssessmentForm } from './munaqasyah-assessment-form';
import type { PendingAssessment } from '../queries/list-my-pending-assessments';
import type { SurahInJuz } from '../queries/list-surahs-in-juz';

const JENIS_UJIAN_LABEL = Object.fromEntries(JENIS_UJIAN_OPTIONS.map((o) => [o.value, o.label]));

interface Props {
  pendingAssessments: PendingAssessment[];
  surahsByJuz: Record<number, SurahInJuz[]>;
}

export function AssessmentPanel({ pendingAssessments, surahsByJuz }: Props) {
  const [requestId, setRequestId] = useState('');

  const selected = pendingAssessments.find((a) => a.requestId === requestId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="size-5" />
          Penilaian Munaqasyah
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field>
          <FieldLabel>Peserta</FieldLabel>
          <Select value={requestId} onValueChange={(v) => setRequestId(v ?? '')}>
            <SelectTrigger>
              <SelectValue>
                {selected
                  ? `${selected.studentName} — ${JENIS_UJIAN_LABEL[selected.jenis]} — ${selected.juzName} (${selected.scheduleLabel})`
                  : 'Pilih peserta yang akan dinilai'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {pendingAssessments.map((a) => (
                <SelectItem key={a.requestId} value={a.requestId}>
                  {a.studentName} — {JENIS_UJIAN_LABEL[a.jenis]} — {a.juzName} ({a.scheduleLabel})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {selected && selected.jenis === 'TASMI' && (
          <TasmiAssessmentForm requestId={selected.requestId} surahs={surahsByJuz[selected.juzId] ?? []} />
        )}

        {selected && selected.jenis === 'MUNAQASYAH' && (
          <MunaqasyahAssessmentForm requestId={selected.requestId} />
        )}
      </CardContent>
    </Card>
  );
}
