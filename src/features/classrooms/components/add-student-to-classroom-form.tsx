'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { assignStudentsToClassroom } from '../actions/assign-students-to-classroom';
import type { StudentOption } from '../actions/list-classroom-students';

interface Props {
  classroomId: string;
  students: StudentOption[];
}

export function AddStudentToClassroomForm({ classroomId, students }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleStudent(studentId: string, checked: boolean) {
    setSelectedIds((prev) =>
      checked ? [...prev, studentId] : prev.filter((id) => id !== studentId),
    );
  }

  async function handleSubmit() {
    setIsSubmitting(true);

    try {
      const result = await assignStudentsToClassroom(classroomId, selectedIds);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
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
          <UserPlus className="size-5" />
          Tambah Siswa
        </CardTitle>
        <CardDescription>Pilih siswa yang belum memiliki kelas untuk ditambahkan.</CardDescription>
      </CardHeader>

      <CardContent>
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ada siswa tanpa kelas.</p>
        ) : (
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {students.map((student) => (
              <label
                key={student.userId}
                htmlFor={`student-${student.userId}`}
                className="flex items-center gap-3 rounded-md border p-2 text-sm"
              >
                <Checkbox
                  id={`student-${student.userId}`}
                  checked={selectedIds.includes(student.userId)}
                  onCheckedChange={(checked) => toggleStudent(student.userId, checked)}
                />
                <span className="flex flex-1 items-center justify-between gap-2">
                  <span>{student.name}</span>
                  <span className="text-muted-foreground">{student.nis}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          type="button"
          className="w-full"
          disabled={selectedIds.length === 0 || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Spinner />
              Menyimpan...
            </>
          ) : (
            'Tambahkan Siswa ke Kelas'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
