'use client';

import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BATCH_OPTIONS, STAGE_OPTIONS } from '../munaqasyah.schema';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption } from '@/features/quran-reference/queries/list-reference-options';

export interface MunaqasyahRequestFieldValues {
  groupId: string;
  studentId: string;
  batch: 'TAHAP_1' | 'TAHAP_2' | 'TAHAP_3' | 'TAHAP_4';
  stage: 'TASMI' | 'MUNAQASYAH';
  juzId: number | null;
}

interface Props {
  groups: GroupWithStudents[];
  juzOptions: ReferenceOption[];
  values: MunaqasyahRequestFieldValues;
  onChange: <K extends keyof MunaqasyahRequestFieldValues>(key: K, value: MunaqasyahRequestFieldValues[K]) => void;
}

export function MunaqasyahRequestFields({ groups, juzOptions, values, onChange }: Props) {
  const selectedGroup = groups.find((g) => g.id === values.groupId);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>Kelompok</FieldLabel>
          <Select
            value={values.groupId}
            onValueChange={(v) => {
              onChange('groupId', v ?? '');
              onChange('studentId', '');
            }}
          >
            <SelectTrigger>
              <SelectValue>
                {selectedGroup ? `${selectedGroup.name} · ${selectedGroup.classroomName}` : 'Pilih kelompok'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name} · {group.classroomName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Siswa</FieldLabel>
          <Select key={values.groupId} value={values.studentId} onValueChange={(v) => onChange('studentId', v ?? '')}>
            <SelectTrigger>
              <SelectValue>
                {selectedGroup?.students.find((s) => s.userId === values.studentId)?.name ?? 'Pilih siswa'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(selectedGroup?.students ?? []).map((student) => (
                <SelectItem key={student.userId} value={student.userId}>
                  {student.name} ({student.nis})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field>
          <FieldLabel>Batch</FieldLabel>
          <Select value={values.batch} onValueChange={(v) => onChange('batch', v as MunaqasyahRequestFieldValues['batch'])}>
            <SelectTrigger>
              <SelectValue>{BATCH_OPTIONS.find((o) => o.value === values.batch)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {BATCH_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Tahap</FieldLabel>
          <Select value={values.stage} onValueChange={(v) => onChange('stage', v as MunaqasyahRequestFieldValues['stage'])}>
            <SelectTrigger>
              <SelectValue>{STAGE_OPTIONS.find((o) => o.value === values.stage)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Juz</FieldLabel>
          <Select
            value={values.juzId ? String(values.juzId) : ''}
            onValueChange={(v) => onChange('juzId', v ? Number(v) : null)}
          >
            <SelectTrigger>
              <SelectValue>{juzOptions.find((o) => o.id === values.juzId)?.name ?? 'Pilih juz'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {juzOptions.map((opt) => (
                <SelectItem key={opt.id} value={String(opt.id)}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}
