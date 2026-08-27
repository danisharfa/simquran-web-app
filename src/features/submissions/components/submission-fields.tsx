'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/layouts/calendars/date-picker';
import { SUBMISSION_TYPE_OPTIONS, ADAB_OPTIONS, SUBMISSION_STATUS_OPTIONS } from '../submission.schema';
import { filterSurahOptionsByJuz } from '@/features/quran-reference/filter-surah-by-juz';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

export interface SubmissionFieldValues {
  groupId: string;
  studentId: string;
  date: Date | undefined;
  submissionType: 'TAHFIDZ' | 'TAHSIN_WAFA' | 'TAHSIN_ALQURAN';
  juzId: number | null;
  surahId: number | null;
  startVerse: number | null;
  endVerse: number | null;
  wafaId: number | null;
  startPage: number | null;
  endPage: number | null;
  adab: 'BAIK' | 'KURANG_BAIK' | 'TIDAK_BAIK';
  submissionStatus: 'LULUS' | 'TIDAK_LULUS' | 'MENGULANG';
  note: string;
}

interface Props {
  groups: GroupWithStudents[];
  surahOptions: ReferenceOption[];
  juzOptions: ReferenceOption[];
  surahJuzMap: SurahJuzMapping[];
  wafaOptions: ReferenceOption[];
  values: SubmissionFieldValues;
  onChange: <K extends keyof SubmissionFieldValues>(key: K, value: SubmissionFieldValues[K]) => void;
}

export function SubmissionFields({
  groups,
  surahOptions,
  juzOptions,
  surahJuzMap,
  wafaOptions,
  values,
  onChange,
}: Props) {
  const selectedGroup = groups.find((g) => g.id === values.groupId);
  const isWafa = values.submissionType === 'TAHSIN_WAFA';
  const filteredSurahOptions = filterSurahOptionsByJuz(surahOptions, surahJuzMap, values.juzId);

  return (
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
            <SelectValue>{selectedGroup?.name ?? 'Pilih kelompok'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Siswa</FieldLabel>
        <Select value={values.studentId} onValueChange={(v) => onChange('studentId', v ?? '')}>
          <SelectTrigger>
            <SelectValue>
              {selectedGroup?.students.find((s) => s.userId === values.studentId)?.name ??
                'Pilih siswa'}
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

      <DatePicker value={values.date} onChange={(d) => onChange('date', d)} label="Tanggal" />

      <Field>
        <FieldLabel>Jenis Setoran</FieldLabel>
        <Select
          value={values.submissionType}
          onValueChange={(v) => {
            onChange('submissionType', v as SubmissionFieldValues['submissionType']);
            onChange('juzId', null);
            onChange('surahId', null);
            onChange('startVerse', null);
            onChange('endVerse', null);
            onChange('wafaId', null);
            onChange('startPage', null);
            onChange('endPage', null);
          }}
        >
          <SelectTrigger>
            <SelectValue>
              {SUBMISSION_TYPE_OPTIONS.find((o) => o.value === values.submissionType)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SUBMISSION_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {isWafa ? (
        <>
          <Field>
            <FieldLabel>Buku Wafa</FieldLabel>
            <Select
              value={values.wafaId ? String(values.wafaId) : ''}
              onValueChange={(v) => onChange('wafaId', v ? Number(v) : null)}
            >
              <SelectTrigger>
                <SelectValue>
                  {wafaOptions.find((o) => o.id === values.wafaId)?.name ?? 'Pilih buku'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {wafaOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Halaman Mulai</FieldLabel>
              <Input
                type="number"
                value={values.startPage ?? ''}
                onChange={(e) => onChange('startPage', e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
            <Field>
              <FieldLabel>Halaman Akhir</FieldLabel>
              <Input
                type="number"
                value={values.endPage ?? ''}
                onChange={(e) => onChange('endPage', e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
          </div>
        </>
      ) : (
        <>
          <Field>
            <FieldLabel>Juz</FieldLabel>
            <Select
              value={values.juzId ? String(values.juzId) : ''}
              onValueChange={(v) => {
                onChange('juzId', v ? Number(v) : null);
                onChange('surahId', null);
              }}
            >
              <SelectTrigger>
                <SelectValue>
                  {juzOptions.find((o) => o.id === values.juzId)?.name ?? 'Pilih juz'}
                </SelectValue>
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

          <Field>
            <FieldLabel>Surah</FieldLabel>
            <Select
              value={values.surahId ? String(values.surahId) : ''}
              onValueChange={(v) => onChange('surahId', v ? Number(v) : null)}
            >
              <SelectTrigger>
                <SelectValue>
                  {filteredSurahOptions.find((o) => o.id === values.surahId)?.name ?? 'Pilih surah'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredSurahOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Ayat Mulai</FieldLabel>
              <Input
                type="number"
                value={values.startVerse ?? ''}
                onChange={(e) => onChange('startVerse', e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
            <Field>
              <FieldLabel>Ayat Akhir</FieldLabel>
              <Input
                type="number"
                value={values.endVerse ?? ''}
                onChange={(e) => onChange('endVerse', e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
          </div>
        </>
      )}

      <Field>
        <FieldLabel>Adab</FieldLabel>
        <Select value={values.adab} onValueChange={(v) => onChange('adab', v as SubmissionFieldValues['adab'])}>
          <SelectTrigger>
            <SelectValue>{ADAB_OPTIONS.find((o) => o.value === values.adab)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ADAB_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Status</FieldLabel>
        <Select
          value={values.submissionStatus}
          onValueChange={(v) => onChange('submissionStatus', v as SubmissionFieldValues['submissionStatus'])}
        >
          <SelectTrigger>
            <SelectValue>
              {SUBMISSION_STATUS_OPTIONS.find((o) => o.value === values.submissionStatus)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SUBMISSION_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field className="sm:col-span-2">
        <FieldLabel>Catatan</FieldLabel>
        <Textarea value={values.note} onChange={(e) => onChange('note', e.target.value)} rows={2} />
      </Field>
    </div>
  );
}
