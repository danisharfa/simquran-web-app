'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { updateLastTahsinMaterial } from '../actions/update-last-tahsin-material';

interface Props {
  studentId: string;
  groupId: string;
  initialValue: string | null;
}

export function LastTahsinMaterialCard({ studentId, groupId, initialValue }: Props) {
  const router = useRouter();
  const [material, setMaterial] = useState(initialValue ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    setIsSubmitting(true);
    try {
      const result = await updateLastTahsinMaterial(studentId, groupId, material);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={material}
        onChange={(e) => setMaterial(e.target.value)}
        rows={2}
        placeholder="Contoh: Wafa 3 halaman 20"
      />

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setMaterial(initialValue ?? '')}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Spinner />
              Menyimpan...
            </>
          ) : (
            'Simpan'
          )}
        </Button>
      </div>
    </div>
  );
}
